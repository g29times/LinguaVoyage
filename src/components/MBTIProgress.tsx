import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock } from 'lucide-react';
import { MBTIIndicators } from '@/types';
import { mockUser } from '@/lib/mockData';

interface MBTIProgressProps {
  indicators: MBTIIndicators;
  spellUnlocked: boolean;
  currentIP?: number;
  requiredIP?: number; // default 25 if not provided
  onUnlock?: () => void; // optional unlock action
}

export default function MBTIProgress({ indicators, spellUnlocked, currentIP = 0, requiredIP = 25, onUnlock }: MBTIProgressProps) {
  const getPersonalityType = (indicators: MBTIIndicators) => {
    const e = indicators.extraversion_score > 0.5 ? 'E' : 'I';
    const s = indicators.sensing_score > 0.5 ? 'S' : 'N';
    const t = indicators.thinking_score > 0.5 ? 'T' : 'F';
    const j = indicators.judging_score > 0.5 ? 'J' : 'P';
    return `${e}${s}${t}${j}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              MBTI Personality Insights
              {!spellUnlocked && <Lock className="h-4 w-4 text-gray-400" />}
              {spellUnlocked && <Eye className="h-4 w-4 text-blue-500" />}
            </CardTitle>
            <CardDescription>
              AI-powered personality profiling through your learning behavior
            </CardDescription>
          </div>
          {spellUnlocked && (
            <Badge className={`${getConfidenceColor(indicators.confidence_level)} border-0`}>
              {Math.round(indicators.confidence_level * 100)}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!spellUnlocked ? (
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Unlock "MBTI Vision" spell to see your personality insights
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="outline">Costs {requiredIP} IP</Badge>
              <span className="text-xs text-gray-500">• You have {currentIP} IP</span>
            </div>
            {currentIP >= requiredIP ? (
              <Button size="sm" onClick={onUnlock} className="bg-purple-600 text-white hover:bg-purple-700">
                Start AI Assessment
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                Need {Math.max(0, requiredIP - currentIP)} more IP
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Type Estimate */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">
                {getPersonalityType(indicators)}
              </h3>
              <p className="text-sm text-gray-600">
                Current personality type estimate based on {indicators.data_points} learning interactions
              </p>
            </div>

            {/* Dimension Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extraversion (E)</span>
                  <span>{Math.round(indicators.extraversion_score * 100)}%</span>
                </div>
                <Progress value={indicators.extraversion_score * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sensing (S)</span>
                  <span>{Math.round(indicators.sensing_score * 100)}%</span>
                </div>
                <Progress value={indicators.sensing_score * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Thinking (T)</span>
                  <span>{Math.round(indicators.thinking_score * 100)}%</span>
                </div>
                <Progress value={indicators.thinking_score * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Judging (J)</span>
                  <span>{Math.round(indicators.judging_score * 100)}%</span>
                </div>
                <Progress value={indicators.judging_score * 100} className="h-2" />
              </div>
            </div>

            {/* Insights */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">AI Insights:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You show strong analytical thinking in writing exercises</li>
                <li>• Your debate participation suggests confidence in expressing ideas</li>
                <li>• Learning pattern indicates preference for structured content</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}