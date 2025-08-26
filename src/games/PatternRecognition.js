import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const PatternRecognition = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, showing, playing, result, finished
  const [currentPattern, setCurrentPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showingPattern, setShowingPattern] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  const totalRounds = 10;
  const gameTimerRef = useRef(null);
  const patternTimerRef = useRef(null);

  // Pattern grid size based on difficulty
  const getGridSize = () => {
    switch (difficulty) {
      case 'easy': return 3; // 3x3 grid
      case 'medium': return 4; // 4x4 grid
      case 'hard': return 5; // 5x5 grid
      default: return 4;
    }
  };

  // Generate pattern based on difficulty
  const generatePattern = useCallback(() => {
    const gridSize = getGridSize();
    const totalCells = gridSize * gridSize;
    
    let patternLength;
    switch (difficulty) {
      case 'easy': patternLength = 3 + currentRound; // 3-12 cells
      case 'medium': patternLength = 4 + currentRound; // 4-13 cells
      case 'hard': patternLength = 5 + currentRound; // 5-14 cells
      default: patternLength = 4 + currentRound;
    }
    
    // Ensure pattern doesn't exceed grid size
    patternLength = Math.min(patternLength, Math.floor(totalCells * 0.8));
    
    const pattern = [];
    const usedCells = new Set();
    
    for (let i = 0; i < patternLength; i++) {
      let cellId;
      do {
        cellId = Math.floor(Math.random() * totalCells);
      } while (usedCells.has(cellId));
      
      usedCells.add(cellId);
      pattern.push(cellId);
    }
    
    return pattern;
  }, [difficulty, currentRound]);

  // Start game
  const startGame = () => {
    setGameState('showing');
    setCurrentRound(0);
    setScore(0);
    setTimeLeft(300);
    setStreak(0);
    setCoinsEarned(0);
    startNewRound();
  };

  // Start new round
  const startNewRound = () => {
    const newPattern = generatePattern();
    setCurrentPattern(newPattern);
    setUserPattern([]);
    setShowingPattern(true);
    setGameState('showing');
    
    // Show pattern for a duration based on difficulty
    const showDuration = difficulty === 'easy' ? 3000 : difficulty === 'medium' ? 2500 : 2000;
    
    patternTimerRef.current = setTimeout(() => {
      setShowingPattern(false);
      setGameState('playing');
    }, showDuration);
  };

  // Handle cell click
  const handleCellClick = (cellId) => {
    if (gameState !== 'playing') return;
    if (userPattern.includes(cellId)) return; // Already selected
    
    const newUserPattern = [...userPattern, cellId];
    setUserPattern(newUserPattern);
    
    // Check if this cell should be in the pattern
    if (!currentPattern.includes(cellId)) {
      // Wrong cell clicked - end round
      setGameState('result');
      setStreak(0);
      
      setTimeout(() => {
        if (currentRound + 1 < totalRounds) {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        } else {
          endGame();
        }
      }, 2000);
      return;
    }
    
    // Check if pattern is complete
    if (newUserPattern.length === currentPattern.length) {
      // Check if pattern is correct (order doesn't matter for pattern recognition)
      const isCorrect = currentPattern.every(cell => newUserPattern.includes(cell));
      
      if (isCorrect) {
        // Correct pattern!
        const basePoints = currentPattern.length * 10;
        const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
        const streakBonus = streak * 5;
        const roundBonus = currentRound * 2;
        
        const roundScore = Math.round((basePoints + streakBonus + roundBonus) * difficultyMultiplier);
        setScore(prev => prev + roundScore);
        setStreak(prev => prev + 1);
        
        setGameState('result');
        
        setTimeout(() => {
          if (currentRound + 1 < totalRounds) {
            setCurrentRound(prev => prev + 1);
            startNewRound();
          } else {
            endGame();
          }
        }, 1500);
      } else {
        // Incorrect pattern
        setGameState('result');
        setStreak(0);
        
        setTimeout(() => {
          if (currentRound + 1 < totalRounds) {
            setCurrentRound(prev => prev + 1);
            startNewRound();
          } else {
            endGame();
          }
        }, 2000);
      }
    }
  };

  // End game
  const endGame = useCallback(() => {
    setGameState('finished');
    
    // Calculate coins earned
    let coins = Math.floor(score / 30); // Base coins
    
    // Round completion bonus
    if (currentRound >= 9) coins += 50; // Completed all rounds
    else if (currentRound >= 7) coins += 30; // Most rounds
    else if (currentRound >= 5) coins += 20; // Half rounds
    else if (currentRound >= 3) coins += 10; // Few rounds
    
    // Streak bonus
    if (streak >= 5) coins += 25;
    else if (streak >= 3) coins += 15;
    else if (streak >= 2) coins += 10;
    
    // Difficulty bonus
    if (difficulty === 'hard') coins += 40;
    else if (difficulty === 'medium') coins += 20;
    else if (difficulty === 'easy') coins += 10;
    
    // Time bonus
    if (timeLeft > 180) coins += 20;
    else if (timeLeft > 120) coins += 15;
    else if (timeLeft > 60) coins += 10;
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Pattern Recognition completed');
      if (currentRound >= 7 && streak >= 3) {
        triggerEffect(); // Trigger effect for excellent performance
      }
    }
  }, [score, currentRound, streak, difficulty, timeLeft, user, updateVirtualBalance, triggerEffect]);

  // Game timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && (gameState === 'playing' || gameState === 'showing')) {
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
      if (patternTimerRef.current) {
        clearTimeout(patternTimerRef.current);
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

  const getCellColor = (cellId) => {
    if (gameState === 'showing' && showingPattern && currentPattern.includes(cellId)) {
      return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold for pattern
    }
    if (userPattern.includes(cellId)) {
      if (currentPattern.includes(cellId)) {
        return 'linear-gradient(135deg, var(--accent-green), #00CC70)'; // Green for correct
      } else {
        return 'linear-gradient(135deg, var(--accent-red), #DC2626)'; // Red for wrong
      }
    }
    return 'var(--glass-bg)'; // Default
  };

  const gridSize = getGridSize();

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
        border: '1px solid #FFB400',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#FFB400',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Pattern Master
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Identify and reproduce patterns to earn coins!
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
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🧩</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Ready to Test Your Pattern Recognition?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Watch the pattern carefully, then recreate it! You'll have 10 rounds with increasing difficulty.
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
                  color: difficulty === diff ? '#000' : 'var(--text-primary)',
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
                  {diff === 'easy' && '3x3 Grid'}
                  {diff === 'medium' && '4x4 Grid'}
                  {diff === 'hard' && '5x5 Grid'}
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
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #FFB400',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👁️</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Visual Memory</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Remember patterns</div>
            </div>
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #FFB400',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Streak Bonus</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Consecutive wins</div>
            </div>
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #FFB400',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Progressive</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Increasing complexity</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              background: 'linear-gradient(135deg, #FFB400, #FF8F00)',
              color: '#000',
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
              e.target.style.boxShadow = '0 8px 20px rgba(255, 180, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Start Pattern Challenge
          </button>
        </div>
      )}

      {/* Playing States */}
      {(gameState === 'showing' || gameState === 'playing' || gameState === 'result') && (
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
              <div style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: '800' }}>
                {streak}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Streak</div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            {gameState === 'showing' && (
              <div style={{ color: '#FFB400', fontSize: '1.2rem', fontWeight: '600' }}>
                👁️ Watch the pattern carefully...
              </div>
            )}
            {gameState === 'playing' && (
              <div style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '600' }}>
                🎯 Click all the cells that were highlighted
              </div>
            )}
            {gameState === 'result' && (
              <div style={{ 
                color: userPattern.length === currentPattern.length && 
                       currentPattern.every(cell => userPattern.includes(cell)) 
                  ? 'var(--accent-green)' : 'var(--accent-red)', 
                fontSize: '1.2rem', 
                fontWeight: '600' 
              }}>
                {userPattern.length === currentPattern.length && 
                 currentPattern.every(cell => userPattern.includes(cell))
                  ? '✅ Correct! Moving to next round...'
                  : '❌ Incorrect. Try the next pattern...'
                }
              </div>
            )}
          </div>

          {/* Game Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: '0.75rem',
            maxWidth: '500px',
            margin: '0 auto',
            padding: '2rem',
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)'
          }}>
            {Array.from({ length: gridSize * gridSize }, (_, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                style={{
                  aspectRatio: '1',
                  background: getCellColor(index),
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: gameState === 'playing' ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
                onMouseEnter={(e) => {
                  if (gameState === 'playing' && !userPattern.includes(index)) {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 180, 0, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {userPattern.includes(index) && (
                  currentPattern.includes(index) ? '✓' : '✗'
                )}
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
            {currentRound >= 8 ? '🏆' : currentRound >= 5 ? '🎯' : '💪'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Pattern Challenge Complete!
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #FFB400',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#FFB400' }}>
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
                {currentRound}/{totalRounds}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Rounds Completed</div>
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
              Best Streak: {streak} <br/>
              Completion Rate: {Math.round((currentRound / totalRounds) * 100)}% <br/>
              Time Used: {formatTime(300 - timeLeft)}
            </div>
          </div>
          
          <button
            onClick={() => setGameState('waiting')}
            style={{
              background: 'linear-gradient(135deg, #FFB400, #FF8F00)',
              color: '#000',
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
              e.target.style.boxShadow = '0 8px 20px rgba(255, 180, 0, 0.4)';
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

export default PatternRecognition; 