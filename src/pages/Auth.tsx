import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const { user, loading, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Auth.tsx useEffect triggered:`, {
      hasUser: !!user,
      loading,
      userEmail: user?.email,
      currentPath: window.location.pathname
    });
    
    // If user is already authenticated, redirect to home page
    if (user && !loading) {
      console.log(`[${timestamp}] User is authenticated, redirecting to home immediately...`);
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render auth form if user is authenticated (prevent flash)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    setResetMessage('');

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setResetMessage(error.message);
      } else {
        setResetMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      setResetMessage('Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const renderContent = () => {
    if (mode === 'forgot') {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                  />
                </div>
              </div>

              {resetMessage && (
                <Alert>
                  <AlertDescription>{resetMessage}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={resetLoading || !resetEmail}>
                Send Reset Link
              </Button>
            </form>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => setMode('signin')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <AuthForm
        mode={mode}
        onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        onForgotPassword={() => setMode('forgot')}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-8 text-center lg:text-left">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              LinguaVoyage
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your AI-powered English learning companion with persistent memory
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">🧠</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Persistent AI Memory</h3>
                <p className="text-sm text-gray-600">Your AI companion remembers your progress across all sessions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Personalized Learning</h3>
                <p className="text-sm text-gray-600">Content adapted to your interests and proficiency level</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Gamified Experience</h3>
                <p className="text-sm text-gray-600">Earn IP points, unlock spells, and track your journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}