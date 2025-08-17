import { User, Badge, Spell, LearningModule, AICompanion, WeeklyReport, NewsArticle, StoryChapter } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'user@linguavoyage.com',
  created_at: new Date('2024-01-15'),
  profile: {
    user_id: '1',
    display_name: 'Sarah Chen',
    learning_goals: ['Advanced vocabulary', 'Business English', 'Academic writing'],
    preferred_topics: ['Technology', 'Science', 'Business', 'Culture'],
    daily_time_commitment: 30,
    timezone: 'America/Los_Angeles',
    avatar_url: '/images/Professional.jpg'
  },
  streak: 24,
  total_ip: 3450,
  unlocked_badges: []
};

// Mock badges
export const mockBadges: Badge[] = [
  {
    id: 'diligent_apprentice',
    name: 'Diligent Apprentice',
    description: 'Complete 7 consecutive days of learning',
    icon: '🎓',
    unlock_condition: '7-day streak',
    rarity: 'common'
  },
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Learn 100 new words',
    icon: '📚',
    unlock_condition: '100 new words',
    rarity: 'rare'
  },
  {
    id: 'clear_communicator',
    name: 'Clear Communicator',
    description: 'Achieve 90% fluency in speaking exercises',
    icon: '🗣️',
    unlock_condition: '90% speaking fluency',
    rarity: 'epic'
  },
  {
    id: 'logic_architect',
    name: 'Logic Architect',
    description: 'Perfect score in 10 writing structure analyses',
    icon: '🏗️',
    unlock_condition: '10 perfect writing scores',
    rarity: 'legendary'
  }
];

// Mock spells
export const mockSpells: Spell[] = [
  {
    id: 'mbti_vision',
    name: 'MBTI Vision',
    description: 'View your personality profiling progress and insights',
    icon: '👁️',
    ip_cost: 25,
    category: 'progress',
    unlocked: false
  },
  {
    id: 'word_insight',
    name: 'Word Insight',
    description: 'Unlock advanced vocabulary analysis with etymology and usage patterns',
    icon: '✨',
    ip_cost: 50,
    category: 'vocabulary',
    unlocked: true
  },
  {
    id: 'linguistic_radar',
    name: 'Linguistic Radar',
    description: 'See detailed language pattern analysis in real-time',
    icon: '📡',
    ip_cost: 75,
    category: 'analysis',
    unlocked: false
  },
  {
    id: 'companion_bond',
    name: 'Companion Bond',
    description: 'Unlock deeper AI companion interactions and memory sharing',
    icon: '🤝',
    ip_cost: 120,
    category: 'social',
    unlocked: false
  }
];

// Mock story chapters
export const mockStoryChapters: StoryChapter[] = [
  {
    id: 'chapter_1',
    title: 'The Digital Renaissance',
    description: 'Explore how AI is transforming creative industries',
    chapter_number: 1,
    unlocked: false,
    completion_reward: 100
  },
  {
    id: 'chapter_2',
    title: 'Sustainable Futures',
    description: 'Investigate breakthrough technologies in renewable energy',
    chapter_number: 2,
    unlocked: false,
    completion_reward: 120
  },
  {
    id: 'chapter_3',
    title: 'The Psychology of Innovation',
    description: 'Understand what drives breakthrough thinking in modern organizations',
    chapter_number: 3,
    unlocked: false,
    completion_reward: 150
  },
  {
    id: 'chapter_4',
    title: 'Global Collaboration Networks',
    description: 'Examine how remote work is reshaping international business',
    chapter_number: 4,
    unlocked: false,
    completion_reward: 180
  }
];

