import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, MessageSquare, Trophy, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StoryProgress from '@/components/StoryProgress';
import LearningModuleCard from '@/components/LearningModuleCard';
import AICompanionCard from '@/components/AICompanionCard';
import GamificationPanel from '@/components/GamificationPanel';
import MBTIProgress from '@/components/MBTIProgress';
import RealWeeklyReport from '@/components/RealWeeklyReport';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { 
  mockLearningModules, 
  mockAICompanions, 
  mockBadges, 
  mockSpells, 
  mockWeeklyReport 
} from '@/lib/mockData';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, progress, updateUserProgress } = useUserData();
  const { progress: userProgress } = useUserProgress();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning');
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [userSpells, setUserSpells] = useState(() => {
    // Initialize spells with user's unlocked status
    return mockSpells.map(spell => ({
      ...spell,
      unlocked: progress?.unlocked_spells?.includes(spell.id) || false
    }));
  });

  const handleStartModule = (moduleId: string) => {
    console.log('🚀 Starting learning module:', moduleId);
    console.log('📍 Current location:', window.location.href);
    console.log('🔄 About to navigate...');
    
    try {
      // Always navigate to the learning module page
      // The LearningModule component will handle showing "Coming Soon" vs actual content
      if (moduleId === 'reading_1' || moduleId.includes('AI') || moduleId.includes('creative')) {
        console.log('✅ Matching condition, navigating to ai-creative-industries');
        console.log('🎯 Navigation target:', '/learning/ai-creative-industries');
        navigate('/learning/ai-creative-industries');
        console.log('🚀 Navigate function called successfully');
      } else {
        console.log('✅ Using direct moduleId navigation');
        console.log('🎯 Navigation target:', `/learning/${moduleId}`);
        navigate(`/learning/${moduleId}`);
        console.log('🚀 Navigate function called successfully');
      }
      
      // Check if location changed after a brief delay
      setTimeout(() => {
        console.log('⏰ After navigation - Current location:', window.location.href);
        console.log('⏰ After navigation - Current pathname:', window.location.pathname);
      }, 100);
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    }
  };

  const handleChatWithCompanion = (companionId: string) => {
    const companion = mockAICompanions.find(c => c.id === companionId);
    console.log('Chatting with companion:', companionId);
    alert(`Starting conversation with ${companion?.name}\n\n"${companion?.greeting_message}"\n\nThis would open the AI conversation interface.`);
  };

  const handleUnlockSpell = async (spellId: string) => {
    const spell = userSpells.find(s => s.id === spellId);
    const currentIP = progress?.total_ip || 0;
    
    if (spell && currentIP >= spell.ip_cost) {
      // Update local state
      setUserSpells(prev => prev.map(s => 
        s.id === spellId ? { ...s, unlocked: true } : s
      ));

      // Update database
      const newUnlockedSpells = [...(progress?.unlocked_spells || []), spellId];
      const newTotalIP = currentIP - spell.ip_cost;
      
      await updateUserProgress({
        unlocked_spells: newUnlockedSpells,
        total_ip: newTotalIP
      });

      alert(`Unlocked "${spell.name}"!\n\nThis spell is now active and enhancing your learning experience.`);
    }
  };

  const mbtiSpellUnlocked = userSpells.find(s => s.id === 'mbti_vision')?.unlocked || false;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayName}! 🚀
          </h1>
          <p className="text-gray-600">
            Continue your intelligent language journey with personalized AI-driven content
          </p>
        </div>

        {/* Weekly Report Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowWeeklyReport(true)}
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Weekly Intelligence Summary
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="companions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Companions
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-8">
            <StoryProgress />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Today's Learning Modules
                </CardTitle>
                <CardDescription>
                  Personalized micro-learning experiences tailored to your interests and proficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockLearningModules.map((module) => (
                    <LearningModuleCard
                      key={module.id}
                      module={module}
                      onStart={handleStartModule}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 Your AI Learning Companions
                </CardTitle>
                <CardDescription>
                  Each companion has evolved based on your learning patterns and personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockAICompanions.map((companion) => (
                    <AICompanionCard
                      key={companion.id}
                      companion={companion}
                      onChat={handleChatWithCompanion}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification">
            <GamificationPanel
              userIP={progress?.total_ip || 0}
              badges={mockBadges}
              spells={userSpells}
              onUnlockSpell={handleUnlockSpell}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <MBTIProgress 
              indicators={progress?.mbti_indicators || mockWeeklyReport.mbti_progress}
              spellUnlocked={mbtiSpellUnlocked}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>📈 Learning Analytics</CardTitle>
                <CardDescription>
                  Detailed insights into your language learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userProgress?.progress?.totalSessions > 0 ? Math.round((userProgress.progress.totalSessions / 10) * 100) : 0}%</div>
                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{(userProgress?.progress?.totalSessions || 0) * 25}</div>
                    <div className="text-sm text-muted-foreground">Words Learned</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round((userProgress?.progress?.totalSessions || 0) * 0.5)}</div>
                    <div className="text-sm text-muted-foreground">Hours Practiced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <RealWeeklyReport
          isOpen={showWeeklyReport}
          onClose={() => setShowWeeklyReport(false)}
        />
      </div>
    </div>
  );
}