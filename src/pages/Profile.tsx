import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, User, Mail, Calendar, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { profile, updateUserProfile, loading } = useUserData();

  const [formData, setFormData] = useState({
    display_name: '',
    learning_goals: [] as string[],
    preferred_topics: [] as string[],
    daily_time_commitment: 30,
    timezone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        learning_goals: profile.learning_goals,
        preferred_topics: profile.preferred_topics,
        daily_time_commitment: profile.daily_time_commitment,
        timezone: profile.timezone,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Update user profile in auth metadata
      const { error: authError } = await updateProfile({
        display_name: formData.display_name,
      });

      // Update user profile in database
      const { error: dbError } = await updateUserProfile({
        display_name: formData.display_name,
        learning_goals: formData.learning_goals,
        preferred_topics: formData.preferred_topics,
        daily_time_commitment: formData.daily_time_commitment,
        timezone: formData.timezone,
      });

      if (authError || dbError) {
        setMessage('Failed to update profile. Please try again.');
      } else {
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const addLearningGoal = (goal: string) => {
    if (goal && !formData.learning_goals.includes(goal)) {
      setFormData(prev => ({
        ...prev,
        learning_goals: [...prev.learning_goals, goal]
      }));
    }
  };

  const removeLearningGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      learning_goals: prev.learning_goals.filter(g => g !== goal)
    }));
  };

  const addPreferredTopic = (topic: string) => {
    if (topic && !formData.preferred_topics.includes(topic)) {
      setFormData(prev => ({
        ...prev,
        preferred_topics: [...prev.preferred_topics, topic]
      }));
    }
  };

  const removePreferredTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_topics: prev.preferred_topics.filter(t => t !== topic)
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{formData.display_name || 'Learner'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user?.created_at || '').toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {formData.timezone || 'UTC'}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Daily Commitment:</span>
                  <span className="ml-2 font-medium">{formData.daily_time_commitment} minutes</span>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your learning preferences and personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="How should we call you?"
                    />
                  </div>

                  {/* Learning Goals */}
                  <div className="space-y-2">
                    <Label>Learning Goals</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.learning_goals.map((goal) => (
                        <Badge
                          key={goal}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeLearningGoal(goal)}
                        >
                          {goal} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a learning goal..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLearningGoal(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Preferred Topics */}
                  <div className="space-y-2">
                    <Label>Preferred Topics</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.preferred_topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => removePreferredTopic(topic)}
                        >
                          {topic} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a preferred topic..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPreferredTopic(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Daily Time Commitment */}
                  <div className="space-y-2">
                    <Label htmlFor="daily_time_commitment">Daily Time Commitment (minutes)</Label>
                    <Input
                      id="daily_time_commitment"
                      type="number"
                      min="5"
                      max="240"
                      value={formData.daily_time_commitment}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        daily_time_commitment: parseInt(e.target.value) || 30 
                      }))}
                    />
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="e.g., America/New_York"
                    />
                  </div>

                  {/* Message */}
                  {message && (
                    <Alert>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}