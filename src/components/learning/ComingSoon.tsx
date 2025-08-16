import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
  moduleTitle: string;
  moduleType: string;
}

export default function ComingSoon({ moduleTitle, moduleType }: ComingSoonProps) {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Construction Icon */}
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-orange-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h1>
            <p className="text-gray-600">
              The <span className="font-medium">{moduleTitle}</span> {moduleType} module is currently under development.
            </p>
          </div>

          {/* Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">In Development</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              We're working hard to bring you this learning experience
            </p>
          </div>

          {/* Call to Action */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Meanwhile, explore our available modules to continue your learning journey.
            </p>
            
            <Button onClick={handleBackToDashboard} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}