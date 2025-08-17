// LLM API Configuration for AI-driven MBTI Assessment
export interface LLMConfig {
  openRouterApiKey: string;
  sunraApiKey: string;
  baseUrls: {
    openRouter: string;
    sunra: string;
  };
}

export const llmConfig: LLMConfig = {
  openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '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',
  sunraApiKey: import.meta.env.VITE_SUNRA_API_KEY || '',
  baseUrls: {
    openRouter: 'https://openrouter.ai/api/v1',
    sunra: 'https://sunra.ai/api/v1'
  }
};

export interface LearningBehaviorData {
  userId: string;
  completedSections: string[];
  timeSpent: number;
  exerciseScores: number[];
  readingSpeed: number;
  vocabularyLearned: string[];
  interactionPatterns: {
    preferredLearningStyle: 'visual' | 'audio' | 'text' | 'interactive';
    attentionSpan: number;
    retryPatterns: number;
  };
  learningPreferences: {
    difficulty: 'easy' | 'medium' | 'hard';
    pacing: 'slow' | 'normal' | 'fast';
    engagement: number; // 1-10 scale
  };
}

export interface MBTIAssessmentResult {
  personality: string; // e.g., "ENFP"
  dimensions: {
    extroversion: number; // -100 to 100 (negative = introversion)
    sensing: number; // -100 to 100 (negative = intuition)
    thinking: number; // -100 to 100 (negative = feeling)
    judging: number; // -100 to 100 (negative = perceiving)
  };
  analysis: {
    learningStyle: string;
    strengths: string[];
    recommendations: string[];
    personalizedMessage: string;
  };
  confidence: number; // 0-100 percentage
}

// OpenRouter model configurations
export const OPENROUTER_MODELS = {
  GPT4: 'openai/gpt-4-turbo-preview',
  CLAUDE: 'anthropic/claude-3-sonnet-20240229',
  GEMINI: 'google/gemini-pro',
  GEMINI_FLASH: 'google/gemini-2.5-flash-lite', // New fast and cost-effective model
} as const;

export type OpenRouterModel = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS];