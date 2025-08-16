import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Brain, Target } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';

interface RealWeeklyReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RealWeeklyReport({ isOpen, onClose }: RealWeeklyReportProps) {
  const { progress, loading } = useUserProgress();

  const getWeekDateRange = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    return `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>Loading your learning data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Weekly Intelligence Summary
          </DialogTitle>
          <DialogDescription>
            {getWeekDateRange()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Learning Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{progress.weeklyIP}</div>
                <div className="text-sm text-muted-foreground">IP Points This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{progress.badges.length}</div>
                <div className="text-sm text-muted-foreground">Total Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Message */}
          <Card>
            <CardContent className="p-6 text-center">
              {progress.totalSessions === 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">🌟 Welcome to Your Learning Journey!</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first learning module to begin tracking your progress and earning Intelligence Points.
                  </p>
                  <Badge variant="outline">Ready to Begin</Badge>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">🎉 Great Progress!</h3>
                  <p className="text-muted-foreground mb-4">
                    You've completed {progress.totalSessions} learning session{progress.totalSessions !== 1 ? 's' : ''} and earned {progress.totalIP} total IP points.
                  </p>
                  <Badge variant="default">Active Learner</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Insights */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Your Learning Insights
            </h3>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {progress.totalSessions === 0 ? (
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Complete your first module to unlock personalized insights</span>
                    </li>
                  ) : (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>You've successfully completed {progress.completedModules.length} learning module{progress.completedModules.length !== 1 ? 's' : ''}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Keep up the consistent learning to build your language skills</span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Target className="h-5 w-5 text-blue-500" />
              Recommended Next Steps
            </h3>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {progress.totalSessions === 0 ? (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>Start with "AI in Creative Industries" to begin your learning journey</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>Complete all sections to earn your first Intelligence Points</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>Explore more learning modules to diversify your knowledge</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>Try interacting with AI companions for personalized practice</span>
                      </li>
                    </>
                  )}
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