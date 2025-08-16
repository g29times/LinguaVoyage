import { useNavigate } from 'react-router-dom';
import { Flame, Brain, User, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { profile, progress } = useUserData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const streak = progress?.current_streak || 0;
  const totalIP = progress?.total_ip || 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LinguaVoyage
          </div>
        </div>

        {/* Stats and User Info */}
        <div className="flex items-center space-x-6">
          {/* Streak Counter */}
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              {streak} days
            </Badge>
          </div>

          {/* IP Points */}
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {totalIP.toLocaleString()} IP
            </Badge>
          </div>

          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Advanced Learner</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}