import { useState, useEffect, useCallback } from 'react';
import { GameMenu } from '@/components/GameMenu';
import { WordScramble } from '@/components/WordScramble';
import { FillInBlank } from '@/components/FillInBlank';
import { WordSearch } from '@/components/WordSearch';
import { IslamicQuiz } from '@/components/IslamicQuiz';
import { GameResults } from '@/components/GameResults';
import { useGameState, type GameMode, type Difficulty } from '@/hooks/useGameState';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const { 
    gameState, 
    startGame, 
    endGame, 
    returnToMenu, 
    updateScore, 
    formatTime 
  } = useGameState();
  
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('islamicWordsHighScores');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Save high scores to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('islamicWordsHighScores', JSON.stringify(highScores));
    }
  }, [highScores]);

  // Handle starting a game
  const handleStartGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
    startGame(mode, difficulty);
    toast.success(`Starting ${getModeName(mode)}!`, {
      description: `Difficulty: ${difficulty}`,
    });
  }, [startGame]);

  // Handle game end
  const handleEndGame = useCallback(() => {
    // Update high score if current score is higher
    if (gameState.mode && gameState.stats.score > (highScores[gameState.mode] || 0)) {
      setHighScores(prev => ({
        ...prev,
        [gameState.mode]: gameState.stats.score,
      }));
      toast.success('New High Score!', {
        description: `You achieved ${gameState.stats.score} points!`,
      });
    }
    endGame();
  }, [gameState.mode, gameState.stats.score, highScores, endGame]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    if (gameState.mode) {
      startGame(gameState.mode, gameState.difficulty);
    }
  }, [gameState.mode, gameState.difficulty, startGame]);

  // Handle score update with toast
  const handleScore = useCallback((points: number, isCorrect: boolean) => {
    updateScore(points, isCorrect);
    
    if (points > 0 && isCorrect) {
      toast.success(`+${points} points!`, {
        duration: 1000,
      });
    } else if (points < 0) {
      toast.info(`Hint used: ${points} points`, {
        duration: 1000,
      });
    }
  }, [updateScore]);

  const getModeName = (mode: GameMode) => {
    switch (mode) {
      case 'scramble': return 'Word Scramble';
      case 'fillblank': return 'Fill in the Blank';
      case 'wordsearch': return 'Word Search';
      case 'quiz': return 'Islamic Quiz';
      default: return 'Game';
    }
  };

  // Render current game mode
  const renderGame = () => {
    switch (gameState.mode) {
      case 'scramble':
        return (
          <WordScramble
            difficulty={gameState.difficulty}
            stats={gameState.stats}
            onScore={handleScore}
            onEndGame={handleEndGame}
            formatTime={formatTime}
          />
        );
      
      case 'fillblank':
        return (
          <FillInBlank
            difficulty={gameState.difficulty}
            stats={gameState.stats}
            onScore={handleScore}
            onEndGame={handleEndGame}
            formatTime={formatTime}
          />
        );
      
      case 'wordsearch':
        return (
          <WordSearch
            difficulty={gameState.difficulty}
            stats={gameState.stats}
            onScore={handleScore}
            onEndGame={handleEndGame}
            formatTime={formatTime}
          />
        );
      
      case 'quiz':
        return (
          <IslamicQuiz
            difficulty={gameState.difficulty}
            stats={gameState.stats}
            onScore={handleScore}
            onEndGame={handleEndGame}
            formatTime={formatTime}
          />
        );
      
      case 'results':
        return (
          <GameResults
            mode={gameState.mode === 'results' ? 'scramble' : gameState.mode}
            stats={gameState.stats}
            formatTime={formatTime}
            onPlayAgain={handlePlayAgain}
            onReturnHome={returnToMenu}
          />
        );
      
      default:
        return (
          <GameMenu
            onStartGame={handleStartGame}
            highScores={highScores}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {renderGame()}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
}

export default App;
