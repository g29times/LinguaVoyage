import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { AICompanion } from '@/types';

interface AICompanionCardProps {
  companion: AICompanion;
  onChat: (companionId: string) => void;
}

export default function AICompanionCard({ companion, onChat }: AICompanionCardProps) {
  const personaColors = {
    mentor: 'bg-green-100 text-green-800 border-green-200',
    debate_partner: 'bg-red-100 text-red-800 border-red-200',
    interviewer: 'bg-blue-100 text-blue-800 border-blue-200',
    news_commentator: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const personaLabels = {
    mentor: 'Mentor',
    debate_partner: 'Debate Partner',
    interviewer: 'Interviewer',
    news_commentator: 'News Commentator'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{companion.avatar}</div>
          <div className="flex-1">
            <CardTitle className="text-lg">{companion.name}</CardTitle>
            <Badge 
              variant="outline" 
              className={personaColors[companion.persona]}
            >
              {personaLabels[companion.persona]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {companion.greeting_message}
          </p>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Personality Traits:</h4>
            <div className="flex flex-wrap gap-2">
              {companion.personality_traits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => onChat(companion.id)} 
            className="w-full"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with {companion.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}