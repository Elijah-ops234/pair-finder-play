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
    <div className="min-h-screen game-container p-6">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold game-title mb-4">
            MEMORY GAME
          </h1>
          <p className="text-foreground/80 text-xl font-medium">
            ✨ Find all the matching pairs and test your memory! ✨
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 justify-center mb-12">
          <Card className="stats-card min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Moves</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                  {moves}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="stats-card min-w-[140px]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/20">
                <Timer className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Time</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  {formatTime(timeElapsed)}
                </p>
              </div>
            </div>
          </Card>

          <Button 
            onClick={initializeGame}
            className="glow-button flex items-center gap-3 px-8 py-6 text-lg font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </Button>
        </div>

        {/* Game Grid */}
        <div className="game-grid max-w-2xl mx-auto mb-12">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-face memory-card-back">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[1.3rem]" />
                  <span className="text-4xl">🎮</span>
                </div>
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
            <div className="win-message text-foreground p-8 rounded-3xl max-w-lg mx-auto">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
                AMAZING!
              </h2>
              <p className="text-lg mb-6 text-foreground/80">
                You completed the game in <span className="font-bold text-primary">{moves}</span> moves 
                and <span className="font-bold text-secondary">{formatTime(timeElapsed)}</span>!
              </p>
              <Button 
                onClick={initializeGame}
                className="glow-button px-8 py-4 text-lg font-semibold"
              >
                🚀 Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;