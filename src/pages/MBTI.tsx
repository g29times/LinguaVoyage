import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIAssessmentResult } from '@/components/mbti/AIAssessmentResult';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserData } from '@/hooks/useUserData';

export default function MBTI() {
  const { user } = useAuth();
  const { userProgress, loading, refreshProgress } = useUserProgress();
  const { profile, progress } = useUserData();
  const navigate = useNavigate();

  // Force refresh data when component mounts to get latest points
  useEffect(() => {
    if (user && refreshProgress) {
      console.log('💫 MBTI: Refreshing user progress data...');
      refreshProgress();
    }
  }, [user]);

  // Debug logging to check data sync
  useEffect(() => {
    console.log('🔍 MBTI积分调试:', {
      userProgress,
      progress,
      profile,
      totalIP: userProgress?.totalIP,
      progressTotalIP: progress?.total_ip,
      loading,
      canAccess: (userProgress?.totalIP || progress?.total_ip || 0) >= 25
    });
  }, [userProgress, progress, profile, loading]);

  // Get current points from multiple possible sources
  const currentPoints = userProgress?.totalIP || progress?.total_ip || 0;
  const isUnlocked = !!progress?.unlocked_spells?.includes('mbti_vision');
  console.log('🚨 MBTI Gate Check:', { currentPoints, required: 25, isUnlocked, allow: isUnlocked || currentPoints >= 25 });
  
  // Allow access if already unlocked or has enough points
  const canAccessMBTI = isUnlocked || currentPoints >= 25;

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Show loading state while fetching user progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your progress...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessMBTI) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">MBTI Assessment Locked</h1>
            <p className="text-muted-foreground mb-6">
              You need {25 - currentPoints} more points to unlock the AI-powered MBTI assessment.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Complete your first reading lesson to earn 25 points and unlock this feature!
            </p>
            <Button onClick={() => navigate('/learning/chapter-1/reading')}>
              Start Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">AI-Powered MBTI Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Discover your personalized learning profile based on your study patterns
          </p>
        </div>

        <AIAssessmentResult 
          userId={user.id}
          onComplete={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
}