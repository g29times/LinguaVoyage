import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProgressData {
  completedModules: string[];
  totalSessions: number;
  totalIP: number;
  weeklyIP: number;
  badges: string[];
}

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgressData>({
    completedModules: [],
    totalSessions: 0,
    totalIP: 0,
    weeklyIP: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reduced logging - only log on significant changes
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('🔍 useUserProgress: Current user:', user?.id);
    console.log('🔍 useUserProgress: Current progress state:', progress);
  }

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user ID, not entire user object

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get completed modules
      const { data: completedModules } = await supabase
        .from('app_24b6a0157d_user_module_progress')
        .select('module_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      console.log('🔍 useUserProgress: Raw completed modules from DB:', completedModules);

      // Get user profile for IP and badges - try different table names
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('app_24b6a0157d_user_profiles')
          .select('total_ip, unlocked_badges')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) {
          console.log('🔍 Profile table not found, trying alternative...', profileError);
          // Try alternative table name or create fallback
          const { data: altProfile } = await supabase
            .from('user_profiles')
            .select('total_ip, unlocked_badges')
            .eq('user_id', user.id)
            .single();
          profile = altProfile;
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.log('🔍 Profile lookup failed, using defaults:', error);
        profile = { total_ip: 0, unlocked_badges: [] };
      }

      // Calculate session count (completed modules count)
      const totalSessions = completedModules?.length || 0;

      // Calculate weekly IP (simplified - last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weeklyProgress } = await supabase
        .from('app_24b6a0157d_user_module_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', weekAgo.toISOString());

      const weeklyIP = (weeklyProgress?.length || 0) * 100; // Assume 100 IP per completed module

      const completedModuleIds = completedModules?.map(m => m.module_id) || [];
      console.log('🔍 useUserProgress: Completed module IDs:', completedModuleIds);
      console.log('🔍 useUserProgress: Total sessions:', totalSessions);

      setProgress({
        completedModules: completedModuleIds,
        totalSessions,
        totalIP: profile?.total_ip || 0,
        weeklyIP,
        badges: profile?.unlocked_badges || []
      });

    } catch (error) {
      console.error('Error loading user progress:', error);
      setError(error instanceof Error ? error.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  return { 
    userProgress: progress, // Map progress to userProgress for component compatibility
    progress, // Keep original for backward compatibility
    loading, 
    error, 
    refreshProgress: loadUserProgress 
  };
}