// Mock learning modules
export const mockLearningModules: LearningModule[] = [
  {
    id: 'reading_1',
    type: 'reading',
    title: 'AI in Creative Industries',
    content: {
      article: 'The integration of artificial intelligence in creative fields has sparked both excitement and concern...',
      questions: ['What are the main applications of AI in creative industries?', 'How do artists view AI collaboration?']
    },
    estimated_duration: 8,
    difficulty_level: 7,
    learning_objectives: ['Advanced vocabulary', 'Critical analysis'],
    story_chapter: mockStoryChapters[0]
  },
  {
    id: 'listening_1',
    type: 'listening',
    title: 'Interactive Audio Experience',
    content: {
      audio_url: '/audio/tech-interview.mp3',
      transcript: '🚀 精彩听力内容即将上线！New listening modules launching soon with interactive audio experiences',
      tasks: ['Real-time pronunciation feedback', 'Adaptive listening exercises', 'Interactive audio content']
    },
    estimated_duration: 6,
    difficulty_level: 6,
    learning_objectives: ['Interactive audio content', 'Real-time pronunciation feedback', 'Adaptive listening exercises'],
    story_chapter: mockStoryChapters[0]
  },
  {
    id: 'speaking_1',
    type: 'speaking',
    title: 'AI Conversation Practice',
    content: {
      prompt: '✨ 智能口语练习功能开发中！Advanced AI-powered speaking practice coming soon',
      target_expressions: ['AI pronunciation coaching', 'Real-time feedback system', 'Interactive role-play scenarios']
    },
    estimated_duration: 10,
    difficulty_level: 8,
    learning_objectives: ['AI pronunciation coaching', 'Real-time feedback system', 'Interactive role-play scenarios'],
    story_chapter: mockStoryChapters[0]
  },
  {
    id: 'writing_1',
    type: 'writing',
    title: 'Smart Writing Assistant',
    content: {
      prompt: '🔥 AI写作助手即将发布！Intelligent writing coaching and feedback system in development', 
      requirements: ['AI-powered grammar checking', 'Style improvement suggestions', 'Personalized writing feedback']
    },
    estimated_duration: 15,
    difficulty_level: 7,
    learning_objectives: ['AI-powered grammar checking', 'Style improvement suggestions', 'Personalized writing feedback'],
    story_chapter: mockStoryChapters[0]
  }
];

// Mock AI companions
export const mockAICompanions: AICompanion[] = [
  {
    id: 'mentor_alex',
    name: 'Alex',
    persona: 'mentor',
    avatar: '👨‍🏫',
    greeting_message: 'Hello! I\'m here to guide you through your learning journey. What would you like to focus on today?',
    personality_traits: ['Encouraging', 'Patient', 'Knowledgeable']
  },
  {
    id: 'debater_sophia',
    name: 'Sophia',
    persona: 'debate_partner',
    avatar: '👩‍💼',
    greeting_message: 'Ready for a stimulating debate? I\'ll challenge your ideas to help you think more critically.',
    personality_traits: ['Analytical', 'Challenging', 'Sharp']
  },
  {
    id: 'interviewer_james',
    name: 'James',
    persona: 'interviewer',
    avatar: '👨‍💼',
    greeting_message: 'I\'ll conduct realistic interview scenarios to help you practice professional communication.',
    personality_traits: ['Professional', 'Thorough', 'Constructive']
  },
  {
    id: 'commentator_maya',
    name: 'Maya',
    persona: 'news_commentator',
    avatar: '👩‍📺',
    greeting_message: 'Let\'s discuss today\'s headlines and their deeper implications together.',
    personality_traits: ['Insightful', 'Current', 'Engaging']
  }
];

// Mock weekly report
export const mockWeeklyReport: WeeklyReport = {
  week_start: new Date('2024-01-08'),
  week_end: new Date('2024-01-14'),
  total_sessions: 6,
  total_ip_earned: 420,
  new_badges: [mockBadges[0]],
  mbti_progress: {
    extraversion_score: 0.6,
    sensing_score: 0.3,
    thinking_score: 0.8,
    judging_score: 0.7,
    confidence_level: 0.75,
    data_points: 45
  },
  learning_insights: [
    'Your vocabulary usage has improved by 15% this week',
    'You show strong analytical thinking in writing exercises',
    'Consider practicing more spontaneous speaking to improve fluency'
  ],
  next_week_suggestions: [
    'Try the advanced debate modules to challenge your argumentation skills',
    'Focus on idiomatic expressions in business contexts',
    'Explore the new sustainable technology articles'
  ]
};

// Mock news articles
export const mockNewsArticles: NewsArticle[] = [
  {
    id: 'article_1',
    title: 'Breakthrough in Quantum Computing Threatens Current Encryption',
    content: 'Recent advances in quantum computing have brought us closer to machines capable of breaking current encryption methods...',
    source: 'TechCrunch',
    published_at: new Date('2024-01-15'),
    topics: ['Technology', 'Security', 'Innovation'],
    difficulty_level: 8,
    estimated_reading_time: 12
  },
  {
    id: 'article_2',
    title: 'The Rise of Vertical Farming in Urban Centers',
    content: 'As cities grow and arable land becomes scarce, vertical farming presents a sustainable solution...',
    source: 'Scientific American',
    published_at: new Date('2024-01-14'),
    topics: ['Environment', 'Agriculture', 'Sustainability'],
    difficulty_level: 6,
    estimated_reading_time: 8
  }
];