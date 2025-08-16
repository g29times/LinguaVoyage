import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Play } from 'lucide-react';
import { LearningModule } from '@/types';
import { useUserProgress } from '@/hooks/useUserProgress';

interface LearningModuleCardProps {
  module: LearningModule;
  onStart: (moduleId: string) => void;
}

const moduleIcons = {
  reading: '📖',
  listening: '🎧',
  speaking: '🗣️',
  writing: '✍️'
};

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-yellow-100 text-yellow-800',
  5: 'bg-orange-100 text-orange-800',
  6: 'bg-orange-100 text-orange-800',
  7: 'bg-red-100 text-red-800',
  8: 'bg-red-100 text-red-800',
  9: 'bg-purple-100 text-purple-800',
  10: 'bg-purple-100 text-purple-800'
};

export default function LearningModuleCard({ module, onStart }: LearningModuleCardProps) {
  const { progress } = useUserProgress();
  
  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    if (level <= 8) return 'Advanced';
    return 'Expert';
  };

  const getButtonText = (moduleId: string) => {
    console.log('🔍 LearningModuleCard: Checking module ID:', moduleId);
    console.log('🔍 LearningModuleCard: Completed modules:', progress?.completedModules);
    console.log('🔍 LearningModuleCard: Is completed?', progress?.completedModules?.includes(moduleId));
    
    if (progress?.completedModules?.includes(moduleId)) {
      return 'Review Module';
    }
    return 'Start Module';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moduleIcons[module.type]}</span>
            <div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription className="capitalize">{module.type} Module</CardDescription>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={difficultyColors[module.difficulty_level as keyof typeof difficultyColors]}
          >
            {getDifficultyLabel(module.difficulty_level)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Module Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {module.estimated_duration} min
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {module.learning_objectives.length} objectives
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
            <div className="flex flex-wrap gap-2">
              {module.learning_objectives.map((objective, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {objective}
                </Badge>
              ))}
            </div>
          </div>

          {/* Story Chapter Connection */}
          {module.story_chapter && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                📚 Part of: {module.story_chapter.title}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {module.story_chapter.description}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => onStart(module.id)} 
            className="w-full"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {getButtonText(module.id)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}