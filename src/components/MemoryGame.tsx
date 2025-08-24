import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Timer, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🚀', '🌟', '🎯', '🎨', '🎪', '🎭', '🎸'];

const MemoryGame = () => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const shuffledCards: GameCard[] = [];
    EMOJIS.forEach((emoji, index) => {
      // Add two cards for each emoji (pair)
      shuffledCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle the cards
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setTimeElapsed(0);
    setGameWon(false);
    setGameStarted(false);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isMatched: true }
              : c
          ));
          setFlippedCards([]);
          
          // Check if game is won
          const allMatched = cards.every(c => 
            c.id === firstCardId || c.id === secondCardId || c.isMatched
          );
          
          if (allMatched) {
            setGameWon(true);
            toast({
              title: "🎉 Congratulations!",
              description: `You won in ${moves + 1} moves and ${timeElapsed} seconds!`,
              duration: 5000,
            });
          }
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Memory Card Game
          </h1>
          <p className="text-muted-foreground text-lg">
            Find all the matching pairs!
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Card className="stats-card">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Moves</p>
                <p className="text-2xl font-bold text-primary">{moves}</p>
              </div>
            </div>
          </Card>
          
          <Card className="stats-card">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</p>
              </div>
            </div>
          </Card>

          <Button 
            onClick={initializeGame}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </div>

        {/* Game Grid */}
        <div className="game-grid max-w-lg mx-auto mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-face memory-card-back" />
                <div 
                  className={`memory-card-face memory-card-front ${
                    card.isMatched ? 'matched' : ''
                  }`}
                >
                  {card.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="text-center bounce-in">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2">🎉 You Won!</h2>
              <p className="mb-4">
                Completed in {moves} moves and {formatTime(timeElapsed)}
              </p>
              <Button 
                onClick={initializeGame}
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;