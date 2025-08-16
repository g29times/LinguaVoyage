import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { requestDeduplicator } from '@/utils/debounce';
import type { Database } from '@/lib/supabase';

type UserProfile = Database['public']['Tables']['app_24b6a0157d_user_profiles']['Row'];
type UserProgress = Database['public']['Tables']['app_24b6a0157d_user_progress']['Row'];

export function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProgress(null);
      setLoading(false);
      return;
    }

    fetchUserData();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const fetchUserData = async () => {
    if (!user?.id) return; // Remove loading guard that was causing issues

    setLoading(true);
    console.log('🔍 Fetching user data for:', user.id);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('app_24b6a0157d_user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
      } else if (profileData) {
        console.log('✅ Profile found:', profileData);
        setProfile(profileData);
      } else {
        console.log('ℹ️ No profile found for user');
        setProfile(null);
      }

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('app_24b6a0157d_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

      if (progressError) {
        console.error('❌ Error fetching progress:', progressError);
      } else if (progressData) {
        console.log('✅ Progress found:', progressData);
        setProgress(progressData);
      } else {
        console.log('ℹ️ No progress found for user');
        setProgress(null);
      }
    } catch (error) {
      console.error('❌ Error in fetchUserData:', error);
    } finally {
      setLoading(false);
      console.log('📊 fetchUserData completed');
    }
  };

  const createUserProfile = async (profileData: {
    display_name: string;
    learning_goals: string[];
    preferred_topics: string[];
    daily_time_commitment: number;
    timezone: string;
    avatar_url?: string;
  }) => {
    if (!user) return { error: new Error('No user logged in') };

    // 使用请求去重器，防止重复创建profile
    const deduplicationKey = `create-profile-${user.id}`;
    
    return await requestDeduplicator.deduplicate(deduplicationKey, async () => {
      console.log('🔄 Creating profile with data (deduplicated):', { user_id: user.id, ...profileData });

      try {
        const { data, error } = await supabase
          .from('app_24b6a0157d_user_profiles')
          .upsert({
            user_id: user.id,
            ...profileData,
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        console.log('📊 Supabase profile response:', { data, error });

        if (!error && data) {
          setProfile(data);
          console.log('✅ Profile set successfully, creating progress...');
          
          // Also create initial progress record
          await createUserProgress();
        }

        return { data, error };
      } catch (networkError) {
        console.error('❌ Network error during profile creation:', networkError);
        return { data: null, error: networkError };
      }
    });
  };

  const createUserProgress = async () => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('app_24b6a0157d_user_progress')
      .upsert({
        user_id: user.id,
        total_ip: 0,
        current_streak: 0,
        unlocked_badges: [],
        unlocked_spells: [],
        mbti_indicators: {
          extraversion_score: 0.5,
          sensing_score: 0.5,
          thinking_score: 0.5,
          judging_score: 0.5,
          confidence_level: 0.0,
          data_points: 0,
        },
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (!error && data) {
      setProgress(data);
    }

    return { data, error };
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: new Error('No user or profile found') };

    const { data, error } = await supabase
      .from('app_24b6a0157d_user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    if (!user || !progress) return { error: new Error('No user or progress found') };

    const { data, error } = await supabase
      .from('app_24b6a0157d_user_progress')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProgress(data);
    }

    return { data, error };
  };

  return {
    profile,
    progress,
    loading,
    createUserProfile,
    updateUserProfile,
    updateUserProgress,
    refreshUserData: fetchUserData,
  };
}