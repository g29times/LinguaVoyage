import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, User, Target, Clock, Sparkles } from 'lucide-react';

interface OnboardingData {
  displayName: string;
  learningGoals: string[];
  preferredTopics: string[];
  timeCommitment: number;
  motivations: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    displayName: '',
    learningGoals: [],
    preferredTopics: [],
    timeCommitment: 30,
    motivations: ''
  });

  const totalSteps = 4;
  const progressPercentage = (step / totalSteps) * 100;

  const learningGoalOptions = [
    'Advanced vocabulary expansion',
    'Business English mastery',
    'Academic writing skills',
    'Conversational fluency',
    'Professional communication',
    'Cultural understanding',
    'Critical thinking in English',
    'Debate and argumentation'
  ];

  const topicOptions = [
    'Technology & Innovation',
    'Science & Research',
    'Business & Finance',
    'Politics & Current Events',
    'Culture & Society',
    'Health & Medicine',
    'Environment & Sustainability',
    'Arts & Literature',
    'Philosophy & Ethics',
    'History & Archaeology'
  ];

  const timeCommitmentOptions = [
    { value: 15, label: '15 minutes - Quick daily boost' },
    { value: 30, label: '30 minutes - Balanced learning' },
    { value: 45, label: '45 minutes - Intensive practice' },
    { value: 60, label: '60+ minutes - Deep immersion' }
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter(g => g !== goal)
        : [...prev.learningGoals, goal]
    }));
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.displayName.trim().length > 0;
      case 2: return formData.learningGoals.length > 0;
      case 3: return formData.preferredTopics.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to LinguaVoyage!</CardTitle>
              <CardDescription>
                Let's personalize your AI-powered English learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">What should we call you?</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🧠 AI Memory System</h4>
                <p className="text-sm text-blue-700">
                  Your AI companion will remember your progress, preferences, and learning patterns 
                  across all sessions, creating a truly personalized experience that evolves with you.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Your Learning Goals</CardTitle>
              <CardDescription>
                Select the areas you want to focus on (choose multiple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {learningGoalOptions.map((goal) => (
                  <div
                    key={goal}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.learningGoals.includes(goal)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => handleGoalToggle(goal)}
                  >
                    <Checkbox
                      checked={formData.learningGoals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                    />
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Your Interests</CardTitle>
              <CardDescription>
                Choose topics you're passionate about - our AI will find relevant news and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topicOptions.map((topic) => (
                  <div
                    key={topic}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.preferredTopics.includes(topic)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleTopicToggle(topic)}
                  >
                    <Checkbox
                      checked={formData.preferredTopics.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                    />
                    <span className="text-sm font-medium">{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Time Commitment</CardTitle>
              <CardDescription>
                How much time would you like to dedicate to learning each day?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.timeCommitment.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeCommitment: parseInt(value) }))}
              >
                {timeCommitmentOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                    <Label htmlFor={option.value.toString()} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="motivations">What motivates you to learn? (Optional)</Label>
                <Textarea
                  id="motivations"
                  placeholder="Share your motivations, challenges, or specific goals..."
                  value={formData.motivations}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivations: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">🚀 Ready to Begin Your Journey!</h4>
                <p className="text-sm text-gray-600">
                  Your AI companion will use this information to create personalized learning experiences
                  and remember your preferences across all future sessions.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {step === totalSteps ? 'Start Learning' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}