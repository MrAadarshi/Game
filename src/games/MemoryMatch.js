import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const MemoryMatch = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  const gameTimerRef = useRef(null);
  const flipTimerRef = useRef(null);

  // Card symbols for different difficulties
  const cardSymbols = {
    easy: ['🎮', '🎯', '🎲', '🃏', '🎪', '🎨'],
    medium: ['🎮', '🎯', '🎲', '🃏', '🎪', '🎨', '🎭', '🎸'],
    hard: ['🎮', '🎯', '🎲', '🃏', '🎪', '🎨', '🎭', '🎸', '🎺', '🎪', '🎊', '🎈']
  };

  // Generate card deck
  const generateCards = useCallback(() => {
    const symbols = cardSymbols[difficulty];
    const pairs = [...symbols, ...symbols]; // Create pairs
    
    // Shuffle the cards
    const shuffled = pairs
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    
    return shuffled;
  }, [difficulty]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setCards(generateCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimeLeft(120);
    setScore(0);
    setCoinsEarned(0);
  };

  // Handle card click
  const handleCardClick = (cardId) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);

      if (card1.symbol === card2.symbol) {
        // Match found!
        const newMatchedCards = [...matchedCards, ...newFlippedCards];
        setMatchedCards(newMatchedCards);
        setFlippedCards([]);
        
        // Calculate score based on speed and difficulty
        const timeBonus = Math.max(0, timeLeft - 60) * 2;
        const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
        const movesPenalty = Math.max(0, moves - 10) * 2;
        const roundScore = Math.round((50 + timeBonus - movesPenalty) * difficultyMultiplier);
        
        setScore(prev => prev + Math.max(roundScore, 10));

        // Check if all cards are matched
        if (newMatchedCards.length === cards.length) {
          endGame();
        }
      } else {
        // No match, flip cards back after delay
        flipTimerRef.current = setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // End game
  const endGame = useCallback(() => {
    setGameState('finished');
    
    // Calculate final coins based on performance
    let coins = Math.floor(score / 20); // Base coins
    
    // Time bonus
    if (timeLeft > 60) coins += 20;
    else if (timeLeft > 30) coins += 10;
    else if (timeLeft > 0) coins += 5;
    
    // Moves efficiency bonus
    const totalPairs = cards.length / 2;
    const perfectMoves = totalPairs;
    if (moves <= perfectMoves + 2) coins += 25; // Nearly perfect
    else if (moves <= perfectMoves + 5) coins += 15; // Good efficiency
    else if (moves <= perfectMoves + 10) coins += 10; // Decent efficiency
    
    // Difficulty bonus
    if (difficulty === 'hard') coins += 30;
    else if (difficulty === 'medium') coins += 15;
    else if (difficulty === 'easy') coins += 5;
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Memory Match completed');
      if (matchedCards.length === cards.length && timeLeft > 30) {
        triggerEffect(); // Trigger effect for excellent performance
      }
    }
  }, [cards.length, matchedCards.length, moves, score, timeLeft, difficulty, user, updateVirtualBalance, triggerEffect]);

  // Game timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    
    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, [gameState, timeLeft, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'var(--accent-green)';
      case 'medium': return '#FFB400';
      case 'hard': return 'var(--accent-red)';
      default: return 'var(--accent-color)';
    }
  };

  const getGridColumns = () => {
    switch (difficulty) {
      case 'easy': return 4; // 3x4 grid
      case 'medium': return 4; // 4x4 grid
      case 'hard': return 6; // 4x6 grid
      default: return 4;
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        border: '1px solid #8B5CF6',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#8B5CF6',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Memory Match
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Test your memory and earn coins!
        </p>
      </div>

      {/* Waiting State */}
      {gameState === 'waiting' && (
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎯</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Ready to Test Your Memory?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Find matching pairs of cards as quickly as possible. Choose your difficulty level!
          </p>
          
          {/* Difficulty Selection */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {['easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                style={{
                  background: difficulty === diff 
                    ? getDifficultyColor(diff) 
                    : 'var(--glass-bg)',
                  color: difficulty === diff ? '#fff' : 'var(--text-primary)',
                  border: `2px solid ${getDifficultyColor(diff)}`,
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize'
                }}
              >
                {diff}
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {diff === 'easy' && '6 pairs (3x4)'}
                  {diff === 'medium' && '8 pairs (4x4)'}
                  {diff === 'hard' && '12 pairs (4x6)'}
                </div>
              </button>
            ))}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Speed Bonus</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Faster completion</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Efficiency</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fewer moves</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>More Coins</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Higher difficulty</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Start Memory Match
          </button>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && (
        <div>
          {/* Game Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--accent-red)', fontSize: '1.5rem', fontWeight: '800' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Time Left</div>
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: '800' }}>
                {score}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Score</div>
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--accent-green)', fontSize: '1.5rem', fontWeight: '800' }}>
                {matchedCards.length / 2}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pairs Found</div>
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: '800' }}>
                {moves}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Moves</div>
            </div>
          </div>

          {/* Game Board */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)'
          }}>
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  aspectRatio: '1',
                  background: flippedCards.includes(card.id) || matchedCards.includes(card.id)
                    ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                    : 'linear-gradient(135deg, var(--glass-bg), rgba(255,255,255,0.1))',
                  border: '2px solid var(--border-color)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  cursor: flippedCards.length < 2 && !flippedCards.includes(card.id) && !matchedCards.includes(card.id) 
                    ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  transform: flippedCards.includes(card.id) || matchedCards.includes(card.id) 
                    ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  opacity: matchedCards.includes(card.id) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!flippedCards.includes(card.id) && !matchedCards.includes(card.id) && flippedCards.length < 2) {
                    e.target.style.transform = 'rotateY(160deg) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!flippedCards.includes(card.id) && !matchedCards.includes(card.id)) {
                    e.target.style.transform = 'rotateY(180deg) scale(1)';
                  }
                }}
              >
                {flippedCards.includes(card.id) || matchedCards.includes(card.id) 
                  ? card.symbol 
                  : '❓'
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finished State */}
      {gameState === 'finished' && (
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {matchedCards.length === cards.length ? '🏆' : timeLeft === 0 ? '⏰' : '🎯'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            {matchedCards.length === cards.length ? 'Perfect Memory!' : timeLeft === 0 ? 'Time\'s Up!' : 'Game Complete!'}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#8B5CF6' }}>
                {score}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Final Score</div>
            </div>
            
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                {matchedCards.length / 2}/{cards.length / 2}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Pairs Found</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--primary-gold)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-gold)' }}>
                🪙 {coinsEarned}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Coins Earned</div>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              📊 Game Statistics
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Difficulty: <span style={{ color: getDifficultyColor(difficulty), textTransform: 'capitalize' }}>{difficulty}</span> <br/>
              Total Moves: {moves} <br/>
              Time Remaining: {formatTime(timeLeft)} <br/>
              Efficiency: {cards.length > 0 ? Math.round(((cards.length / 2) / Math.max(moves, 1)) * 100) : 0}%
            </div>
          </div>
          
          <button
            onClick={() => setGameState('waiting')}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch; 