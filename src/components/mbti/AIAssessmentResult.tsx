import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Sparkles, Target, Lightbulb } from 'lucide-react';
import { MBTIAssessmentResult } from '@/lib/llm-config';
import { mbtiService } from '@/services/mbti-assessment';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserData } from '@/hooks/useUserData';
import { requestDeduplicator } from '@/utils/debounce';
import { supabase } from '@/lib/supabase';

import { toast } from 'sonner';

interface AIAssessmentResultProps {
  userId: string;
  onComplete?: () => void;
}

export const AIAssessmentResult: React.FC<AIAssessmentResultProps> = ({ userId, onComplete }) => {
  const [assessment, setAssessment] = useState<MBTIAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProgress, refreshProgress } = useUserProgress();
  const { progress, refreshUserData } = useUserData();

  // Available IP for gating UI
  const availableIP = (userProgress?.totalIP ?? progress?.total_ip ?? 0);

  const startAssessment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Pre-check: fetch freshest points; require >= 25 before running LLM
      const { data: precheck, error: preErr } = await supabase
        .from('app_24b6a0157d_user_progress')
        .select('total_ip, unlocked_spells')
        .eq('user_id', userId)
        .maybeSingle();
      if (preErr) console.error('❌ MBTI precheck fetch failed:', preErr);
      const preTotal = precheck?.total_ip ?? 0;
      if (preTotal < 25) {
        toast.error('Not enough IP to run assessment (25 required)');
        throw new Error('Insufficient IP before assessment');
      }

      const behaviorData = mbtiService.collectBehaviorData(userId, userProgress);
      const result = await mbtiService.generateAssessment(behaviorData);

      // Persist to DB and (if first time) deduct IP and unlock spell
      const dedupeKey = `mbti-assess:save:${userId}`;
      await requestDeduplicator.deduplicate(dedupeKey, async () => {
        // Normalize dimensions from -100..100 to 0..1
        const to01 = (v: number) => Math.min(1, Math.max(0, (v + 100) / 200));
        const indicators = {
          extraversion_score: to01(result.dimensions.extroversion),
          sensing_score: to01(result.dimensions.sensing),
          thinking_score: to01(result.dimensions.thinking),
          judging_score: to01(result.dimensions.judging),
          confidence_level: Math.min(1, Math.max(0, (result.confidence ?? 85) / 100)),
          data_points: (userProgress?.completedModules?.length || 0),
        } as const;

        // Atomic: call RPC to deduct IP, update indicators/unlock, and log ledger in one transaction
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('fn_mbti_save_and_charge', {
            p_user_id: userId,
            p_indicators: indicators as any,
            p_amount: 25,
            p_idempotency_key: dedupeKey,
            p_metadata: { personality: result.personality, confidence: result.confidence },
          });
          if (rpcErr) {
            throw rpcErr;
          }
          console.log('✅ MBTI save: RPC success', rpcData);
        } catch (rpcErr) {
          console.warn('⚠️ MBTI save: RPC unavailable or failed, falling back to client-side update + ledger insert', rpcErr);

          // Fallback: fetch freshest progress directly
          const { data: current, error: fetchErr } = await supabase
            .from('app_24b6a0157d_user_progress')
            .select('total_ip, unlocked_spells')
            .eq('user_id', userId)
            .maybeSingle();
          if (fetchErr) console.error('❌ MBTI fallback: fetch current progress failed:', fetchErr);
          const currTotal = current?.total_ip ?? 0;
          const currSpells: string[] = current?.unlocked_spells ?? [];

          if (currTotal < 25) {
            console.warn('⚠️ MBTI fallback: insufficient IP at save time, aborting save');
            throw new Error('Insufficient IP at save time');
          }
          const nextTotalIP = Math.max(0, currTotal - 25);
          const nextSpells = Array.from(new Set([...currSpells, 'mbti_vision']));

          const { error: updateErr } = await supabase
            .from('app_24b6a0157d_user_progress')
            .update({
              mbti_indicators: indicators,
              unlocked_spells: nextSpells,
              total_ip: nextTotalIP,
            })
            .eq('user_id', userId);
          if (updateErr) {
            console.error('❌ MBTI fallback: update failed:', updateErr);
            throw updateErr;
          }
          // Write ledger entry for MBTI assessment spend (25 IP)
          try {
            await supabase.from('app_24b6a0157d_ip_ledger').insert({
              user_id: userId,
              amount_delta: -25,
              activity: 'mbti_assessment',
              description: 'MBTI assessment',
              metadata: { personality: result.personality, confidence: result.confidence, source: 'fallback' },
            });
          } catch (ledgerErr) {
            console.warn('⚠️ MBTI fallback: ledger insert failed:', ledgerErr);
          }
        }
      });

      // On success, set local result and refresh data so dashboard & this page see updates
      setAssessment(result);
      // Ensure dashboard & this page see updated points/indicators
      if (refreshProgress) refreshProgress();
      if (refreshUserData) await refreshUserData();
      toast.success('AI assessment completed!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Assessment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper for stored indicators (0..1) -> MBTI type
  const getTypeFromIndicators = (inds: any) => {
    if (!inds) return '----';
    const e = inds.extraversion_score > 0.5 ? 'E' : 'I';
    const s = inds.sensing_score > 0.5 ? 'S' : 'N';
    const t = inds.thinking_score > 0.5 ? 'T' : 'F';
    const j = inds.judging_score > 0.5 ? 'J' : 'P';
    return `${e}${s}${t}${j}`;
  };

  const getDimensionLabel = (dimension: string, value: number) => {
    const labels = {
      extroversion: value > 0 ? 'Extroverted' : 'Introverted',
      sensing: value > 0 ? 'Sensing' : 'Intuitive',
      thinking: value > 0 ? 'Thinking' : 'Feeling',
      judging: value > 0 ? 'Judging' : 'Perceiving'
    };
    return labels[dimension as keyof typeof labels];
  };

  const getDimensionDescription = (dimension: string, value: number) => {
    const descriptions = {
      extroversion: value > 0 
        ? 'You prefer group learning and external discussion'
        : 'You prefer quiet, focused individual study',
      sensing: value > 0
        ? 'You focus on concrete details and practical application'
        : 'You enjoy abstract concepts and big-picture thinking',
      thinking: value > 0
        ? 'You approach learning logically and analytically'
        : 'You connect emotionally with learning content',
      judging: value > 0
        ? 'You prefer structured, planned learning approaches'
        : 'You enjoy flexible, adaptive learning methods'
    };
    return descriptions[dimension as keyof typeof descriptions];
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
          <p className="text-muted-foreground text-center">
            Our AI is analyzing your learning patterns to create your personalized MBTI profile...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Brain className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-xl font-semibold">Assessment Error</h3>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={startAssessment} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    const stored = progress?.mbti_indicators as any | undefined;
    const hasStored = !!stored && (stored?.data_points ?? 0) > 0;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">AI-Powered MBTI Assessment</CardTitle>
          <CardDescription className="text-base">
            Unlock your personalized learning profile based on your unique study patterns and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasStored && (
            <div className="space-y-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50">
              <h4 className="font-semibold">Your Last Assessment</h4>
              <div className="text-center">
                <span className="inline-block text-2xl font-bold text-blue-700 mb-1">{getTypeFromIndicators(stored)}</span>
                <div className="text-xs text-muted-foreground">Confidence {Math.round((stored?.confidence_level ?? 0) * 100)}% • {stored?.data_points ?? 0} data points</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs"><span>Extraversion (E)</span><span>{Math.round((stored?.extraversion_score ?? 0) * 100)}%</span></div>
                  <Progress value={(stored?.extraversion_score ?? 0) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs"><span>Sensing (S)</span><span>{Math.round((stored?.sensing_score ?? 0) * 100)}%</span></div>
                  <Progress value={(stored?.sensing_score ?? 0) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs"><span>Thinking (T)</span><span>{Math.round((stored?.thinking_score ?? 0) * 100)}%</span></div>
                  <Progress value={(stored?.thinking_score ?? 0) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs"><span>Judging (J)</span><span>{Math.round((stored?.judging_score ?? 0) * 100)}%</span></div>
                  <Progress value={(stored?.judging_score ?? 0) * 100} className="h-2" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              How It Works
            </h4>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your learning behavior, reading patterns, exercise performance, and study preferences 
              to generate a personalized MBTI personality profile tailored to your learning journey.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mb-2 text-xs text-muted-foreground">Costs 25 IP • You have {availableIP} IP</div>
            <Button onClick={startAssessment} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={availableIP < 25}>
              <Sparkles className="h-5 w-5 mr-2" />
              {hasStored ? 'Re-run AI Assessment' : 'Start AI Assessment'}
            </Button>
            {availableIP < 25 && (
              <div className="mt-2 text-xs text-red-500">You need {25 - availableIP} more IP to run the assessment.</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">{assessment.personality}</span>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Learning Personality
          </CardTitle>
          <CardDescription className="text-lg">
            AI Confidence: {assessment.confidence}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {assessment.analysis.personalizedMessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Personality Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(assessment.dimensions).map(([dimension, value]) => (
            <div key={dimension} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{dimension}</span>
                <Badge variant={value > 0 ? "default" : "secondary"}>
                  {getDimensionLabel(dimension, value)}
                </Badge>
              </div>
              <Progress value={50 + (value / 2)} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {getDimensionDescription(dimension, value)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-green-600" />
              Your Learning Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Learning Style */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Style</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {assessment.analysis.learningStyle}
          </p>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
          Continue Learning Journey
        </Button>
      </div>
    </div>
  );
};

export default AIAssessmentResult;