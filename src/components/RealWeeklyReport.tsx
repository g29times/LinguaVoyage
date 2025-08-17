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
  const { progress, loading, error } = useUserProgress();
  
  console.log('RealWeeklyReport - Loading:', loading, 'Error:', error, 'Progress:', progress);

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
            <p className="text-xs text-gray-500 mt-2">Debug: Loading state active</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center p-8">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">Error loading your learning data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Fallback for when progress is undefined/null
  const safeProgress = progress || {
    totalSessions: 0,
    weeklyIP: 0,
    totalIP: 0,
    badges: [],
    completedModules: []
  };

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
                <div className="text-2xl font-bold text-blue-600">{safeProgress.totalSessions || 0}</div>
                <div className="text-sm text-muted-foreground">Learning Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{safeProgress.weeklyIP || 0}</div>
                <div className="text-sm text-muted-foreground">IP Points This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{safeProgress.badges?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Message */}
          <Card>
            <CardContent className="p-6 text-center">
              {(safeProgress.totalSessions || 0) === 0 ? (
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
                    You've completed {safeProgress.totalSessions || 0} learning session{(safeProgress.totalSessions || 0) !== 1 ? 's' : ''} and earned {safeProgress.totalIP || 0} total IP points.
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
                  {(safeProgress.totalSessions || 0) === 0 ? (
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Complete your first module to unlock personalized insights</span>
                    </li>
                  ) : (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>You've successfully completed {safeProgress.completedModules?.length || 0} learning module{(safeProgress.completedModules?.length || 0) !== 1 ? 's' : ''}</span>
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
                  {(safeProgress.totalSessions || 0) === 0 ? (
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