import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Timer, Target, Gamepad2, Rocket, Star, Zap, Palette, Music, Crown, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameCard {
  id: number;
  icon: any;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = [Gamepad2, Rocket, Star, Zap, Palette, Music, Crown, Heart];

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
    ICONS.forEach((icon, index) => {
      // Add two cards for each icon (pair)
      shuffledCards.push(
        { id: index * 2, icon, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, icon, isFlipped: false, isMatched: false }
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

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
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
    <div className="min-h-screen game-container p-4 md:p-6">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold game-title mb-4">
            MEMORY GAME
          </h1>
          <p className="text-foreground/80 text-lg md:text-xl font-medium px-4">
            Find all the matching pairs and test your memory!
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-12 px-4">
          <Card className="stats-card flex-1 max-w-[200px] mx-auto sm:mx-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">Moves</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                  {moves}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="stats-card flex-1 max-w-[200px] mx-auto sm:mx-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/20">
                <Timer className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">Time</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  {formatTime(timeElapsed)}
                </p>
              </div>
            </div>
          </Card>

          <Button 
            onClick={initializeGame}
            className="glow-button flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold w-full sm:w-auto max-w-[200px] mx-auto sm:mx-0"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            New Game
          </Button>
        </div>

        {/* Game Grid */}
        <div className="game-grid max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-12 px-4">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-face memory-card-back">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[1.3rem]" />
                    <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                  </div>
                  <div 
                    className={`memory-card-face memory-card-front ${
                      card.isMatched ? 'matched' : ''
                    }`}
                  >
                    <IconComponent className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="text-center bounce-in px-4">
            <div className="win-message text-foreground p-6 md:p-8 rounded-3xl max-w-lg mx-auto">
              <Crown className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-success" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">
                AMAZING!
              </h2>
              <p className="text-base md:text-lg mb-6 text-foreground/80">
                You completed the game in <span className="font-bold text-primary">{moves}</span> moves 
                and <span className="font-bold text-secondary">{formatTime(timeElapsed)}</span>!
              </p>
              <Button 
                onClick={initializeGame}
                className="glow-button px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold flex items-center gap-2 mx-auto"
              >
                <Rocket className="w-4 h-4 md:w-5 md:h-5" />
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