import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export default function AuthForm({ mode, onToggleMode, onForgotPassword }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signUp, signIn, signInWithGoogle, resendVerification } = useAuth();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (mode === 'signup') {
      if (!displayName) {
        setError('Display name is required');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, {
          display_name: displayName,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setSuccess('Please check your email and click the verification link to complete registration.');
          } else if (error.message.includes('User already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Registration successful! Please check your email (including spam folder) to verify your account before signing in.');
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email address first. Check your inbox (and spam folder) for the verification link.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Google sign-in initiated`);
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error(`[${timestamp}] Google sign-in error:`, error);
        if (error.message.includes('provider is not enabled')) {
          setError('Google OAuth is currently being configured. Please try email registration or try again later.');
        } else {
          setError(error.message);
        }
      } else {
        console.log(`[${timestamp}] Google sign-in request sent successfully`);
      }
    } catch (err) {
      console.error(`[${timestamp}] Google sign-in exception:`, err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === 'signup' ? 'Join LinguaVoyage' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {mode === 'signup' 
            ? 'Create your account to start your AI-powered learning journey'
            : 'Sign in to continue your learning adventure'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                {success}
                {success.includes('check your email') && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={async () => {
                        const { error } = await resendVerification(email);
                        if (error) {
                          setError('Failed to resend verification email');
                        } else {
                          setSuccess('Verification email resent! Please check your inbox.');
                        }
                      }}
                    >
                      Didn't receive email? Click to resend
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          {mode === 'signin' && (
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={onForgotPassword}
            >
              Forgot your password?
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={onToggleMode}
                >
                  Sign in
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={onToggleMode}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}