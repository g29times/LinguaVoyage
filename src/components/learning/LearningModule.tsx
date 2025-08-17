import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import ReadingContent from './ReadingContent';
import VocabularySection from './VocabularySection';
import ExerciseSection from './ExerciseSection';
import ProgressTracker from './ProgressTracker';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  estimated_time: number;
  objectives: string[];
  content: {
    reading: {
      title: string;
      content: string;
    };
    vocabulary: Array<{
      word: string;
      pronunciation: string;
      definition: string;
      example: string;
      context: string;
    }>;
    exercises: Array<{
      type: string;
      question: string;
      options?: string[];
      correct?: number;
      explanation?: string;
      pairs?: Array<{ word: string; definition: string }>;
      answer_type?: string;
      sample_answer?: string;
      keywords?: string[];
    }>;
    assessment: {
      passing_score: number;
      total_points: number;
      exercise_weights: Record<string, number>;
    };
  };
}

interface UserProgress {
  id?: string;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  progress_data: {
    current_section: string;
    completed_sections: string[];
    exercise_scores: Record<string, number>;
    total_score?: number;
  };
  started_at?: string;
  completed_at?: string;
}

export default function LearningModule() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState<LearningModule | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Fixed 5-section flow: overview -> reading -> vocabulary -> exercises -> summary
  // These are page navigation sections, not database field mappings
  const sections = ['overview', 'reading', 'vocabulary', 'exercises', 'summary'];
  const currentSectionIndex = sections.indexOf(currentSection);
  
  // Track completion status for each section - removed assessment
  const [sectionCompletions, setSectionCompletions] = useState<{[key: string]: boolean}>({
    overview: false,
    reading: false,
    vocabulary: false,
    exercises: false,
    summary: false
  });
  


  useEffect(() => {
    if (moduleId && user) {
      loadModuleAndProgress();
    }
  }, [moduleId, user?.id]);




  const loadModuleAndProgress = async () => {
    if (!moduleId || !user) return;

    try {
      setLoading(true);
      
      // Load module data - handle both UUID and title-based lookup
      let moduleQuery;
      if (moduleId === 'ai-creative-industries') {
        // Query by title for our special case
        moduleQuery = supabase
          .from('app_24b6a0157d_learning_modules')
          .select('*')
          .eq('title', 'AI in Creative Industries')
          .single();
      } else {
        // Query by ID for other cases
        moduleQuery = supabase
          .from('app_24b6a0157d_learning_modules')
          .select('*')
          .eq('id', moduleId)
          .single();
      }
      
      const { data: moduleData, error: moduleError } = await moduleQuery;

      if (moduleError) {
  
        throw moduleError;
      }
      

      setModule(moduleData);

      // Load user progress using the actual module ID from database
      const actualModuleId = moduleData.id;
      const { data: progressData, error: progressError } = await supabase
        .from('app_24b6a0157d_user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', actualModuleId)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (progressData) {
        setUserProgress(progressData);
        setCurrentSection(progressData.progress_data.current_section as any || 'overview');
        
        // Initialize section completions from database
        const completedFromDB = progressData.progress_data.completed_sections || [];
        const newCompletions = {
          overview: false,
          reading: false,
          vocabulary: false,
          exercises: false,
          summary: false
        };
        completedFromDB.forEach(section => {
          if (newCompletions.hasOwnProperty(section)) {
            newCompletions[section] = true;
          }
        });
        setSectionCompletions(newCompletions);
      } else {
        // Create initial progress record using actual module ID
        const initialProgress: Omit<UserProgress, 'id'> = {
          user_id: user.id,
          module_id: actualModuleId,
          status: 'in_progress',
          progress_percentage: 0,
          progress_data: {
            current_section: 'overview',
            completed_sections: [],
            exercise_scores: {}
          },
          started_at: new Date().toISOString()
        };

        const { data: newProgress, error: createError } = await supabase
          .from('app_24b6a0157d_user_module_progress')
          .insert(initialProgress)
          .select()
          .single();

        if (createError) throw createError;
        setUserProgress(newProgress);
      }
    } catch (err) {
      console.error('Error loading module:', err);
      setError('Failed to load learning module');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress['progress_data']>) => {
    if (!userProgress || !user) return;

    const updatedProgressData = { ...userProgress.progress_data, ...updates };
    
    // Only count actual learning sections: reading, vocabulary, exercises, summary
    // Filter out 'overview' from completed sections if it exists
    const validCompletedSections = updatedProgressData.completed_sections.filter(
      section => ['reading', 'vocabulary', 'exercises', 'summary'].includes(section)
    );
    const completedCount = validCompletedSections.length;
    
    // Update the progress data with filtered sections
    updatedProgressData.completed_sections = validCompletedSections;
    
    const totalSections = 4; // reading, vocabulary, exercises, summary
    const progressPercentage = Math.round((completedCount / totalSections) * 100);

    try {
      const { data, error } = await supabase
        .from('app_24b6a0157d_user_module_progress')
        .update({
          progress_data: updatedProgressData,
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? 'completed' : 'in_progress',
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProgress.id!)
        .select()
        .single();

      if (error) throw error;
      setUserProgress(data);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const goToSection = (section: typeof currentSection) => {
    setCurrentSection(section);
    // Only update current_section, do NOT mark as complete
    updateProgress({ current_section: section });
  };

  const completeSection = (sectionName: string) => {
    if (!userProgress) return;
    
    // Skip overview - it should not be added to completed_sections
    if (sectionName === 'overview') return;
    
    const completedSections = [...userProgress.progress_data.completed_sections];
    if (!completedSections.includes(sectionName)) {
      completedSections.push(sectionName);
      updateProgress({ completed_sections: completedSections });
    }
  };

  const canProceedToNext = () => {
    // Overview is always accessible
    if (currentSection === 'overview') return true;
    
    // Check if current section is completed
    return sectionCompletions[currentSection] || false;
  };

  const nextSection = () => {
    if (!canProceedToNext()) {
      return;
    }
    
    const nextIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
    const nextSectionName = sections[nextIndex];
    goToSection(nextSectionName as any);
  };

  const prevSection = () => {
    const prevIndex = Math.max(currentSectionIndex - 1, 0);
    const prevSectionName = sections[prevIndex];
    goToSection(prevSectionName as any);
  };

  const markSectionComplete = (sectionName: string) => {
    setSectionCompletions(prev => ({
      ...prev,
      [sectionName]: true
    }));
    completeSection(sectionName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading learning module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">精彩内容即将上线</h2>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">Exciting Content Coming Soon</h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              我们正在为您准备更多优质的学习体验，敬请期待！
            </p>
            <p className="text-sm text-gray-600">
              We are preparing more quality learning experiences for you. Please stay tuned!
            </p>
          </div>
          
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <p className="text-xs text-yellow-700">
                Debug info: {error}
              </p>
            </div>
          )}
          
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回学习中心 / Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{module.title}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </div>
                <Badge variant={module.level === 'advanced' ? 'destructive' : 'default'}>
                  {module.level || 'Beginner'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{module.estimated_time || 30} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>{module.objectives?.length || 0} objectives</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Learning Objectives:</h3>
                <div className="flex flex-wrap gap-2">
                  {module.objectives?.map((objective, index) => (
                    <Badge key={index} variant="outline">
                      {objective}
                    </Badge>
                  )) || <Badge variant="outline">No objectives available</Badge>}
                </div>
              </div>

              {userProgress && (
                <ProgressTracker 
                  progress={userProgress}
                  totalSections={4}
                />
              )}

              <div className="pt-4">
                <Button onClick={() => {
                  nextSection();
                }} className="w-full">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'reading':
        return (
          <ReadingContent 
            content={module.content?.reading || { title: 'Reading Content', content: 'Content not available' }}
            onComplete={() => markSectionComplete('reading')}
            isCompleted={sectionCompletions.reading}
          />
        );

      case 'vocabulary':
        return (
          <VocabularySection 
            vocabulary={module.content?.vocabulary || []}
            onComplete={() => markSectionComplete('vocabulary')}
            isCompleted={sectionCompletions.vocabulary}
          />
        );

      case 'exercises':
        return (
          <ExerciseSection 
            exercises={module.content?.exercises || []}
            assessment={module.content?.assessment || { passing_score: 80, total_points: 100, exercise_weights: {} }}
            onComplete={(score) => {
              // Mark exercises as complete and update all data in one call
              setSectionCompletions(prev => ({ ...prev, exercises: true }));
              
              const completedSections = [...(userProgress?.progress_data.completed_sections || [])];
              if (!completedSections.includes('exercises')) {
                completedSections.push('exercises');
              }
              
              const updatedExerciseScores = { 
                ...userProgress?.progress_data.exercise_scores,
                exercises: score 
              };
              
              // Single updateProgress call with all data
              updateProgress({ 
                completed_sections: completedSections,
                exercise_scores: updatedExerciseScores,
                total_score: score
              });
              
              // Auto-complete summary since it's just a display page
              setTimeout(() => {
                markSectionComplete('summary');
              }, 100);
            }}
            isCompleted={sectionCompletions.exercises}
          />
        );
        


      case 'summary':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">🎉 Module Completed!</CardTitle>
              <CardDescription>Congratulations on completing "{module.title}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment-based summary display */}
              {module.content?.assessment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Assessment Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Passing Score:</span>
                      <span className="ml-2 font-medium">{module.content.assessment.passing_score}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Points:</span>
                      <span className="ml-2 font-medium">{module.content.assessment.total_points}</span>
                    </div>
                  </div>
                </div>
              )}

              {userProgress && (
                <ProgressTracker 
                  progress={userProgress}
                  totalSections={4}
                  showDetails
                />
              )}

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevSection}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/learning')}>
                    More Modules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{module.title}</h1>
            </div>
          </div>
          

        </div>

        {/* Content */}
        {renderCurrentSection()}

        {/* Navigation */}
        {currentSection !== 'overview' && currentSection !== 'summary' && (
          <div className="flex justify-between max-w-4xl mx-auto mt-8">
            <Button 
              variant="outline" 
              onClick={prevSection}
              disabled={currentSectionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button 
              onClick={nextSection}
              disabled={currentSectionIndex === sections.length - 1 || !canProceedToNext()}
              className={!canProceedToNext() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Completion Status Warning */}
        {currentSection !== 'overview' && currentSection !== 'summary' && !canProceedToNext() && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800">
                📝 Complete this section to continue to the next step
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}