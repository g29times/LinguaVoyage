import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface VocabularyWord {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  context: string;
}

interface VocabularySectionProps {
  vocabulary: VocabularyWord[];
  onComplete: () => void;
}

export default function VocabularySection({ vocabulary, onComplete }: VocabularySectionProps) {
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleDefinitions = () => {
    setShowDefinitions(!showDefinitions);
  };

  const markWordLearned = (word: string) => {
    const newCompleted = new Set(completedWords);
    newCompleted.add(word);
    setCompletedWords(newCompleted);
    
    if (newCompleted.size === vocabulary.length) {
      setIsCompleted(true);
      onComplete();
    }
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📚 Key Vocabulary ({vocabulary.length} words)
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={toggleDefinitions}
            className="flex items-center gap-2"
          >
            {showDefinitions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDefinitions ? 'Hide' : 'Show'} Definitions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {vocabulary.map((item, index) => (
            <Card key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-blue-900">{item.word}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.pronunciation}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakWord(item.word)}
                      className="p-1 h-8 w-8"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant={completedWords.has(item.word) ? "default" : "outline"}
                    size="sm"
                    onClick={() => markWordLearned(item.word)}
                    disabled={completedWords.has(item.word)}
                  >
                    {completedWords.has(item.word) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Learned
                      </>
                    ) : (
                      'Mark as Learned'
                    )}
                  </Button>
                </div>
                
                {showDefinitions && (
                  <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                    <p className="text-gray-700">
                      <strong>Definition:</strong> {item.definition}
                    </p>
                    <p className="text-gray-600">
                      <strong>Example:</strong> <em>"{item.example}"</em>
                    </p>
                    <p className="text-gray-500 text-sm">
                      <strong>Context:</strong> {item.context}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        <div className="pt-4 text-center">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {completedWords.size} / {vocabulary.length} words learned
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedWords.size / vocabulary.length) * 100}%` }}
              />
            </div>
          </div>
          
          {isCompleted && (
            <Badge variant="default" className="text-base py-2 px-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Vocabulary Section Completed!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}