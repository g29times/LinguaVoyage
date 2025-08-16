import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Lock } from 'lucide-react';
import { Badge as BadgeType, Spell } from '@/types';

interface GamificationPanelProps {
  userIP: number;
  badges: BadgeType[];
  spells: Spell[];
  onUnlockSpell: (spellId: string) => void;
}

export default function GamificationPanel({ userIP, badges, spells, onUnlockSpell }: GamificationPanelProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const unlockedSpells = spells.filter(spell => spell.unlocked);
  const availableSpells = spells.filter(spell => !spell.unlocked && userIP >= spell.ip_cost);
  const lockedSpells = spells.filter(spell => !spell.unlocked && userIP < spell.ip_cost);

  return (
    <div className="space-y-6">
      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Badges
          </CardTitle>
          <CardDescription>
            Unlock badges by completing learning milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {badge.rarity}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-blue-600 mt-1">{badge.unlock_condition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spells Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Spell Shop
          </CardTitle>
          <CardDescription>
            Unlock powerful abilities with IP points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Unlocked Spells */}
            {unlockedSpells.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3 text-green-700">✨ Active Spells</h4>
                <div className="space-y-2">
                  {unlockedSpells.map((spell) => (
                    <div key={spell.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-xl">{spell.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{spell.name}</h5>
                        <p className="text-xs text-muted-foreground">{spell.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Spells */}
            {availableSpells.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3 text-blue-700">⚡ Available to Unlock</h4>
                <div className="space-y-2">
                  {availableSpells.map((spell) => (
                    <div key={spell.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-xl">{spell.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{spell.name}</h5>
                        <p className="text-xs text-muted-foreground">{spell.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {spell.ip_cost} IP
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => onUnlockSpell(spell.id)}
                          className="w-full"
                        >
                          Unlock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Spells */}
            {lockedSpells.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3 text-gray-500">🔒 Requires More IP</h4>
                <div className="space-y-2">
                  {lockedSpells.map((spell) => (
                    <div key={spell.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
                      <span className="text-xl grayscale">{spell.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-gray-600">{spell.name}</h5>
                        <p className="text-xs text-muted-foreground">{spell.description}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress: {userIP}/{spell.ip_cost} IP</span>
                            <span>{Math.round((userIP / spell.ip_cost) * 100)}%</span>
                          </div>
                          <Progress value={(userIP / spell.ip_cost) * 100} className="h-1" />
                        </div>
                      </div>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}