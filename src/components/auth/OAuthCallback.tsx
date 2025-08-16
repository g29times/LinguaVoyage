import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OAuthCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] OAuthCallback started:`, {
        url: window.location.href,
        pathname: window.location.pathname,
        hash: window.location.hash
      });
      
      try {
        // Check if we have hash parameters (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log(`[${timestamp}] OAuth tokens:`, {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (accessToken) {
          // Set session with tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            throw error;
          }

          if (data.session) {
            console.log(`[${new Date().toISOString()}] OAuth session created successfully:`, {
              userEmail: data.session.user.email,
              provider: data.session.user.app_metadata?.provider
            });
            
            setStatus('success');
            setMessage('Successfully signed in with Google!');
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect to home page immediately after successful auth
            console.log(`[${new Date().toISOString()}] OAuthCallback will redirect to home in 500ms`);
            setTimeout(() => {
              console.log(`[${new Date().toISOString()}] OAuthCallback executing redirect to home`);
              window.location.href = '/';
            }, 500);
          }
        } else {
          // Check for regular session (direct navigation)
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            window.location.href = '/';
          } else {
            throw new Error('No authentication session found');
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to complete sign in. Please try again.');
        
        // Redirect to auth page after delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'processing' && 'Completing Sign In...'}
            {status === 'success' && 'Welcome to LinguaVoyage!'}
            {status === 'error' && 'Sign In Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'processing' && 'Please wait while we complete your authentication'}
            {status === 'success' && 'Redirecting you to your dashboard'}
            {status === 'error' && 'Redirecting you back to sign in'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'processing' && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          
          {message && (
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}