import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { useButtonDebounce } from '@/hooks/useButtonDebounce';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';
import EmailVerificationPrompt from '@/components/auth/EmailVerificationPrompt';
import { Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const { user, emailVerified } = useAuth();
  const { profile, createUserProfile, loading } = useUserData();
  const { isLoading: isCreatingProfile, clickCount, executeWithDebounce } = useButtonDebounce(3000);
  const navigate = useNavigate();
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    console.log('🔄 Index useEffect - loading:', loading, 'profile:', !!profile, 'user:', !!user);
    
    if (!loading && user) {
      if (profile) {
        // Existing user with profile - go to dashboard
        console.log('✅ Existing user detected, staying on dashboard');
        setIsOnboarding(false);
      } else {
        // New user without profile - show onboarding
        console.log('🎯 New user detected, showing onboarding');
        setIsOnboarding(true);
      }
    }
  }, [user?.id, profile, loading]);

  const handleOnboardingComplete = async (data: {
    displayName: string;
    learningGoals: string[];
    preferredTopics: string[];
    timeCommitment: number;
    motivations: string;
  }) => {
    const result = await executeWithDebounce(async () => {
      console.log('🚀 Starting profile creation with debounce:', data);
      
      const { error, data: profileData } = await createUserProfile({
        display_name: data.displayName,
        learning_goals: data.learningGoals,
        preferred_topics: data.preferredTopics,
        daily_time_commitment: data.timeCommitment,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      console.log('📊 Profile creation result:', { error, profileData });

      // Check if we have actual data returned (success) vs real error  
      if (error && !profileData) {
        console.error('❌ Error creating user profile:', error);
        throw new Error('Failed to create profile. Please try again.');
      } else {
        console.log('✅ Profile created successfully! Redirecting to dashboard...');
        setIsOnboarding(false);
        // The useEffect will handle the transition to dashboard automatically
        return profileData;
      }
    });

    // 如果因为防抖被忽略，不显示错误
    if (result === null) {
      console.log('⚠️ Profile creation ignored due to debounce');
      return;
    }
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Setting up your learning environment...</p>
          </div>
        </div>
      ) : emailVerified === false ? (
        <EmailVerificationPrompt />
      ) : isOnboarding || !profile ? (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          isLoading={isCreatingProfile}
          clickCount={clickCount}
        />
      ) : (
        <Dashboard />
      )}
    </ProtectedRoute>
  );
}
