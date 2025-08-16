import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Play } from 'lucide-react';
import { mockStoryChapters } from '@/lib/mockData';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function StoryProgress() {
  const { progress, loading } = useUserProgress();
  
  // Calculate actual progress based on completed modules
  const completedChapters = progress.completedModules.length;
  const totalChapters = mockStoryChapters.length;
  const progressPercentage = (completedChapters / totalChapters) * 100;

  // Update chapter unlock status based on user progress
  const chaptersWithProgress = mockStoryChapters.map((chapter, index) => ({
    ...chapter,
    unlocked: index < completedChapters || (index === 0 && completedChapters === 0) // First chapter always unlocked
  }));

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📖 Your Learning Journey
        </CardTitle>
        <CardDescription>
          Progress through interconnected story chapters as you master advanced English
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Story Progress</span>
            <span>{completedChapters}/{totalChapters} chapters</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="grid gap-3 mt-6">
            {chaptersWithProgress.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  chapter.unlocked 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex-shrink-0">
                  {index < completedChapters - 1 ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : chapter.unlocked ? (
                    <Play className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${!chapter.unlocked && 'text-gray-500'}`}>
                      Chapter {chapter.chapter_number}: {chapter.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {chapter.completion_reward} IP
                    </Badge>
                  </div>
                  <p className={`text-sm ${chapter.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {chapter.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}