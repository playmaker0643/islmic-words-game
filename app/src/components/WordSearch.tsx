import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Check, Timer, Trophy, Flame, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Progress } from '@/components/ui/progress';
import { wordSearchWords, getRandomItems } from '@/data/gameData';
import { type GameStats, type Difficulty } from '@/hooks/useGameState';

interface WordSearchProps {
  difficulty: Difficulty;
  stats: GameStats;
  onScore: (points: number, isCorrect: boolean) => void;
  onEndGame: () => void;
  formatTime: (seconds: number) => string;
}

interface Cell {
  letter: string;
  isSelected: boolean;
  isFound: boolean;
  wordId?: string;
}

interface WordToFind {
  word: string;
  found: boolean;
  positions: { row: number; col: number }[];
}

export function WordSearch({ difficulty, stats, onScore, onEndGame, formatTime }: WordSearchProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<WordToFind[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const gridSize = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12;
  const wordCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;

  // Initialize grid
  useEffect(() => {
    const words = getRandomItems(wordSearchWords, wordCount).map(w => w.toUpperCase());
    const newGrid: Cell[][] = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => ({ letter: '', isSelected: false, isFound: false }))
    );

    const placedWords: WordToFind[] = [];

    // Place words in grid
    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const reverse = Math.random() > 0.5;
        const actualWord = reverse ? word.split('').reverse().join('') : word;
        
        let startRow: number, startCol: number;
        
        if (direction === 0) { // horizontal
          startRow = Math.floor(Math.random() * gridSize);
          startCol = Math.floor(Math.random() * (gridSize - actualWord.length + 1));
        } else if (direction === 1) { // vertical
          startRow = Math.floor(Math.random() * (gridSize - actualWord.length + 1));
          startCol = Math.floor(Math.random() * gridSize);
        } else { // diagonal
          startRow = Math.floor(Math.random() * (gridSize - actualWord.length + 1));
          startCol = Math.floor(Math.random() * (gridSize - actualWord.length + 1));
        }

        // Check if space is available
        let canPlace = true;
        const positions: { row: number; col: number }[] = [];
        
        for (let i = 0; i < actualWord.length; i++) {
          let row = startRow;
          let col = startCol;
          
          if (direction === 0) col += i;
          else if (direction === 1) row += i;
          else { row += i; col += i; }

          if (newGrid[row][col].letter !== '' && newGrid[row][col].letter !== actualWord[i]) {
            canPlace = false;
            break;
          }
          positions.push({ row, col });
        }

        if (canPlace) {
          for (let i = 0; i < actualWord.length; i++) {
            const { row, col } = positions[i];
            newGrid[row][col].letter = actualWord[i];
          }
          placedWords.push({ word, found: false, positions });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (newGrid[row][col].letter === '') {
          newGrid[row][col].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWordsToFind(placedWords);
  }, [difficulty, gridSize, wordCount]);

  // Check if game is complete
  useEffect(() => {
    if (wordsToFind.length > 0 && wordsToFind.every(w => w.found)) {
      setGameComplete(true);
    }
  }, [wordsToFind]);

  const handleMouseDown = (row: number, col: number) => {
    if (grid[row][col].isFound) return;
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging) return;
    if (grid[row][col].isFound) return;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    // Check if adjacent
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    if (rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0)) {
      // Check if already in selection
      const alreadySelected = selectedCells.some(c => c.row === row && c.col === col);
      if (!alreadySelected) {
        setSelectedCells(prev => [...prev, { row, col }]);
      }
    }
  };

  const handleMouseUp = useCallback(() => {
    if (!isDragging || selectedCells.length === 0) return;
    
    setIsDragging(false);
    
    // Form word from selected cells
    const selectedWord = selectedCells.map(c => grid[c.row][c.col].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    // Check if word matches any unfound word
    const matchedWordIndex = wordsToFind.findIndex(
      w => !w.found && (w.word === selectedWord || w.word === reversedWord)
    );

    if (matchedWordIndex !== -1) {
      // Word found!
      const newGrid = [...grid];
      selectedCells.forEach(c => {
        newGrid[c.row][c.col].isFound = true;
      });
      setGrid(newGrid);

      const newWordsToFind = [...wordsToFind];
      newWordsToFind[matchedWordIndex].found = true;
      setWordsToFind(newWordsToFind);

      const points = (difficulty === 'easy' ? 20 : difficulty === 'medium' ? 25 : 30) * (stats.streak + 1);
      onScore(points, true);
    }

    setSelectedCells([]);
  }, [isDragging, selectedCells, grid, wordsToFind, difficulty, stats.streak, onScore]);

  const getCellStyle = (row: number, col: number) => {
    const cell = grid[row][col];
    const isSelected = selectedCells.some(c => c.row === row && c.col === col);
    
    if (cell.isFound) {
      return 'bg-emerald-500 text-white';
    }
    if (isSelected) {
      return 'bg-amber-400 text-white';
    }
    return 'bg-white text-emerald-800 hover:bg-emerald-50';
  };

  const foundCount = wordsToFind.filter(w => w.found).length;

  if (gameComplete) {
    return (
      <div className="min-h-screen islamic-pattern py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-emerald-100">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">All Words Found!</h2>
            <p className="text-emerald-600 mb-6">Excellent searching skills!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-600">Final Score</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.score}</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-4">
                <p className="text-sm text-violet-600">Words Found</p>
                <p className="text-2xl font-bold text-violet-900">{foundCount}/{wordsToFind.length}</p>
              </div>
            </div>

            <Button 
              onClick={onEndGame}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen islamic-pattern py-4 px-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
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
            value={(foundCount / wordsToFind.length) * 100} 
            className="flex-1 h-2"
          />
          <span className="text-sm text-emerald-600 font-medium">
            {foundCount}/{wordsToFind.length}
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Word Grid */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border-violet-100 shadow-xl">
            <CardContent className="p-4">
              <div 
                ref={gridRef}
                className="grid gap-1"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  userSelect: 'none'
                }}
              >
                {grid.map((row, rowIndex) => 
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square flex items-center justify-center text-sm md:text-base font-bold rounded cursor-pointer transition-all duration-150
                        ${getCellStyle(rowIndex, colIndex)}
                      `}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    >
                      {cell.letter}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Word List */}
          <Card className="bg-white/95 backdrop-blur-sm border-violet-100 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-emerald-900">Words to Find</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWords(!showWords)}
                  className="text-violet-600"
                >
                  {showWords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {wordsToFind.map((word, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                      word.found 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {word.found && <Check className="w-4 h-4" />}
                    <span className={`font-medium ${word.found ? 'line-through opacity-60' : ''}`}>
                      {showWords || word.found ? word.word : '•'.repeat(word.word.length)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-violet-100">
                <p className="text-sm text-emerald-600 text-center">
                  Score: <span className="font-bold text-lg">{stats.score}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-emerald-600/70">
            Click and drag to select letters and find words
          </p>
        </div>
      </div>
    </div>
  );
}
