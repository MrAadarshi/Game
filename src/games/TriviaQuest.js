import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const TriviaQuest = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const { triggerEffect } = useInventory();
  
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [totalTime, setTotalTime] = useState(600); // 10 minutes total
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  const totalQuestions = 20;
  const questionTimerRef = useRef(null);
  const gameTimerRef = useRef(null);

  // Trivia questions database
  const triviaQuestions = {
    general: [
      {
        question: "What is the capital of Japan?",
        options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correct: 2,
        difficulty: "easy"
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
        difficulty: "easy"
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correct: 1,
        difficulty: "medium"
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        difficulty: "medium"
      },
      {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct: 1,
        difficulty: "medium"
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
        correct: 2,
        difficulty: "hard"
      },
      {
        question: "Which element has the atomic number 1?",
        options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
        correct: 1,
        difficulty: "hard"
      }
    ],
    science: [
      {
        question: "What is the speed of light in vacuum?",
        options: ["300,000 km/s", "150,000 km/s", "299,792,458 m/s", "186,000 miles/s"],
        correct: 2,
        difficulty: "hard"
      },
      {
        question: "Which gas makes up about 78% of Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        correct: 2,
        difficulty: "medium"
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Quartz"],
        correct: 2,
        difficulty: "easy"
      }
    ],
    history: [
      {
        question: "Who was the first person to walk on the moon?",
        options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "In which year did the Berlin Wall fall?",
        options: ["1987", "1988", "1989", "1990"],
        correct: 2,
        difficulty: "medium"
      },
      {
        question: "Who was the first President of the United States?",
        options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
        correct: 2,
        difficulty: "easy"
      },
      {
        question: "Which ancient wonder of the world was located in Alexandria?",
        options: ["Hanging Gardens", "Lighthouse", "Colossus", "Mausoleum"],
        correct: 1,
        difficulty: "hard"
      }
    ],
    technology: [
      {
        question: "What does CPU stand for?",
        options: ["Computer Processing Unit", "Central Processing Unit", "Core Processing Unit", "Central Program Unit"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "Who founded Microsoft?",
        options: ["Steve Jobs", "Larry Page", "Bill Gates", "Mark Zuckerberg"],
        correct: 2,
        difficulty: "easy"
      },
      {
        question: "What programming language is known for its use in web development?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2,
        difficulty: "medium"
      },
      {
        question: "What does AI stand for?",
        options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Algorithmic Intelligence"],
        correct: 1,
        difficulty: "easy"
      }
    ]
  };

  // Generate question set based on category and difficulty
  const generateQuestionSet = useCallback(() => {
    let questionPool = [];
    
    if (category === 'mixed') {
      // Mix questions from all categories
      Object.values(triviaQuestions).forEach(categoryQuestions => {
        questionPool.push(...categoryQuestions);
      });
    } else {
      questionPool = triviaQuestions[category] || triviaQuestions.general;
    }
    
    // Filter by difficulty if not mixed
    if (difficulty !== 'mixed') {
      questionPool = questionPool.filter(q => q.difficulty === difficulty);
    }
    
    // If we don't have enough questions, duplicate some
    while (questionPool.length < totalQuestions) {
      questionPool.push(...questionPool);
    }
    
    // Shuffle and select questions
    const shuffled = questionPool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalQuestions);
  }, [category, difficulty]);

  // Start game
  const startGame = () => {
    const questions = generateQuestionSet();
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setCurrentQuestion(questions[0]);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setScore(0);
    setTimeLeft(30);
    setTotalTime(600);
    setStreak(0);
    setCoinsEarned(0);
    setShowResult(false);
    
    // Store questions for the game
    window.currentTriviaQuestions = questions;
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  // Submit answer
  const submitAnswer = () => {
    if (selectedAnswer === null || showResult) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    setShowResult(true);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Calculate score based on time and difficulty
      const timeBonus = Math.max(0, timeLeft - 10) * 2;
      const difficultyMultiplier = currentQuestion.difficulty === 'easy' ? 1 : 
                                   currentQuestion.difficulty === 'medium' ? 1.5 : 2;
      const streakBonus = streak * 3;
      
      const questionScore = Math.round((50 + timeBonus + streakBonus) * difficultyMultiplier);
      setScore(prev => prev + questionScore);
    } else {
      setStreak(0);
    }
    
    // Move to next question after showing result
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Move to next question
  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= totalQuestions) {
      endGame();
      return;
    }
    
    const questions = window.currentTriviaQuestions || [];
    setCurrentQuestionIndex(nextIndex);
    setCurrentQuestion(questions[nextIndex]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
  };

  // End game
  const endGame = useCallback(() => {
    setGameState('finished');
    
    // Calculate coins earned
    let coins = Math.floor(score / 40); // Base coins
    
    // Accuracy bonus
    const accuracy = (correctAnswers / totalQuestions) * 100;
    if (accuracy >= 90) coins += 50;
    else if (accuracy >= 80) coins += 35;
    else if (accuracy >= 70) coins += 25;
    else if (accuracy >= 60) coins += 15;
    else if (accuracy >= 50) coins += 10;
    
    // Category bonus
    if (category !== 'mixed') coins += 15; // Focused category bonus
    
    // Time bonus
    if (totalTime > 300) coins += 20;
    else if (totalTime > 180) coins += 15;
    else if (totalTime > 60) coins += 10;
    
    // Completion bonus
    if (currentQuestionIndex >= totalQuestions - 1) coins += 25;
    
    setCoinsEarned(coins);
    
    // Award coins
    if (coins > 0 && user) {
      updateVirtualBalance(coins, 0, 'Trivia Quest completed');
      if (accuracy >= 80 && streak >= 5) {
        triggerEffect(); // Trigger effect for excellent performance
      }
    }
  }, [score, correctAnswers, currentQuestionIndex, totalTime, category, streak, user, updateVirtualBalance, triggerEffect]);

  // Question timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !showResult) {
      questionTimerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !showResult) {
      // Time's up for this question
      setShowResult(true);
      setStreak(0);
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
    
    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
    };
  }, [gameState, timeLeft, showResult]);

  // Total game timer effect
  useEffect(() => {
    if (gameState === 'playing' && totalTime > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTotalTime(prev => prev - 1);
      }, 1000);
    } else if (totalTime === 0 && gameState === 'playing') {
      endGame();
    }
    
    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, [gameState, totalTime, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'general': return '#8B5CF6';
      case 'science': return '#10B981';
      case 'history': return '#F59E0B';
      case 'technology': return '#3B82F6';
      case 'mixed': return '#EC4899';
      default: return '#8B5CF6';
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'var(--accent-green)';
      case 'medium': return '#FFB400';
      case 'hard': return 'var(--accent-red)';
      case 'mixed': return '#8B5CF6';
      default: return 'var(--accent-color)';
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
        border: '1px solid #8B5CF6',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#8B5CF6',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Trivia Quest
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Test your knowledge and earn coins!
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
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🧠</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Ready for the Ultimate Trivia Challenge?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Answer 20 questions across various topics. You have 30 seconds per question!
          </p>
          
          {/* Category Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Choose Category</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              {['mixed', 'general', 'science', 'history', 'technology'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: category === cat 
                      ? getCategoryColor(cat) 
                      : 'var(--glass-bg)',
                    color: category === cat ? '#fff' : 'var(--text-primary)',
                    border: `2px solid ${getCategoryColor(cat)}`,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Choose Difficulty</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              {['mixed', 'easy', 'medium', 'hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    background: difficulty === diff 
                      ? getDifficultyColor(diff) 
                      : 'var(--glass-bg)',
                    color: difficulty === diff ? (diff === 'easy' ? '#000' : '#fff') : 'var(--text-primary)',
                    border: `2px solid ${getDifficultyColor(diff)}`,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
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
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏃</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Time Pressure</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>30 sec per question</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔥</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Streak Bonus</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Consecutive correct</div>
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8B5CF6',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Bonus Coins</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>High accuracy</div>
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
            🚀 Start Trivia Quest
          </button>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && currentQuestion && (
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
                {timeLeft}s
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Question Time</div>
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
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Question</div>
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

          {/* Question */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                background: getDifficultyColor(currentQuestion.difficulty),
                color: currentQuestion.difficulty === 'easy' ? '#000' : '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {currentQuestion.difficulty}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Time: {formatTime(totalTime)}
              </span>
            </div>
            
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '1.3rem',
              marginBottom: '1.5rem',
              lineHeight: '1.4'
            }}>
              {currentQuestion.question}
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  style={{
                    background: selectedAnswer === index 
                      ? (showResult 
                          ? (index === currentQuestion.correct 
                              ? 'linear-gradient(135deg, var(--accent-green), #00CC70)'
                              : 'linear-gradient(135deg, var(--accent-red), #DC2626)')
                          : 'linear-gradient(135deg, #8B5CF6, #7C3AED)')
                      : (showResult && index === currentQuestion.correct
                          ? 'linear-gradient(135deg, var(--accent-green), #00CC70)'
                          : 'var(--glass-bg)'),
                    color: selectedAnswer === index || (showResult && index === currentQuestion.correct)
                      ? '#fff' : 'var(--text-primary)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '1rem',
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!showResult && selectedAnswer !== index) {
                      e.target.style.borderColor = '#8B5CF6';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showResult && selectedAnswer !== index) {
                      e.target.style.borderColor = 'var(--border-color)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  {showResult && index === currentQuestion.correct && ' ✓'}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correct && ' ✗'}
                </button>
              ))}
            </div>

            {selectedAnswer !== null && !showResult && (
              <button
                onClick={submitAnswer}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '1.5rem',
                  width: '100%'
                }}
              >
                Submit Answer
              </button>
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
            {(correctAnswers / totalQuestions) >= 0.8 ? '🏆' : 
             (correctAnswers / totalQuestions) >= 0.6 ? '🎯' : '📚'}
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
            Trivia Quest Complete!
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
                {Math.round((correctAnswers / totalQuestions) * 100)}%
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
              📊 Quiz Statistics
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Category: <span style={{ color: getCategoryColor(category), textTransform: 'capitalize' }}>{category}</span> <br/>
              Correct Answers: {correctAnswers}/{totalQuestions} <br/>
              Best Streak: {streak} <br/>
              Total Time: {formatTime(600 - totalTime)}
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

export default TriviaQuest; 