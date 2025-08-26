import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const WordPuzzle = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState('');
  const [feedback, setFeedback] = useState('');
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  
  const inputRef = useRef(null);
  const gameTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Word lists by difficulty
  const wordLists = {
    easy: [
      { word: 'APPLE', hint: 'A red or green fruit' },
      { word: 'HOUSE', hint: 'Where people live' },
      { word: 'WATER', hint: 'Clear liquid we drink' },
      { word: 'BREAD', hint: 'Made from flour and eaten' },
      { word: 'HAPPY', hint: 'Feeling of joy' },
      { word: 'MONEY', hint: 'Used to buy things' },
      { word: 'LIGHT', hint: 'Opposite of dark' },
      { word: 'MUSIC', hint: 'Sounds that are pleasant' },
      { word: 'PARTY', hint: 'Celebration with friends' },
      { word: 'BEACH', hint: 'Sandy area by the ocean' }
    ],
    medium: [
      { word: 'COMPUTER', hint: 'Electronic device for work' },
      { word: 'ELEPHANT', hint: 'Large gray animal' },
      { word: 'MOUNTAIN', hint: 'Very high land formation' },
      { word: 'SANDWICH', hint: 'Food between two slices' },
      { word: 'BIRTHDAY', hint: 'Annual celebration day' },
      { word: 'TELEPHONE', hint: 'Device for talking remotely' },
      { word: 'BUTTERFLY', hint: 'Colorful flying insect' },
      { word: 'CHOCOLATE', hint: 'Sweet brown treat' },
      { word: 'ADVENTURE', hint: 'Exciting journey or experience' },
      { word: 'RAINBOW', hint: 'Colorful arc in the sky' }
    ],
    hard: [
      { word: 'ENCYCLOPEDIA', hint: 'Book of knowledge' },
      { word: 'EXTRAORDINARY', hint: 'Beyond ordinary, exceptional' },
      { word: 'INDEPENDENCE', hint: 'Freedom from control' },
      { word: 'Mediterranean', hint: 'Sea between Europe and Africa' },
      { word: 'PRONUNCIATION', hint: 'How words are spoken' },
      { word: 'PHILOSOPHICAL', hint: 'Related to deep thinking' },
      { word: 'TRANSPORTATION', hint: 'Moving people or goods' },
      { word: 'REFRIGERATOR', hint: 'Appliance that keeps food cold' },
      { word: 'MATHEMATICIAN', hint: 'Person who works with numbers' },
      { word: 'RESPONSIBILITY', hint: 'Duty or obligation' }
    ]
  };

  // Scramble word function
  const scrambleWord = (word) => {
    const chars = word.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  };

  // Get random word from current difficulty
  const getRandomWord = () => {
    const words = wordLists[difficulty];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setWordsCompleted(0);
    setTimeLeft(240);
    setStreak(0);
    setCoinsEarned(0);
    setUserInput('');
    setFeedback('');
    generateNewWord();
    
    // Focus on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Generate new word
  const generateNewWord = () => {
    const wordData = getRandomWord();
    setCurrentWord(wordData.word.toUpperCase());
    setHint(wordData.hint);
    
    let scrambled = scrambleWord(wordData.word.toUpperCase());
    // Make sure scrambled word is different from original
    while (scrambled === wordData.word.toUpperCase() && wordData.word.length > 3) {
      scrambled = scrambleWord(wordData.word.toUpperCase());
    }
    setScrambledWord(scrambled);
    setUserInput('');
  };

  // Check answer
  const checkAnswer = () => {
    if (userInput.trim().toUpperCase() === currentWord) {
      // Correct answer
      const basePoints = currentWord.length * 10;
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
      const streakBonus = streak * 5;
      const timeBonus = timeLeft > 180 ? 20 : timeLeft > 120 ? 10 : 5;
      
      const totalPoints = Math.round((basePoints * difficultyMultiplier) + streakBonus + timeBonus);
      
      setScore(prev => prev + totalPoints);
      setWordsCompleted(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback(`Correct! +${totalPoints} points (Streak: ${streak + 1})`);
      
      // Generate new word after short delay
      setTimeout(() => {
        generateNewWord();
      }, 1000);
      
    } else {
      // Wrong answer
      setStreak(0);
      setFeedback(`Wrong! The word was: ${currentWord}`);
      
      // Generate new word after showing correct answer
      setTimeout(() => {
        generateNewWord();
      }, 2000);
    }
    
    // Clear feedback
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
    }, 3000);
  };

  // End game
  const endGame = useCallback(() => {
    setGameState('finished');
    
    // Calculate coins earned
    let coins = Math.floor(score / 50); // Base: 1 coin per 50 points
    
    // Bonus for difficulty
    if (difficulty === 'hard') coins = Math.floor(coins * 1.5);
    else if (difficulty === 'medium') coins = Math.floor(coins * 1.2);
    
    // Bonus for words completed
    if (wordsCompleted >= 20) coins += 30;
    else if (wordsCompleted >= 15) coins += 20;
    else if (wordsCompleted >= 10) coins += 15;
    else if (wordsCompleted >= 5) coins += 10;
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Word Puzzle completed');
      if (wordsCompleted >= 10) {
        triggerEffect(); // Trigger effect for good performance
      }
    }
  }, [score, difficulty, wordsCompleted, user, updateVirtualBalance, triggerEffect]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameState === 'playing' && userInput.trim() !== '') {
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

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'var(--accent-green)';
      case 'medium': return '#FFB400';
      case 'hard': return 'var(--accent-red)';
      default: return 'var(--accent-color)';
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(147, 51, 234, 0.1))',
        border: '1px solid #8B5CF6',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#8B5CF6',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Word Puzzle
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Unscramble words and earn coins!
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
            Ready for Word Puzzles?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Unscramble as many words as possible in 4 minutes. Choose your difficulty level!
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
                  {diff === 'easy' && '4-5 letters'}
                  {diff === 'medium' && '6-9 letters'}
                  {diff === 'hard' && '10+ letters'}
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
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧠</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Brain Exercise</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Improve vocabulary</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Streak Bonus</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+5 per streak</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Earn More</div>
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
            🚀 Start Word Puzzle
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
                {wordsCompleted}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Words</div>
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

          {/* Puzzle Display */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: `rgba(139, 92, 246, 0.1)`,
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '2rem',
              display: 'inline-block'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Difficulty: <span style={{ color: getDifficultyColor(difficulty), fontWeight: '600', textTransform: 'capitalize' }}>{difficulty}</span>
              </div>
            </div>

            <div style={{
              fontSize: '3rem',
              color: 'var(--text-primary)',
              fontWeight: '800',
              letterSpacing: '0.5rem',
              marginBottom: '1rem'
            }}>
              {scrambledWord}
            </div>
            
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              marginBottom: '2rem'
            }}>
              💡 Hint: {hint}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter the unscrambled word"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
                textAlign: 'center',
                width: '300px',
                marginBottom: '1rem',
                textTransform: 'uppercase'
              }}
            />
            
            <div>
              <button
                onClick={checkAnswer}
                disabled={userInput.trim() === ''}
                style={{
                  background: userInput.trim() === '' 
                    ? 'var(--glass-bg)' 
                    : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  color: userInput.trim() === '' ? 'var(--text-secondary)' : '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: userInput.trim() === '' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Submit Word
              </button>
            </div>
            
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
            {wordsCompleted >= 15 ? '🏆' : wordsCompleted >= 10 ? '🎯' : '💪'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Word Puzzle Complete!
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
                {wordsCompleted}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Words Solved</div>
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
              Average per Word: {wordsCompleted > 0 ? Math.round(score / wordsCompleted) : 0} points <br/>
              Time Played: {formatTime(240 - timeLeft)}
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

export default WordPuzzle; 