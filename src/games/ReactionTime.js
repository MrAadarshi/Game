import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const ReactionTime = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, active, result, finished
  const [reactions, setReactions] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [message, setMessage] = useState('');
  
  const totalRounds = 5;
  const waitTimerRef = useRef(null);
  const gameTimerRef = useRef(null);

  // Start game
  const startGame = () => {
    setGameState('ready');
    setReactions([]);
    setCurrentRound(0);
    setScore(0);
    setCoinsEarned(0);
    setAverageTime(0);
    setBestTime(0);
    setMessage('');
    startRound();
  };

  // Start a new round
  const startRound = () => {
    setGameState('ready');
    setMessage('Wait for the signal...');
    
    // Random wait time between 2-6 seconds
    const randomWait = Math.random() * 4000 + 2000;
    setWaitTime(randomWait);
    
    waitTimerRef.current = setTimeout(() => {
      setGameState('active');
      setStartTime(Date.now());
      setMessage('CLICK NOW!');
    }, randomWait);
  };

  // Handle user click
  const handleClick = () => {
    if (gameState === 'active') {
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      
      // Calculate score for this round
      let roundScore = 0;
      if (reaction < 200) roundScore = 100; // Excellent
      else if (reaction < 300) roundScore = 80; // Great
      else if (reaction < 400) roundScore = 60; // Good
      else if (reaction < 500) roundScore = 40; // Average
      else if (reaction < 700) roundScore = 20; // Slow
      else roundScore = 10; // Very slow
      
      const newReactions = [...reactions, reaction];
      setReactions(newReactions);
      setScore(prev => prev + roundScore);
      
      // Update best time
      if (bestTime === 0 || reaction < bestTime) {
        setBestTime(reaction);
      }
      
      setGameState('result');
      setMessage(getReactionMessage(reaction));
      
      // Move to next round or finish game
      setTimeout(() => {
        if (currentRound + 1 < totalRounds) {
          setCurrentRound(prev => prev + 1);
          startRound();
        } else {
          finishGame(newReactions);
        }
      }, 1500);
      
    } else if (gameState === 'ready') {
      // Clicked too early
      setGameState('result');
      setMessage('Too early! Wait for the signal.');
      setReactionTime(0);
      
      // Retry the round
      setTimeout(() => {
        startRound();
      }, 1500);
    }
  };

  // Get message based on reaction time
  const getReactionMessage = (time) => {
    if (time < 200) return `${time}ms - Lightning fast! ⚡`;
    if (time < 300) return `${time}ms - Excellent reflexes! 🎯`;
    if (time < 400) return `${time}ms - Great reaction! 👍`;
    if (time < 500) return `${time}ms - Good timing! ✅`;
    if (time < 700) return `${time}ms - Not bad! 👌`;
    return `${time}ms - Keep practicing! 💪`;
  };

  // Finish game
  const finishGame = useCallback((finalReactions) => {
    setGameState('finished');
    
    // Calculate average
    const avg = finalReactions.reduce((a, b) => a + b, 0) / finalReactions.length;
    setAverageTime(Math.round(avg));
    
    // Calculate coins earned based on performance
    let coins = Math.floor(score / 10); // Base coins
    
    // Bonus for excellent average
    if (avg < 250) coins += 50; // Lightning fast bonus
    else if (avg < 300) coins += 30; // Great average bonus
    else if (avg < 400) coins += 20; // Good average bonus
    else if (avg < 500) coins += 10; // Decent average bonus
    
    // Bonus for consistency (low variance)
    const variance = finalReactions.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / finalReactions.length;
    const standardDeviation = Math.sqrt(variance);
    
    if (standardDeviation < 50) coins += 25; // Very consistent
    else if (standardDeviation < 100) coins += 15; // Consistent
    else if (standardDeviation < 150) coins += 10; // Fairly consistent
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Reaction Time Challenge completed');
      if (avg < 300) {
        triggerEffect(); // Trigger effect for excellent performance
      }
    }
  }, [score, user, updateVirtualBalance, triggerEffect]);

  // Cleanup timers on unmount or state change
  useEffect(() => {
    return () => {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
      }
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, []);

  // Clear timers when game state changes
  useEffect(() => {
    if (gameState !== 'ready') {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
      }
    }
  }, [gameState]);

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'ready': return 'rgba(255, 193, 7, 0.1)';
      case 'active': return 'rgba(34, 197, 94, 0.2)';
      case 'result': return 'rgba(59, 130, 246, 0.1)';
      default: return 'var(--glass-bg)';
    }
  };

  const getBorderColor = () => {
    switch (gameState) {
      case 'ready': return '#FFC107';
      case 'active': return 'var(--accent-green)';
      case 'result': return '#3B82F6';
      default: return 'var(--border-color)';
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
        border: '1px solid var(--accent-red)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: 'var(--accent-red)',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Lightning Reflexes
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Test your reaction speed and earn coins!
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
            Ready to Test Your Reflexes?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Click as fast as you can when the screen turns green! You'll play 5 rounds to test your consistency.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Lightning Fast</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Under 200ms</div>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Consistency</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bonus Points</div>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🪙</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Earn Coins</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Based on Speed</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Start Reaction Test
          </button>
        </div>
      )}

      {/* Game Area */}
      {(gameState === 'ready' || gameState === 'active' || gameState === 'result') && (
        <div>
          {/* Round Progress */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            {Array.from({ length: totalRounds }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '40px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i <= currentRound 
                    ? 'var(--accent-green)' 
                    : 'rgba(255, 255, 255, 0.2)'
                }}
              />
            ))}
          </div>

          {/* Current Stats */}
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
              <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800' }}>
                {currentRound + 1}/{totalRounds}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Round</div>
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '800' }}>
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
              <div style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '800' }}>
                {bestTime > 0 ? `${bestTime}ms` : '--'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Best</div>
            </div>
          </div>

          {/* Click Area */}
          <div
            onClick={handleClick}
            style={{
              background: getBackgroundColor(),
              border: `3px solid ${getBorderColor()}`,
              borderRadius: '20px',
              padding: '4rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div style={{
              fontSize: '4rem',
              marginBottom: '2rem'
            }}>
              {gameState === 'ready' && '⏳'}
              {gameState === 'active' && '⚡'}
              {gameState === 'result' && '🎯'}
            </div>
            
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: gameState === 'active' ? 'var(--accent-green)' : 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              {message}
            </div>
            
            {gameState === 'result' && reactionTime > 0 && (
              <div style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)'
              }}>
                Click to continue to next round
              </div>
            )}
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
            {averageTime < 250 ? '🏆' : averageTime < 350 ? '🎯' : '💪'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Reaction Test Complete!
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                {score}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Final Score</div>
            </div>
            
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-red)' }}>
                {averageTime}ms
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Average Time</div>
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
              📊 Detailed Results
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Best Reaction: {bestTime}ms <br/>
              All Times: {reactions.map(r => `${r}ms`).join(', ')}
            </div>
          </div>
          
          <button
            onClick={() => setGameState('waiting')}
            style={{
              background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔄 Test Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionTime; 