import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle } from 'lucide-react';

interface ReadingContentProps {
  content: {
    title: string;
    content: string;
  };
  onComplete: () => void;
  isCompleted?: boolean;
}

export default function ReadingContent({ content, onComplete, isCompleted: propCompleted = false }: ReadingContentProps) {
  const [isCompleted, setIsCompleted] = useState(propCompleted);

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          {content.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-lg max-w-none">
          {content.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="pt-6 border-t">
          <Button 
            onClick={handleComplete} 
            disabled={isCompleted || propCompleted}
            className="w-full"
            variant={isCompleted || propCompleted ? "outline" : "default"}
          >
            {isCompleted || propCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ✅ Marked as Read
              </>
            ) : (
              'Mark as Read'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}