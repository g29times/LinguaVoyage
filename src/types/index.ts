// Core Types for LinguaVoyage
export interface User {
  id: string;
  email: string;
  created_at: Date;
  profile: UserProfile;
  streak: number;
  total_ip: number;
  unlocked_badges: Badge[];
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  learning_goals: string[];
  preferred_topics: string[];
  daily_time_commitment: number;
  timezone: string;
  avatar_url?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlock_condition: string;
  ip_cost?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  icon: string;
  ip_cost: number;
  category: 'vocabulary' | 'analysis' | 'progress' | 'social';
  unlocked: boolean;
}

export interface LearningModule {
  id: string;
  type: 'reading' | 'listening' | 'speaking' | 'writing';
  title: string;
  content: Record<string, unknown>;
  estimated_duration: number;
  difficulty_level: number;
  learning_objectives: string[];
  story_chapter?: StoryChapter;
}

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  chapter_number: number;
  unlocked: boolean;
  completion_reward: number;
}

export interface MBTIIndicators {
  extraversion_score: number;
  sensing_score: number;
  thinking_score: number;
  judging_score: number;
  confidence_level: number;
  data_points: number;
}

export interface AICompanion {
  id: string;
  name: string;
  persona: 'mentor' | 'debate_partner' | 'interviewer' | 'news_commentator';
  avatar: string;
  greeting_message: string;
  personality_traits: string[];
}

export interface LearningSession {
  id: string;
  user_id: string;
  modules: LearningModule[];
  completed_modules: string[];
  start_time: Date;
  end_time?: Date;
  total_ip_earned: number;
  performance_summary: PerformanceMetrics;
}

export interface PerformanceMetrics {
  accuracy: number;
  fluency: number;
  vocabulary_usage: number;
  grammar_score: number;
  engagement_level: number;
}

export interface WeeklyReport {
  week_start: Date;
  week_end: Date;
  total_sessions: number;
  total_ip_earned: number;
  new_badges: Badge[];
  mbti_progress: MBTIIndicators;
  learning_insights: string[];
  next_week_suggestions: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  published_at: Date;
  topics: string[];
  difficulty_level: number;
  estimated_reading_time: number;
}