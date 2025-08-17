import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { requestDeduplicator } from '@/utils/debounce';

interface UserProgressData {
  completedModules: string[];
  totalSessions: number;
  totalIP: number;
  weeklyIP: number;
  badges: string[];
}

// Short-lived cache to prevent bursty duplicate loads across multiple components
const PROGRESS_CACHE_TTL_MS = 5000;
let lastProgressCache: { userId: string; data: UserProgressData; ts: number } | null = null;

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

      // Serve from short-lived cache if valid
      if (
        lastProgressCache &&
        lastProgressCache.userId === user.id &&
        Date.now() - lastProgressCache.ts < PROGRESS_CACHE_TTL_MS
      ) {
        setProgress(lastProgressCache.data);
        return; // keep loading=true? We'll turn it off in finally
      }

      const key = `load-user-progress:${user.id}`;
      const data = await requestDeduplicator.deduplicate(key, async () => {
        // Single query for completed modules; compute weekly on client
        const { data: completedRows } = await supabase
          .from('app_24b6a0157d_user_module_progress')
          .select('module_id, status, completed_at')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // User-wide progress (IP/badges)
        let profile: { total_ip?: number; unlocked_badges?: string[] } = { total_ip: 0, unlocked_badges: [] };
        const { data: progData } = await supabase
          .from('app_24b6a0157d_user_progress')
          .select('total_ip, unlocked_badges')
          .eq('user_id', user.id)
          .maybeSingle();
        if (progData) profile = progData;

        const completedModuleIds = (completedRows || []).map((m: any) => m.module_id);
        const totalSessions = completedModuleIds.length;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyCompletedCount = (completedRows || []).filter((r: any) => r.completed_at && r.completed_at >= weekAgo.toISOString()).length;
        const weeklyIP = weeklyCompletedCount * 100; // Assume 100 IP per completed module

        const result: UserProgressData = {
          completedModules: completedModuleIds,
          totalSessions,
          totalIP: profile.total_ip || 0,
          weeklyIP,
          badges: profile.unlocked_badges || [],
        };

        return result;
      });

      // Update state and cache
      setProgress(data);
      lastProgressCache = { userId: user.id, data, ts: Date.now() };

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