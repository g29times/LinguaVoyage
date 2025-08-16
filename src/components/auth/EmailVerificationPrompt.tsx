import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';

export default function EmailVerificationPrompt() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        setMessage('Failed to resend verification email. Please try again.');
        console.error('❌ Error resending verification:', error);
      } else {
        setMessage('Verification email sent! Please check your inbox and spam folder.');
        console.log('✅ Verification email sent to:', user.email);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Please check your email and click the verification link to continue. Don't forget to check your spam folder!
            </AlertDescription>
          </Alert>

          {message && (
            <Alert className={message.includes('sent') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertDescription className={message.includes('sent') ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              I've Verified - Refresh Page
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Having trouble? Contact support for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}