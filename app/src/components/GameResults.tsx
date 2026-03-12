import { useEffect, useState } from 'react';
import { Trophy, Star, Timer, Target, Flame, RotateCcw, Home, Share2, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type GameStats, type GameMode } from '@/hooks/useGameState';

interface GameResultsProps {
  mode: GameMode;
  stats: GameStats;
  formatTime: (seconds: number) => string;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export function GameResults({ mode, stats, formatTime, onPlayAgain, onReturnHome }: GameResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getModeName = (mode: GameMode) => {
    switch (mode) {
      case 'scramble': return 'Word Scramble';
      case 'fillblank': return 'Fill in the Blank';
      case 'wordsearch': return 'Word Search';
      case 'quiz': return 'Islamic Quiz';
      default: return 'Game';
    }
  };

  const getModeColor = (mode: GameMode) => {
    switch (mode) {
      case 'scramble': return 'from-emerald-500 to-teal-600';
      case 'fillblank': return 'from-amber-500 to-orange-600';
      case 'wordsearch': return 'from-violet-500 to-purple-600';
      case 'quiz': return 'from-rose-500 to-pink-600';
      default: return 'from-emerald-500 to-teal-600';
    }
  };

  const getPerformanceMessage = () => {
    const accuracy = stats.correctAnswers + stats.wrongAnswers > 0 
      ? (stats.correctAnswers / (stats.correctAnswers + stats.wrongAnswers)) * 100 
      : 0;
    
    if (accuracy >= 90) return { message: 'Outstanding! 🌟', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    if (accuracy >= 75) return { message: 'Excellent! ⭐', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    if (accuracy >= 60) return { message: 'Great Job! 👍', color: 'text-violet-600', bgColor: 'bg-violet-50' };
    if (accuracy >= 40) return { message: 'Good Effort! 💪', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { message: 'Keep Learning! 📚', color: 'text-rose-600', bgColor: 'bg-rose-50' };
  };

  const performance = getPerformanceMessage();
  const totalQuestions = stats.correctAnswers + stats.wrongAnswers;
  const accuracy = totalQuestions > 0 ? Math.round((stats.correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen islamic-pattern py-8 px-4 flex items-center justify-center">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <Star 
                className="w-4 h-4 text-amber-400" 
                fill="currentColor"
                style={{ transform: `rotate(${Math.random() * 360}deg)` }}
              />
            </div>
          ))}
        </div>
      )}

      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm border-emerald-100 shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${getModeColor(mode)} rounded-full flex items-center justify-center shadow-lg`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Game Complete!</h1>
            <p className="text-emerald-600">{getModeName(mode)}</p>
          </div>

          {/* Performance Badge */}
          <div className={`${performance.bgColor} rounded-xl p-4 mb-6 text-center`}>
            <p className={`text-xl font-bold ${performance.color}`}>{performance.message}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-emerald-600">Final Score</span>
              </div>
              <p className="text-3xl font-bold text-emerald-900">{stats.score}</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-amber-600">Accuracy</span>
              </div>
              <p className="text-3xl font-bold text-amber-900">{accuracy}%</p>
            </div>

            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-violet-500" />
                <span className="text-sm text-violet-600">Correct</span>
              </div>
              <p className="text-3xl font-bold text-violet-900">{stats.correctAnswers}</p>
            </div>

            <div className="bg-rose-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span className="text-sm text-rose-600">Wrong</span>
              </div>
              <p className="text-3xl font-bold text-rose-900">{stats.wrongAnswers}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-blue-600">Time</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{formatTime(stats.timeSpent)}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-orange-600">Best Streak</span>
              </div>
              <p className="text-3xl font-bold text-orange-900">{stats.maxStreak}</p>
            </div>
          </div>

          {/* Achievement Badge */}
          {stats.maxStreak >= 5 && (
            <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border border-amber-200">
              <Medal className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-bold text-amber-800">Streak Master!</p>
                <p className="text-sm text-amber-600">You achieved a streak of {stats.maxStreak}!</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onPlayAgain}
              className={`w-full bg-gradient-to-r ${getModeColor(mode)} hover:opacity-90 text-white`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={onReturnHome}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Main Menu
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Islamic Words Game',
                      text: `I scored ${stats.score} points in ${getModeName(mode)}! Can you beat my score?`,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components for stats
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
