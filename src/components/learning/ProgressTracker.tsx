import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

interface UserProgress {
  id?: string;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  progress_data: {
    current_section: string;
    completed_sections: string[];
    exercise_scores: Record<string, number>;
    total_score?: number;
  };
  started_at?: string;
  completed_at?: string;
}

interface ProgressTrackerProps {
  progress: UserProgress;
  totalSections: number;
  showDetails?: boolean;
}

export default function ProgressTracker({ progress, totalSections, showDetails = false }: ProgressTrackerProps) {
  console.log('🔍 ProgressTracker: progress object:', progress);
  console.log('🔍 ProgressTracker: totalSections:', totalSections);
  console.log('🔍 ProgressTracker: completed sections:', progress.progress_data.completed_sections);
  console.log('🔍 ProgressTracker: completed sections length:', progress.progress_data.completed_sections.length);
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    switch (progress.status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const completedSections = progress.progress_data.completed_sections.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">📊 Your Progress</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{progress.progress_percentage}%</span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Sections Completed</div>
            <div className="font-semibold">{completedSections} / {totalSections}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current Section</div>
            <div className="font-semibold capitalize">{progress.progress_data.current_section}</div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Started</div>
              <div className="text-sm">{formatDate(progress.started_at)}</div>
            </div>
            
            {progress.completed_at && (
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-sm">{formatDate(progress.completed_at)}</div>
              </div>
            )}

            {progress.progress_data.total_score !== undefined && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Final Score: </span>
                  <span className="font-semibold">{progress.progress_data.total_score}%</span>
                </div>
              </div>
            )}

            {progress.progress_data.completed_sections.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Completed Sections</div>
                <div className="flex flex-wrap gap-1">
                  {progress.progress_data.completed_sections.map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}