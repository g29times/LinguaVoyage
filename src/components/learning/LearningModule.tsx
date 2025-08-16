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

  // Debug logs
  console.log('🔍 LearningModule component mounted/updated');
  console.log('📝 Module ID from params:', moduleId);
  console.log('👤 User ID:', user?.id);
  console.log('🌐 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);

  // Get sections dynamically from module data ONLY - no more hardcoded fallback
  const sections = module ? 
    ['overview', ...Object.keys(module.content).sort(), 'summary'] : 
    ['overview']; // Minimal fallback during loading
  const currentSectionIndex = sections.indexOf(currentSection);
  
  // Track completion status for each section
  const [sectionCompletions, setSectionCompletions] = useState<{[key: string]: boolean}>({
    overview: false,
    reading: false,
    vocabulary: false,
    exercises: false,
    assessment: false
  });
  
  console.log('🔍 LearningModule: Dynamic sections array:', sections);
  console.log('🔍 LearningModule: Section completions:', sectionCompletions);
  console.log('🔍 LearningModule: Current section:', currentSection);
  console.log('🔍 LearningModule: Current section index:', currentSectionIndex);

  useEffect(() => {
    console.log('🔄 LearningModule useEffect triggered');
    console.log('📝 moduleId:', moduleId);
    console.log('👤 user:', user?.id);
    console.log('🔍 LearningModule: Current sections array length:', sections.length);
    
    if (moduleId && user) {
      console.log('✅ Conditions met, calling loadModuleAndProgress');
      loadModuleAndProgress();
    } else {
      console.log('❌ Conditions not met');
      console.log('   - moduleId exists:', !!moduleId);
      console.log('   - user exists:', !!user);
    }
  }, [moduleId, user?.id]);

  // SECTION CONSISTENCY DEBUG LOGS
  useEffect(() => {
    if (module) {
      console.log('🔍 SECTION CONSISTENCY CHECK:');
      console.log('📊 Database content sections:', Object.keys(module.content));
      console.log('📊 Frontend sections array:', sections);
      console.log('📊 Database sections count:', Object.keys(module.content).length);
      console.log('📊 Frontend sections count:', sections.length);
      console.log('📊 Sections match?', sections.length === Object.keys(module.content).length + 1); // +1 for overview
      console.log('📊 Expected total for progress:', Object.keys(module.content).length);
    }
  }, [module, sections]);


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
        console.log('🔍 LearningModule: Module query error:', moduleError);
        throw moduleError;
      }
      
      console.log('🔍 LearningModule: Module data loaded:', moduleData?.title);
      console.log('🔍 LearningModule: Module content sections:', Object.keys(moduleData?.content || {}));
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
    const completedCount = updatedProgressData.completed_sections.length;
    const totalSections = module ? Object.keys(module.content).length : 4; // Use actual content sections
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
    updateProgress({ current_section: section });
  };

  const completeSection = (sectionName: string) => {
    if (!userProgress) return;
    
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
      console.log('🚫 Cannot proceed - section not completed:', currentSection);
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
    console.log('✅ Marking section complete:', sectionName);
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
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Module not found'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
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
                  {module.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{module.estimated_time} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>{module.objectives.length} objectives</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Learning Objectives:</h3>
                <div className="flex flex-wrap gap-2">
                  {module.objectives.map((objective, index) => (
                    <Badge key={index} variant="outline">
                      {objective}
                    </Badge>
                  ))}
                </div>
              </div>

              {userProgress && (
                <ProgressTracker 
                  progress={userProgress}
                  totalSections={module ? Object.keys(module.content).length : 4}
                />
              )}

              <div className="pt-4">
                <Button onClick={() => {
                  markSectionComplete('overview');
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
            content={module.content.reading}
            onComplete={() => markSectionComplete('reading')}
            isCompleted={sectionCompletions.reading}
          />
        );

      case 'vocabulary':
        return (
          <VocabularySection 
            vocabulary={module.content.vocabulary}
            onComplete={() => markSectionComplete('vocabulary')}
            isCompleted={sectionCompletions.vocabulary}
          />
        );

      case 'exercises':
        return (
          <ExerciseSection 
            exercises={module.content.exercises}
            assessment={module.content.assessment}
            onComplete={(score) => {
              markSectionComplete('exercises');
              updateProgress({ 
                exercise_scores: { exercises: score },
                total_score: score
              });
            }}
            isCompleted={sectionCompletions.exercises}
          />
        );
        
      case 'assessment':
        return (
          <ExerciseSection 
            exercises={module.content.assessment || module.content.exercises}
            assessment={module.content.assessment}
            onComplete={(score) => {
              markSectionComplete('assessment');
              updateProgress({ 
                exercise_scores: { assessment: score },
                total_score: score
              });
            }}
            isCompleted={sectionCompletions.assessment}
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
              {userProgress && (
                <ProgressTracker 
                  progress={userProgress}
                  totalSections={sections.length - 1}
                  showDetails
                />
              )}

              <div className="text-center pt-6">
                <Button onClick={() => navigate('/dashboard')} className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/learning')}>
                  More Modules
                </Button>
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
              <p className="text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}: {currentSection}
              </p>
              <p className="text-xs text-gray-400">
                Debug: sections=[{sections.join(', ')}] | current={currentSection} | index={currentSectionIndex}
              </p>
            </div>
          </div>
          
          {userProgress && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Progress: {userProgress.progress_percentage}%
              </div>
              <Progress value={userProgress.progress_percentage} className="w-32" />
            </div>
          )}
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