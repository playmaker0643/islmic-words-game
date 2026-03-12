import { useState } from 'react';
import { BookOpen, Shuffle, Grid3X3, HelpCircle, Settings, Volume2, VolumeX, Star, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { type GameMode, type Difficulty } from '@/hooks/useGameState';

interface GameMenuProps {
  onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
  highScores: Record<string, number>;
}

const gameModes = [
  {
    id: 'scramble' as GameMode,
    title: 'Word Scramble',
    description: 'Unscramble Islamic words from Duas and Quran',
    icon: Shuffle,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    difficulty: 'easy',
  },
  {
    id: 'fillblank' as GameMode,
    title: 'Fill in the Blank',
    description: 'Complete Dua and Quran verses with missing words',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    difficulty: 'medium',
  },
  {
    id: 'wordsearch' as GameMode,
    title: 'Word Search',
    description: 'Find Islamic words hidden in the grid',
    icon: Grid3X3,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    difficulty: 'medium',
  },
  {
    id: 'quiz' as GameMode,
    title: 'Islamic Quiz',
    description: 'Test your knowledge with multiple choice questions',
    icon: HelpCircle,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    difficulty: 'hard',
  },
];

export function GameMenu({ onStartGame, highScores }: GameMenuProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="min-h-screen islamic-pattern py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-amber-500 twinkle" />
          <span className="text-emerald-700 font-medium">Islamic Learning Game</span>
          <Sparkles className="w-6 h-6 text-amber-500 twinkle" style={{ animationDelay: '0.5s' }} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="gold-text">Islamic Words</span>
        </h1>
        <p className="text-lg text-emerald-700/70 max-w-xl mx-auto">
          Learn Duas and Quran Surahs through fun word games
        </p>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-emerald-700">
                  High Score: <span className="font-bold">{Math.max(...Object.values(highScores), 0)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-emerald-700">
                  Games Played: <span className="font-bold">{Object.keys(highScores).length}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-emerald-400" />}
                  <Switch
                    id="sound"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                  <Label htmlFor="sound" className="text-sm text-emerald-700">Sound</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Selector */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Select Difficulty:</span>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <Button
                key={diff}
                variant={selectedDifficulty === diff ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(diff)}
                className={`capitalize ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {diff}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Mode Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameModes.map((mode, index) => {
          const Icon = mode.icon;
          const highScore = highScores[mode.id] || 0;
          
          return (
            <Card
              key={mode.id}
              className={`group cursor-pointer overflow-hidden border-2 border-transparent hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-200/50 ${mode.bgColor}`}
              onClick={() => onStartGame(mode.id, selectedDifficulty)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-emerald-900">{mode.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {mode.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-700/70 mb-3">{mode.description}</p>
                    {highScore > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Trophy className="w-3 h-3" />
                        <span>Best: {highScore} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-sm text-emerald-600/60">
          Learn and memorize Islamic Duas and Quran Surahs while having fun!
        </p>
      </div>
    </div>
  );
}
