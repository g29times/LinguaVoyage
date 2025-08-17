import { llmConfig, LearningBehaviorData, MBTIAssessmentResult } from '@/lib/llm-config';
import { supabase } from '@/lib/supabase';

export class MBTIAssessmentService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = llmConfig.openRouterApiKey;
    this.baseUrl = llmConfig.baseUrls.openRouter;
  }

  private async callEdgeFunction(prompt: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('mbti-assess', {
      body: {
        prompt,
        model: 'google/gemini-2.5-flash-lite',
      },
    });

    if (error) {
      throw error;
    }

    // New: Edge Function now returns structured JSON. If so, stringify for a unified parser.
    if (data && typeof data === 'object') {
      const d: any = data;
      if ('personality' in d && 'dimensions' in d && 'analysis' in d) {
        return JSON.stringify(d);
      }
      if (typeof d.content === 'string') {
        return d.content as string; // backward compatibility
      }
      return JSON.stringify(d);
    }
    if (typeof data === 'string') return data as string;
    return JSON.stringify(data ?? {});
  }

  /**
   * Generate AI-driven MBTI assessment based on learning behavior
   */
  async generateAssessment(behaviorData: LearningBehaviorData): Promise<MBTIAssessmentResult> {
    try {
      const prompt = this.createAssessmentPrompt(behaviorData);
      // Always prefer server-side function (security & observability)
      try {
        const edgeContent = await this.callEdgeFunction(prompt);
        return this.parseAssessmentResult(edgeContent);
      } catch (edgeError) {
        console.warn('Edge function failed, falling back to local heuristic:', edgeError);
        // Final fallback: local heuristic only (no direct OpenRouter call from frontend)
        return this.fallbackAssessment(behaviorData);
      }
    } catch (error) {
      console.error('MBTI Assessment Error:', error);
      // Fallback to basic assessment if API fails
      return this.fallbackAssessment(behaviorData);
    }
  }

  private createAssessmentPrompt(data: LearningBehaviorData): string {
    return `
You are an expert personality psychologist specializing in MBTI assessment through learning behavior analysis. 

Analyze the following learning behavior data and provide a detailed MBTI personality assessment:

LEARNING BEHAVIOR DATA:
- User completed sections: ${data.completedSections.join(', ')}
- Total learning time: ${data.timeSpent} minutes
- Exercise scores: ${data.exerciseScores.join(', ')}
- Reading speed: ${data.readingSpeed} words/minute
- Vocabulary learned: ${data.vocabularyLearned.length} words
- Preferred learning style: ${data.interactionPatterns.preferredLearningStyle}
- Attention span: ${data.interactionPatterns.attentionSpan} minutes
- Retry patterns: ${data.interactionPatterns.retryPatterns} attempts
- Difficulty preference: ${data.learningPreferences.difficulty}
- Learning pacing: ${data.learningPreferences.pacing}
- Engagement level: ${data.learningPreferences.engagement}/10

ANALYSIS REQUIREMENTS:
1. Determine MBTI type based on learning patterns
2. Provide dimensional scores (-100 to 100 for each dimension)
3. Analyze learning style preferences
4. Identify personality-based strengths
5. Give personalized learning recommendations
6. Create an encouraging, personalized message

RESPONSE FORMAT (JSON only):
{
  "personality": "XXXX",
  "dimensions": {
    "extroversion": number,
    "sensing": number,
    "thinking": number,
    "judging": number
  },
  "analysis": {
    "learningStyle": "description of their learning style",
    "strengths": ["strength1", "strength2", "strength3"],
    "recommendations": ["rec1", "rec2", "rec3"],
    "personalizedMessage": "encouraging message about their learning journey"
  },
  "confidence": number
}

Focus on:
- Extroversion vs Introversion: Group learning vs solo learning preferences
- Sensing vs Intuition: Detail-oriented vs big-picture learning
- Thinking vs Feeling: Logical vs emotional engagement patterns
- Judging vs Perceiving: Structured vs flexible learning approach

Provide insights that will help them on their language learning journey!
`;
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://linguavoyage.app',
        'X-Title': 'LinguaVoyage MBTI Assessment'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: 'You are an expert MBTI personality assessment AI focused on learning behavior analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseAssessmentResult(apiResponse: string): MBTIAssessmentResult {
    try {
      const parsed = JSON.parse(apiResponse);
      
      // Validate the response structure
      if (!parsed.personality || !parsed.dimensions || !parsed.analysis) {
        throw new Error('Invalid API response structure');
      }

      return {
        personality: parsed.personality,
        dimensions: {
          extroversion: this.clampDimension(parsed.dimensions.extroversion),
          sensing: this.clampDimension(parsed.dimensions.sensing),
          thinking: this.clampDimension(parsed.dimensions.thinking),
          judging: this.clampDimension(parsed.dimensions.judging)
        },
        analysis: {
          learningStyle: parsed.analysis.learningStyle || 'Adaptive learner',
          strengths: Array.isArray(parsed.analysis.strengths) ? parsed.analysis.strengths : ['Quick learner', 'Dedicated', 'Curious'],
          recommendations: Array.isArray(parsed.analysis.recommendations) ? parsed.analysis.recommendations : ['Continue regular practice', 'Explore diverse content', 'Set learning goals'],
          personalizedMessage: parsed.analysis.personalizedMessage || 'You\'re doing great on your learning journey!'
        },
        // Normalize confidence: support models returning 0..1 or 0..100
        confidence: (() => {
          const raw = parsed.confidence;
          let val = typeof raw === 'number' ? (raw <= 1 ? raw * 100 : raw) : 85;
          return Math.min(100, Math.max(0, val));
        })()
      };
    } catch (error) {
      console.error('Failed to parse assessment result:', error);
      throw new Error('Failed to process AI assessment response');
    }
  }

  private clampDimension(value: number): number {
    return Math.min(100, Math.max(-100, value || 0));
  }

  private fallbackAssessment(data: LearningBehaviorData): MBTIAssessmentResult {
    // Simple heuristic-based assessment as fallback
    const avgScore = data.exerciseScores.reduce((a, b) => a + b, 0) / data.exerciseScores.length;
    const isDetailOriented = data.readingSpeed < 200; // Slower, more careful reading
    const isStructured = data.interactionPatterns.retryPatterns < 2; // Less retries suggests planning
    
    return {
      personality: 'ISFJ', // Default to a common learning-friendly type
      dimensions: {
        extroversion: -20, // Slightly introverted (solo learning focus)
        sensing: isDetailOriented ? 30 : -30,
        thinking: avgScore > 80 ? 20 : -20,
        judging: isStructured ? 40 : -40
      },
      analysis: {
        learningStyle: 'Methodical and thoughtful learner',
        strengths: ['Consistent progress', 'Attention to detail', 'Persistent effort'],
        recommendations: ['Continue your steady approach', 'Try interactive exercises', 'Set small daily goals'],
        personalizedMessage: 'Your careful and consistent approach to learning shows great dedication. Keep up the excellent work!'
      },
      confidence: 75
    };
  }

  /**
   * Collect learning behavior data from user's activity
   */
  collectBehaviorData(userId: string, userProgress: any): LearningBehaviorData {
    // This would typically collect data from various sources
    // For now, we'll create a basic implementation
    
    return {
      userId,
      completedSections: userProgress.completedSections || [],
      timeSpent: userProgress.totalTimeSpent || 10, // Default 10 minutes for first lesson
      exerciseScores: userProgress.exerciseScores || [85], // Default score from reading lesson
      readingSpeed: 180, // Average reading speed
      vocabularyLearned: userProgress.learnedVocabulary || [],
      interactionPatterns: {
        preferredLearningStyle: 'text',
        attentionSpan: 15,
        retryPatterns: 1
      },
      learningPreferences: {
        difficulty: 'medium',
        pacing: 'normal',
        engagement: 8
      }
    };
  }
}

export const mbtiService = new MBTIAssessmentService();