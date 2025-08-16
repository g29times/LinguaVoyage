import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Brain, Target } from 'lucide-react';
import { WeeklyReport } from '@/types';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WeeklyReport;
}

export default function WeeklyReportModal({ isOpen, onClose, report }: WeeklyReportModalProps) {
  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const getMBTIType = () => {
    const { mbti_progress } = report;
    const e = mbti_progress.extraversion_score > 0.5 ? 'E' : 'I';
    const s = mbti_progress.sensing_score > 0.5 ? 'S' : 'N';
    const t = mbti_progress.thinking_score > 0.5 ? 'T' : 'F';
    const j = mbti_progress.judging_score > 0.5 ? 'J' : 'P';
    return `${e}${s}${t}${j}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Weekly Intelligence Summary
          </DialogTitle>
          <DialogDescription>
            {formatDateRange(report.week_start, report.week_end)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{report.total_sessions}</div>
                <div className="text-sm text-muted-foreground">Learning Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{report.total_ip_earned}</div>
                <div className="text-sm text-muted-foreground">IP Points Earned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{report.new_badges.length}</div>
                <div className="text-sm text-muted-foreground">New Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* New Badges */}
          {report.new_badges.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold mb-3">
                <Award className="h-5 w-5 text-yellow-500" />
                New Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {report.new_badges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MBTI Progress */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Brain className="h-5 w-5 text-purple-500" />
              Personality Insights Progress
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {getMBTIType()}
                  </div>
                  <Badge variant="secondary">
                    {Math.round(report.mbti_progress.confidence_level * 100)}% confidence
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Extraversion</span>
                      <span>{Math.round(report.mbti_progress.extraversion_score * 100)}%</span>
                    </div>
                    <Progress value={report.mbti_progress.extraversion_score * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sensing</span>
                      <span>{Math.round(report.mbti_progress.sensing_score * 100)}%</span>
                    </div>
                    <Progress value={report.mbti_progress.sensing_score * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Thinking</span>
                      <span>{Math.round(report.mbti_progress.thinking_score * 100)}%</span>
                    </div>
                    <Progress value={report.mbti_progress.thinking_score * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Judging</span>
                      <span>{Math.round(report.mbti_progress.judging_score * 100)}%</span>
                    </div>
                    <Progress value={report.mbti_progress.judging_score * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Insights */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Learning Insights
            </h3>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {report.learning_insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Next Week Suggestions */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Target className="h-5 w-5 text-blue-500" />
              Next Week Suggestions
            </h3>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {report.next_week_suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}