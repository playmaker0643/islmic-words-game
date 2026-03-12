import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Sparkles, Timer, Trophy, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { islamicTerms, duas, surahs, scrambleWord, getRandomItems } from '@/data/gameData';
import { type GameStats, type Difficulty } from '@/hooks/useGameState';

interface WordScrambleProps {
  difficulty: Difficulty;
  stats: GameStats;
  onScore: (points: number, isCorrect: boolean) => void;
  onEndGame: () => void;
  formatTime: (seconds: number) => string;
}

interface WordItem {
  original: string;
  scrambled: string;
  hint: string;
  category: string;
}

export function WordScramble({ difficulty, stats, onScore, onEndGame, formatTime }: WordScrambleProps) {
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Generate words based on difficulty
  useEffect(() => {
    const wordCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    
    const allWords: WordItem[] = [
      ...islamicTerms.map(t => ({
        original: t.term.toUpperCase(),
        scrambled: scrambleWord(t.term.toUpperCase()),
        hint: t.meaning,
        category: t.category,
      })),
      ...duas.map(d => ({
        original: d.title.split(' ').slice(-1)[0].toUpperCase(),
        scrambled: scrambleWord(d.title.split(' ').slice(-1)[0].toUpperCase()),
        hint: d.occasion,
        category: 'Dua',
      })),
      ...surahs.map(s => ({
        original: s.name.toUpperCase(),
        scrambled: scrambleWord(s.name.toUpperCase()),
        hint: s.englishName,
        category: 'Surah',
      })),
    ];

    setWords(getRandomItems(allWords, wordCount));
  }, [difficulty]);

  const currentWord = words[currentIndex];

  const checkAnswer = useCallback(() => {
    if (!currentWord || !userInput.trim()) return;

    const isCorrect = userInput.trim().toUpperCase() === currentWord.original;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const points = isCorrect 
      ? (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20) * (stats.streak + 1)
      : 0;
    
    onScore(points, isCorrect);

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserInput('');
        setFeedback(null);
        setShowHint(false);
      } else {
        setGameComplete(true);
      }
    }, 1500);
  }, [currentWord, userInput, currentIndex, words.length, difficulty, stats.streak, onScore]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const getHintPenalty = () => {
    return difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5;
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen islamic-pattern py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-emerald-100">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Level Complete!</h2>
            <p className="text-emerald-600 mb-6">Great job unscrambling the words!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600">Final Score</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.score}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-600">Correct</p>
                <p className="text-2xl font-bold text-amber-900">{stats.correctAnswers}/{words.length}</p>
              </div>
            </div>

            <Button 
              onClick={onEndGame}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen islamic-pattern py-4 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onEndGame} className="text-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-600">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <Timer className="w-4 h-4" />
              <span className="font-mono">{formatTime(stats.timeSpent)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <Progress 
            value={(currentIndex / words.length) * 100} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-emerald-600 font-medium">
            {currentIndex + 1}/{words.length}
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-emerald-100 shadow-xl">
          <CardContent className="p-8">
            {/* Category Badge */}
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {currentWord.category}
              </Badge>
            </div>

            {/* Scrambled Word */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {currentWord.scrambled.split('').map((letter, index) => (
                <div
                  key={index}
                  className="w-12 h-14 md:w-14 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg letter-pop"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Hint */}
            {showHint && (
              <div className="text-center mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-700 text-sm">
                  <span className="font-medium">Hint:</span> {currentWord.hint}
                </p>
              </div>
            )}

            {/* Input */}
            <div className="space-y-4">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className={`text-center text-lg uppercase tracking-wider h-14 ${
                  feedback === 'correct' 
                    ? 'border-green-500 bg-green-50' 
                    : feedback === 'wrong'
                    ? 'border-red-500 bg-red-50'
                    : 'border-emerald-200'
                }`}
                disabled={feedback !== null}
                autoFocus
              />

              {/* Feedback */}
              {feedback && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                  feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {feedback === 'correct' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Correct! +{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20} points</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span className="font-medium">Wrong! The answer was: {currentWord.original}</span>
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    setShowHint(true);
                    onScore(-getHintPenalty(), false);
                  }}
                  disabled={showHint || feedback !== null}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Hint (-{getHintPenalty()} pts)
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  onClick={checkAnswer}
                  disabled={!userInput.trim() || feedback !== null}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Display */}
        <div className="mt-6 text-center">
          <p className="text-emerald-700">
            Score: <span className="font-bold text-xl">{stats.score}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
