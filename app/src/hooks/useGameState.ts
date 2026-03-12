import { useState, useCallback, useEffect } from 'react';

export type GameMode = 'menu' | 'scramble' | 'fillblank' | 'wordsearch' | 'quiz' | 'results';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameStats {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  maxStreak: number;
  timeSpent: number;
  level: number;
}

export interface GameState {
  mode: GameMode;
  difficulty: Difficulty;
  stats: GameStats;
  isPlaying: boolean;
  isPaused: boolean;
}

const initialStats: GameStats = {
  score: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  streak: 0,
  maxStreak: 0,
  timeSpent: 0,
  level: 1,
};

const initialState: GameState = {
  mode: 'menu',
  difficulty: 'easy',
  stats: initialStats,
  isPlaying: false,
  isPaused: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // Start a new game
  const startGame = useCallback((mode: GameMode, difficulty: Difficulty = 'easy') => {
    setGameState({
      mode,
      difficulty,
      stats: { ...initialStats },
      isPlaying: true,
      isPaused: false,
    });
  }, []);

  // End the game
  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      mode: 'results',
      isPlaying: false,
    }));
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [timer]);

  // Return to menu
  const returnToMenu = useCallback(() => {
    setGameState(initialState);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [timer]);

  // Update score
  const updateScore = useCallback((points: number, isCorrect: boolean) => {
    setGameState(prev => {
      const newStreak = isCorrect ? prev.stats.streak + 1 : 0;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          score: prev.stats.score + points,
          correctAnswers: isCorrect ? prev.stats.correctAnswers + 1 : prev.stats.correctAnswers,
          wrongAnswers: !isCorrect ? prev.stats.wrongAnswers + 1 : prev.stats.wrongAnswers,
          streak: newStreak,
          maxStreak: Math.max(prev.stats.maxStreak, newStreak),
        },
      };
    });
  }, []);

  // Increment time
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            timeSpent: prev.stats.timeSpent + 1,
          },
        }));
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [gameState.isPlaying, gameState.isPaused]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Level up
  const levelUp = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        level: prev.stats.level + 1,
      },
    }));
  }, []);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    gameState,
    startGame,
    endGame,
    returnToMenu,
    updateScore,
    togglePause,
    levelUp,
    formatTime,
  };
}
