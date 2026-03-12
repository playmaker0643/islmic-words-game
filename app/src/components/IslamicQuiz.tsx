import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Timer, Trophy, Flame, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { quizQuestions, getRandomItems } from '@/data/gameData';
import { type GameStats, type Difficulty } from '@/hooks/useGameState';

interface IslamicQuizProps {
  difficulty: Difficulty;
  stats: GameStats;
  onScore: (points: number, isCorrect: boolean) => void;
  onEndGame: () => void;
  formatTime: (seconds: number) => string;
}

export function IslamicQuiz({ difficulty, stats, onScore, onEndGame, formatTime }: IslamicQuizProps) {
  const [questions, setQuestions] = useState<typeof quizQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  // Filter and shuffle questions based on difficulty
  useEffect(() => {
    const filteredQuestions = quizQuestions.filter(q => {
      if (difficulty === 'easy') return q.difficulty === 'easy';
      if (difficulty === 'medium') return q.difficulty === 'easy' || q.difficulty === 'medium';
      return true; // hard includes all
    });

    const questionCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    setQuestions(getRandomItems(filteredQuestions, questionCount));
  }, [difficulty]);

  const currentQuestion = questions[currentIndex];

  const checkAnswer = useCallback((optionIndex: number) => {
    if (!currentQuestion || feedback !== null) return;

    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const points = isCorrect 
      ? (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20) * (stats.streak + 1)
      : 0;
    
    onScore(points, isCorrect);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  }, [currentQuestion, currentIndex, questions.length, difficulty, stats.streak, onScore, feedback]);

  const getOptionStyle = (index: number) => {
    if (selectedOption === index) {
      if (feedback === 'correct') {
        return 'bg-green-100 border-green-500 text-green-700';
      }
      if (feedback === 'wrong') {
        return 'bg-red-100 border-red-500 text-red-700';
      }
      return 'bg-rose-100 border-rose-300 text-rose-800';
    }
    if (feedback === 'correct' && index === currentQuestion?.correctAnswer) {
      return 'bg-green-100 border-green-500 text-green-700';
    }
    return 'border-emerald-200 text-emerald-700 hover:bg-emerald-50';
  };

  if (gameComplete) {
    const accuracy = Math.round((stats.correctAnswers / questions.length) * 100);
    
    return (
      <div className="min-h-screen islamic-pattern py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-emerald-100">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Quiz Complete!</h2>
            <p className="text-emerald-600 mb-6">Test your knowledge and learn more!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600">Final Score</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.score}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4">
                <p className="text-sm text-rose-600">Accuracy</p>
                <p className="text-2xl font-bold text-rose-900">{accuracy}%</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-600 mb-1">Performance</p>
              <p className="text-lg font-bold text-amber-900">
                {accuracy >= 90 ? 'Excellent! 🌟' : 
                 accuracy >= 70 ? 'Great Job! ⭐' : 
                 accuracy >= 50 ? 'Good Effort! 👍' : 
                 'Keep Learning! 📚'}
              </p>
            </div>

            <Button 
              onClick={onEndGame}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
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
        <Card className="bg-white/95 backdrop-blur-sm border-rose-100 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* Category & Difficulty */}
            <div className="flex justify-between items-center mb-6">
              <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                <BookOpen className="w-3 h-3 mr-1" />
                {currentQuestion.category}
              </Badge>
              <Badge variant="outline" className={`
                ${currentQuestion.difficulty === 'easy' ? 'text-green-600 border-green-200' :
                  currentQuestion.difficulty === 'medium' ? 'text-amber-600 border-amber-200' :
                  'text-red-600 border-red-200'}
              `}>
                {currentQuestion.difficulty}
              </Badge>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-emerald-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full h-auto py-4 px-6 text-left justify-start text-base font-medium transition-all ${getOptionStyle(index)}`}
                  onClick={() => checkAnswer(index)}
                  disabled={feedback !== null}
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-4 shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {feedback !== null && index === currentQuestion.correctAnswer && (
                    <Check className="w-5 h-5 text-green-600 ml-2" />
                  )}
                  {feedback === 'wrong' && selectedOption === index && (
                    <X className="w-5 h-5 text-red-600 ml-2" />
                  )}
                </Button>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mt-6 flex items-center justify-center gap-2 p-4 rounded-lg ${
                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {feedback === 'correct' ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">
                      Correct! +{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20} points
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span className="font-medium">
                      Incorrect! The correct answer was: {currentQuestion.options[currentQuestion.correctAnswer]}
                    </span>
                  </>
                )}
              </div>
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
