import { useState, useEffect, useRef } from 'react';
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
import { requestDeduplicator, createButtonDebouncer } from '@/utils/debounce';
import { 
  mockLearningModules, 
  mockAICompanions, 
  mockBadges, 
  mockSpells, 
  mockWeeklyReport 
} from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, progress, updateUserProgress } = useUserData();
  const { userProgress, refreshProgress } = useUserProgress();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning');
  const unlockDebouncerRef = useRef(createButtonDebouncer(1500));
  
  // Force refresh user progress when component mounts to get latest points
  useEffect(() => {
    if (user && refreshProgress) {
      console.log('💫 Dashboard: Refreshing user progress data...');
      refreshProgress();
    }
  }, [user]);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [userSpells, setUserSpells] = useState(() => {
    // Initialize spells with user's unlocked status
    return mockSpells.map(spell => ({
      ...spell,
      unlocked: progress?.unlocked_spells?.includes(spell.id) || false
    }));
  });

  // Keep local spells in sync with backend whenever progress updates
  useEffect(() => {
    setUserSpells(prev => prev.map(spell => ({
      ...spell,
      unlocked: !!progress?.unlocked_spells?.includes(spell.id),
    })));
  }, [progress?.unlocked_spells]);

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
    // For MBTI, the bottom entry should route to the assessment page.
    if (spellId === 'mbti_vision') {
      navigate('/mbti');
      return;
    }
    const spell = userSpells.find(s => s.id === spellId);
    const currentIP = (progress?.total_ip || userProgress?.totalIP || 0);

    if (!spell) return;

    // Already unlocked? prevent duplicate writes
    const alreadyUnlocked = (progress?.unlocked_spells || []).includes(spellId);
    if (alreadyUnlocked) {
      setUserSpells(prev => prev.map(s => s.id === spellId ? { ...s, unlocked: true } : s));
      return;
    }

    if (currentIP < spell.ip_cost) return;

    await unlockDebouncerRef.current.executeWithDebounce(async () => {
      // Update local state optimistically
      setUserSpells(prev => prev.map(s => s.id === spellId ? { ...s, unlocked: true } : s));

      // Build unique unlocked_spells
      const unique = new Set([...(progress?.unlocked_spells || []), spellId]);
      const newUnlockedSpells = Array.from(unique);

      const dedupeKey = `unlock-spell:${user?.id}:${spellId}`;
      await requestDeduplicator.deduplicate(dedupeKey, async () => {
        // Atomic spend + ledger with idempotency
        try {
          if (user) {
            const { error: rpcErr } = await supabase.rpc('fn_spend_ip_and_log', {
              p_user_id: user.id,
              p_amount: spell.ip_cost,
              p_activity: 'unlock_spell',
              p_description: `Unlock spell: ${spell.name}`,
              p_metadata: { spell_id: spell.id, spell_name: spell.name },
              p_idempotency_key: dedupeKey,
            });
            if (rpcErr) {
              console.error('❌ RPC spend failed for unlock:', rpcErr);
              throw rpcErr;
            }
          }
        } catch (e) {
          console.warn('⚠️ Unlock RPC failed, reverting optimistic UI.', e);
          // Revert optimistic local state if RPC fails
          setUserSpells(prev => prev.map(s => s.id === spellId ? { ...s, unlocked: false } : s));
          return;
        }

        // Update unlocked_spells (do not touch total_ip; RPC already deducted)
        await updateUserProgress({
          unlocked_spells: newUnlockedSpells,
        });
        if (refreshProgress) refreshProgress();
      });

      alert(`Unlocked "${spell.name}"!\n\nThis spell is now active and enhancing your learning experience.`);
    });
  };

  const mbtiSpellUnlocked = userSpells.find(s => s.id === 'mbti_vision')?.unlocked || false;
  // Prefer immediate source (progress.total_ip) updated by updateUserProgress, fallback to aggregated hook
  const userCurrentPoints = (progress?.total_ip || userProgress?.totalIP || 0);
  const canAccessMBTI = userCurrentPoints >= 25;

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

        {/* MBTI Assessment & Weekly Report Section */}
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          {/* MBTI Assessment Card */}
          <Card className={canAccessMBTI ? 
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" : 
            "bg-gray-100 border-gray-200"
          }>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center ${canAccessMBTI ? 'text-white' : 'text-gray-600'}`}>
                🧠 MBTI 性格评估
              </CardTitle>
              <CardDescription className={canAccessMBTI ? 'text-white/90' : 'text-gray-500'}>
                {canAccessMBTI ? 
                  'AI智能分析你的学习风格和性格特征' : 
                  `完成阅读课程解锁 (需要25积分，当前${userCurrentPoints}积分)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => navigate('/mbti')}
                className="w-full bg-white text-purple-600 hover:bg-gray-100"
              >
                🚀 开始AI评估 (当前积分: {userCurrentPoints})
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Report Button */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">📊 学习报告</CardTitle>
              <CardDescription className="text-gray-600">
                查看本周学习情况和AI分析
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => setShowWeeklyReport(true)}
                variant="outline"
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                查看本周报告
              </Button>
            </CardContent>
          </Card>
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
              userIP={userCurrentPoints}
              badges={mockBadges}
              spells={userSpells}
              onUnlockSpell={handleUnlockSpell}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <MBTIProgress 
              indicators={progress?.mbti_indicators || mockWeeklyReport.mbti_progress}
              spellUnlocked={mbtiSpellUnlocked}
              currentIP={userCurrentPoints}
              requiredIP={25}
              onUnlock={() => handleUnlockSpell('mbti_vision')}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>📈 Learning Analytics</CardTitle>
                <CardDescription>
                  Detailed insights into your language learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{(userProgress?.completedModules?.length || 0) * 8}</div>
                    <div className="text-sm text-muted-foreground">Words Learned</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round((userProgress?.totalSessions || 0) * 0.5)}</div>
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