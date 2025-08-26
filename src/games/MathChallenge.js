import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const MathChallenge = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per game
  const [problemCount, setProblemCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  const inputRef = useRef(null);
  const gameTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Generate random math problem
  const generateProblem = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    return {
      question: `${num1} ${operation} ${num2}`,
      answer: answer,
      operation: operation
    };
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setProblemCount(0);
    setCorrectAnswers(0);
    setStreak(0);
    setCoinsEarned(0);
    setUserAnswer('');
    setFeedback('');
    
    const firstProblem = generateProblem();
    setCurrentProblem(firstProblem);
    
    // Focus on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Check answer
  const checkAnswer = () => {
    if (!currentProblem || userAnswer.trim() === '') return;
    
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentProblem.answer;
    
    setProblemCount(prev => prev + 1);
    
    if (isCorrect) {
      const basePoints = 10;
      const streakBonus = Math.min(streak * 2, 20);
      const timeBonus = timeLeft > 45 ? 5 : timeLeft > 30 ? 3 : 1;
      const totalPoints = basePoints + streakBonus + timeBonus;
      
      setScore(prev => prev + totalPoints);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback(`Correct! +${totalPoints} points (Streak: ${streak + 1})`);
      
      // Generate next problem
      const nextProblem = generateProblem();
      setCurrentProblem(nextProblem);
    } else {
      setStreak(0);
      setFeedback(`Wrong! The answer was ${currentProblem.answer}`);
      
      // Generate next problem after a short delay
      setTimeout(() => {
        const nextProblem = generateProblem();
        setCurrentProblem(nextProblem);
      }, 1500);
    }
    
    setUserAnswer('');
    
    // Clear feedback after 2 seconds
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
    }, 2000);
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // End game
  const endGame = useCallback(() => {
    setGameState('finished');
    
    // Calculate coins earned
    const accuracy = problemCount > 0 ? (correctAnswers / problemCount) * 100 : 0;
    let coins = Math.floor(score / 10); // Base: 1 coin per 10 points
    
    // Bonus for high accuracy
    if (accuracy >= 90) coins += 20;
    else if (accuracy >= 80) coins += 15;
    else if (accuracy >= 70) coins += 10;
    else if (accuracy >= 60) coins += 5;
    
    // Bonus for high problem count
    if (problemCount >= 30) coins += 15;
    else if (problemCount >= 25) coins += 10;
    else if (problemCount >= 20) coins += 5;
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Math Challenge completed');
      if (accuracy >= 80) {
        triggerEffect(); // Trigger effect for good performance
      }
    }
  }, [problemCount, correctAnswers, score, user, updateVirtualBalance, triggerEffect]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      checkAnswer();
    }
  };

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
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
        border: '1px solid var(--accent-green)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧮</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: 'var(--accent-green)',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Math Challenge
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Solve math problems quickly to earn coins!
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
            Ready to Test Your Math Skills?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            You'll have 60 seconds to solve as many math problems as possible. Earn coins based on your accuracy and speed!
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Fast Solving</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+Time Bonus</div>
            </div>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Streak Bonus</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+2 points per streak</div>
            </div>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>High Accuracy</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+Coin Bonus</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Start Math Challenge
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
                {correctAnswers}/{problemCount}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Correct</div>
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

          {/* Problem Display */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            {currentProblem && (
              <>
                <div style={{
                  fontSize: '3rem',
                  color: 'var(--text-primary)',
                  fontWeight: '800',
                  marginBottom: '2rem'
                }}>
                  {currentProblem.question} = ?
                </div>
                
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter answer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    width: '200px',
                    marginBottom: '1rem'
                  }}
                />
                
                <div>
                  <button
                    onClick={checkAnswer}
                    disabled={userAnswer.trim() === ''}
                    style={{
                      background: userAnswer.trim() === '' 
                        ? 'var(--glass-bg)' 
                        : 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                      color: userAnswer.trim() === '' ? 'var(--text-secondary)' : '#000',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: userAnswer.trim() === '' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              </>
            )}
            
            {/* Feedback */}
            {feedback && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '12px',
                background: feedback.includes('Correct') 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${feedback.includes('Correct') ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                color: feedback.includes('Correct') ? 'var(--accent-green)' : 'var(--accent-red)',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {feedback}
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
            {correctAnswers > problemCount * 0.8 ? '🏆' : correctAnswers > problemCount * 0.6 ? '🎯' : '💪'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Math Challenge Complete!
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
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-green)' }}>
                {problemCount > 0 ? Math.round((correctAnswers / problemCount) * 100) : 0}%
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
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
              Problems Solved: {correctAnswers} / {problemCount} <br/>
              Best Streak: {streak} <br/>
              Average Time per Problem: {problemCount > 0 ? ((60 - timeLeft) / problemCount).toFixed(1) : 0}s
            </div>
          </div>
          
          <button
            onClick={() => setGameState('waiting')}
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
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
              e.target.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)';
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

export default MathChallenge; 