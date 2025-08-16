import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Target } from 'lucide-react';

interface Exercise {
  type: string;
  question: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  pairs?: Array<{ word: string; definition: string }>;
  answer_type?: string;
  sample_answer?: string;
  keywords?: string[];
}

interface ExerciseSectionProps {
  exercises: Exercise[];
  assessment: {
    passing_score: number;
    total_points: number;
    exercise_weights: Record<string, number>;
  };
  onComplete: (score: number) => void;
}

export default function ExerciseSection({ exercises, assessment, onComplete }: ExerciseSectionProps) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentEx = exercises[currentExercise];

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentExercise]: answer }));
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
    } else {
      submitExercises();
    }
  };

  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1);
    }
  };

  const submitExercises = () => {
    let totalScore = 0;
    let maxScore = 0;

    exercises.forEach((exercise, index) => {
      const userAnswer = answers[index];
      let exerciseScore = 0;
      let exerciseMax = 0;

      switch (exercise.type) {
        case 'multiple_choice':
        case 'fill_blank':
          exerciseMax = assessment.exercise_weights.multiple_choice || 20;
          if (userAnswer === exercise.correct) {
            exerciseScore = exerciseMax;
          }
          break;
        case 'vocabulary_match':
          exerciseMax = assessment.exercise_weights.vocabulary_match || 25;
          if (userAnswer && exercise.pairs) {
            const correctMatches = exercise.pairs.filter((pair, pairIndex) => 
              userAnswer[pairIndex] === pair.definition
            ).length;
            exerciseScore = (correctMatches / exercise.pairs.length) * exerciseMax;
          }
          break;
        case 'comprehension':
          exerciseMax = assessment.exercise_weights.comprehension || 40;
          if (userAnswer && exercise.keywords) {
            const foundKeywords = exercise.keywords.filter(keyword => 
              userAnswer.toLowerCase().includes(keyword.toLowerCase())
            ).length;
            exerciseScore = (foundKeywords / exercise.keywords.length) * exerciseMax;
          }
          break;
      }

      totalScore += exerciseScore;
      maxScore += exerciseMax;
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    setScore(finalScore);
    setSubmitted(true);
    onComplete(finalScore);
  };

  const renderExercise = () => {
    switch (currentEx.type) {
      case 'multiple_choice':
      case 'fill_blank':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentEx.question}</h3>
            {currentEx.options && (
              <RadioGroup 
                value={answers[currentExercise]?.toString()} 
                onValueChange={(value) => handleAnswer(parseInt(value))}
              >
                {currentEx.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );

      case 'vocabulary_match':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentEx.question}</h3>
            {currentEx.pairs && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Words:</h4>
                  {currentEx.pairs.map((pair, index) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      {pair.word}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Definitions:</h4>
                  {currentEx.pairs.map((pair, index) => (
                    <div key={index} className="mb-2">
                      <Label>{pair.word}:</Label>
                      <RadioGroup 
                        value={answers[currentExercise]?.[index]} 
                        onValueChange={(value) => {
                          const newAnswer = { ...answers[currentExercise] };
                          newAnswer[index] = value;
                          handleAnswer(newAnswer);
                        }}
                      >
                        {currentEx.pairs.map((defPair, defIndex) => (
                          <div key={defIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={defPair.definition} id={`def-${index}-${defIndex}`} />
                            <Label htmlFor={`def-${index}-${defIndex}`} className="text-sm">
                              {defPair.definition}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'comprehension':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentEx.question}</h3>
            <Textarea
              value={answers[currentExercise] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
            />
            {currentEx.sample_answer && (
              <div className="text-sm text-gray-600">
                <strong>Hint:</strong> Your answer should include key concepts related to the reading material.
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown exercise type</div>;
    }
  };

  if (submitted) {
    const passed = score >= assessment.passing_score;
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            Exercise Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`text-6xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {score}%
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {passed ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg font-medium text-green-600">Excellent Work!</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="text-lg font-medium text-red-600">Keep Practicing!</span>
              </>
            )}
          </div>
          
          <div className="text-gray-600">
            <p>Passing score: {assessment.passing_score}%</p>
            <p>Your score: {score}%</p>
          </div>

          {!passed && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                Don't worry! Review the material and try again. Learning is a process!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            Exercise {currentExercise + 1} of {exercises.length}
          </CardTitle>
          <div className="text-sm text-gray-600">
            Progress: {currentExercise + 1}/{exercises.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderExercise()}
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={prevExercise}
            disabled={currentExercise === 0}
          >
            Previous
          </Button>
          
          <Button 
            onClick={nextExercise}
            disabled={answers[currentExercise] === undefined}
          >
            {currentExercise === exercises.length - 1 ? 'Submit All' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}