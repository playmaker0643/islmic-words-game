import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Timer, Trophy, Flame, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { duas, getRandomItems } from '@/data/gameData';
import { type GameStats, type Difficulty } from '@/hooks/useGameState';

interface FillInBlankProps {
  difficulty: Difficulty;
  stats: GameStats;
  onScore: (points: number, isCorrect: boolean) => void;
  onEndGame: () => void;
  formatTime: (seconds: number) => string;
}

interface QuestionItem {
  dua: typeof duas[0];
  missingWord: string;
  displayText: string;
  options: string[];
}

export function FillInBlank({ difficulty, stats, onScore, onEndGame, formatTime }: FillInBlankProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Generate questions
  useEffect(() => {
    const questionCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    const selectedDuas = getRandomItems(duas, questionCount);

    const generatedQuestions: QuestionItem[] = selectedDuas.map(dua => {
      const words = dua.transliteration.split(' ');
      // Pick a significant word (not too short, not too long)
      const validWords = words.filter(w => w.length > 3 && w.length < 12 && /^[a-zA-Z]+$/.test(w));
      const missingWord = validWords[Math.floor(Math.random() * validWords.length)];
      
      // Create display text with blank
      const displayText = dua.transliteration.replace(missingWord, '_____');
      
      // Generate options (1 correct + 3 wrong)
      const wrongOptions = getRandomItems(
        words.filter(w => w !== missingWord && w.length > 3),
        3
      );
      const options = [missingWord, ...wrongOptions].sort(() => 0.5 - Math.random());

      return {
        dua,
        missingWord,
        displayText,
        options,
      };
    });

    setQuestions(generatedQuestions);
  }, [difficulty]);

  const currentQuestion = questions[currentIndex];

  const checkAnswer = useCallback((option: string) => {
    if (!currentQuestion || feedback !== null) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestion.missingWord;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const points = isCorrect 
      ? (difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25) * (stats.streak + 1)
      : 0;
    
    onScore(points, isCorrect);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
        setShowHint(false);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  }, [currentQuestion, currentIndex, questions.length, difficulty, stats.streak, onScore, feedback]);

  if (gameComplete) {
    return (
      <div className="min-h-screen islamic-pattern py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-emerald-100">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Level Complete!</h2>
            <p className="text-emerald-600 mb-6">You completed the Dua verses!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600">Final Score</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.score}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-600">Correct</p>
                <p className="text-2xl font-bold text-amber-900">{stats.correctAnswers}/{questions.length}</p>
              </div>
            </div>

            <Button 
              onClick={onEndGame}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen islamic-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
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
            value={(currentIndex / questions.length) * 100} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-emerald-600 font-medium">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-amber-100 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* Title */}
            <div className="flex justify-between items-center mb-6">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {currentQuestion.dua.title}
              </Badge>
              <Badge variant="outline" className="text-emerald-600">
                {currentQuestion.dua.category}
              </Badge>
            </div>

            {/* Arabic Text */}
            <div className="text-center mb-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl md:text-3xl text-emerald-900 font-arabic leading-relaxed" dir="rtl">
                {currentQuestion.dua.arabic}
              </p>
            </div>

            {/* Question with blank */}
            <div className="mb-6">
              <p className="text-lg text-emerald-800 text-center leading-relaxed">
                {currentQuestion.displayText.split('_____').map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <span className="inline-block mx-1 px-3 py-1 bg-amber-100 border-2 border-amber-300 rounded text-amber-800 font-bold">
                        ?
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Translation Hint:</span>
                </div>
                <p className="text-sm text-amber-700">{currentQuestion.dua.translation}</p>
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-14 text-lg font-medium transition-all ${
                    selectedOption === option
                      ? feedback === 'correct'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : feedback === 'wrong'
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-amber-100 border-amber-300 text-amber-800'
                      : feedback === 'correct' && option === currentQuestion.missingWord
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                  onClick={() => checkAnswer(option)}
                  disabled={feedback !== null}
                >
                  {option}
                </Button>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {feedback === 'correct' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Correct! +{difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25} points</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span className="font-medium">Wrong! The answer was: {currentQuestion.missingWord}</span>
                  </>
                )}
              </div>
            )}

            {/* Hint Button */}
            {!showHint && feedback === null && (
              <Button
                variant="ghost"
                className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  setShowHint(true);
                  onScore(-3, false);
                }}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Show Hint (-3 pts)
              </Button>
            )}
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
