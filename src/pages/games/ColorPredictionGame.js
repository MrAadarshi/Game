import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRewards } from '../../context/RewardsContext';

const ColorPredictionGame = () => {
  const { user, walletBalance, placeBet } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  const [betAmount, setBetAmount] = useState(50);
  const [selectedColor, setSelectedColor] = useState(null);
  const [gameState, setGameState] = useState('betting'); // betting, revealing, finished
  const [countdown, setCountdown] = useState(30);
  const [winningNumber, setWinningNumber] = useState(null);
  const [winningColor, setWinningColor] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameId, setGameId] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [playerBets, setPlayerBets] = useState([]);
  
  // Auto Bet States
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState({
    numberOfBets: 5,
    selectedColor: 'red',
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50
  });
  const [autoBetStats, setAutoBetStats] = useState({
    currentBet: 0,
    totalBets: 0,
    wins: 0,
    losses: 0,
    totalWagered: 0,
    totalProfit: 0,
    isRunning: false
  });

  // Game Controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showAutoBetConfig, setShowAutoBetConfig] = useState(false);
  
  const countdownInterval = useRef(null);
  const revealTimeout = useRef(null);
  const autoBetTimeoutRef = useRef(null);
  const currentBetCountRef = useRef(0);

  // Color mapping (0-9)
  const getColorFromNumber = (num) => {
    if ([1, 3, 7, 9].includes(num)) return 'green';
    if ([2, 4, 6, 8].includes(num)) return 'red';
    if ([0, 5].includes(num)) return 'violet';
    return 'red';
  };

  const colorInfo = {
    red: { 
      color: '#EF4444', 
      numbers: [2, 4, 6, 8], 
      multiplier: 2,
      icon: '🔴'
    },
    green: { 
      color: '#10B981', 
      numbers: [1, 3, 7, 9], 
      multiplier: 2,
      icon: '🟢'
    },
    violet: { 
      color: '#8B5CF6', 
      numbers: [0, 5], 
      multiplier: 4.5,
      icon: '🟣'
    }
  };

  // Auto Bet Functions
  const startAutoBet = () => {
    if (gameState !== 'betting' || !user || betAmount > walletBalance) return;
    
    setIsAutoBetting(true);
    setAutoBetStats(prev => ({
      ...prev,
      currentBet: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      totalWagered: 0,
      totalProfit: 0,
      isRunning: true
    }));
    
    currentBetCountRef.current = 0;
  };

  const stopAutoBet = () => {
    setIsAutoBetting(false);
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
  };

  const executeAutoBet = () => {
    if (!isAutoBetting || currentBetCountRef.current >= autoBetConfig.numberOfBets) {
      stopAutoBet();
      return;
    }

    if (gameState === 'betting' && placeBet(betAmount, 0, 'color_prediction')) {
      currentBetCountRef.current += 1;
      setAutoBetStats(prev => ({
        ...prev,
        currentBet: currentBetCountRef.current,
        totalBets: prev.totalBets + 1,
        totalWagered: prev.totalWagered + betAmount
      }));
      
      // Place the configured auto bet
      const newBet = {
        color: autoBetConfig.selectedColor,
        amount: betAmount,
        multiplier: colorInfo[autoBetConfig.selectedColor].multiplier
      };
      
      setPlayerBets(prev => [...prev, newBet]);
      setSelectedColor(autoBetConfig.selectedColor);
      
      updateChallengeProgress('games_played');
      playSound('bet');
    }
  };

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let frequency, duration, waveType;

    switch (type) {
      case 'bet':
        frequency = 800;
        duration = 0.2;
        waveType = 'sine';
        break;
      case 'countdown':
        frequency = 600;
        duration = 0.1;
        waveType = 'triangle';
        break;
      case 'reveal':
        frequency = 1000;
        duration = 0.5;
        waveType = 'sine';
        break;
      case 'win':
        frequency = 1200;
        duration = 0.8;
        waveType = 'sine';
        break;
      case 'lose':
        frequency = 300;
        duration = 0.6;
        waveType = 'sawtooth';
        break;
      case 'button':
        frequency = 600;
        duration = 0.2;
        waveType = 'sine';
        break;
      default:
        frequency = 500;
        duration = 0.2;
        waveType = 'sine';
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // Start new game
  const startNewGame = () => {
    setGameState('betting');
    setCountdown(30);
    setSelectedColor(null);
    setWinningNumber(null);
    setWinningColor(null);
    setIsSpinning(false);
    setPlayerBets([]);
    
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          playSound('countdown');
          clearInterval(countdownInterval.current);
          startReveal();
          return 0;
        }
        if (prev <= 5) {
          playSound('countdown');
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start reveal phase
  const startReveal = () => {
    setGameState('revealing');
    setIsSpinning(true);
    
    // Generate winning number (0-9)
    const number = Math.floor(Math.random() * 10);
    const color = getColorFromNumber(number);
    
    playSound('reveal');
    
    // Spinning animation duration
    revealTimeout.current = setTimeout(() => {
      setWinningNumber(number);
      setWinningColor(color);
      setIsSpinning(false);
      setGameState('finished');
      
      // Check for wins
      checkPlayerWins(color, number);
      
      // Add to history
      setGameHistory(prev => [{ number, color, gameId }, ...prev.slice(0, 9)]);
      
      // Start next game after 5 seconds
      setTimeout(() => {
        setGameId(prev => prev + 1);
        startNewGame();
      }, 5000);
    }, 3000);
  };

  // Place bet
  const handleBet = (color) => {
    if (gameState !== 'betting' || !user || betAmount > walletBalance) return;
    
    if (placeBet(betAmount, 0, 'color_prediction')) {
      const newBet = {
        color,
        amount: betAmount,
        multiplier: colorInfo[color].multiplier
      };
      
      setPlayerBets(prev => [...prev, newBet]);
      setSelectedColor(color);
      
      playSound('bet');
      updateChallengeProgress('games_played');
    }
  };

  // Check wins
  const checkPlayerWins = (winColor, winNumber) => {
    let totalWinnings = 0;
    
    playerBets.forEach(bet => {
      if (bet.color === winColor) {
        const winAmount = bet.amount * bet.multiplier;
        totalWinnings += winAmount;
        
        // Add winnings to wallet
        placeBet(0, winAmount - bet.amount, 'color_prediction');
        
        // Update challenges
        updateChallengeProgress('games_won');
        updateChallengeProgress('earnings', winAmount - bet.amount);
        
        // Check achievements
        checkAchievement('first_win', { wins: 1 });
        if (winAmount >= 1000) {
          checkAchievement('big_winner', { amount: winAmount });
        }
      }
    });
    
    if (totalWinnings > 0) {
      playSound('win');
    } else if (playerBets.length > 0) {
      playSound('lose');
    }
  };

  // Initialize game
  useEffect(() => {
    startNewGame();
    
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (revealTimeout.current) clearTimeout(revealTimeout.current);
    };
  }, []);

  const quickBets = [10, 25, 50, 100, 250, 500];

  return (
    <div className="container animate-fadeInUp" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--primary-gold)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          fontWeight: '900'
        }}>
          🎨 Color Prediction
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Predict the winning color and multiply your earnings!
        </p>
        
        {/* Game Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? 'var(--accent-green)' : 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              color: soundEnabled ? '#000' : 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {soundEnabled ? '🔊' : '🔇'} Sound
          </button>
          
          <button
            onClick={() => setShowAutoBetConfig(!showAutoBetConfig)}
            style={{
              background: isAutoBetting ? 'var(--primary-gold)' : 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              color: isAutoBetting ? '#000' : 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🤖 Auto Bet
          </button>
          
          <button
            onClick={() => setShowRules(true)}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📖 Rules
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Game Area */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          {/* Game Status */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Game #{gameId}
              </h2>
              
              {gameState === 'betting' && (
                <div>
                  <div style={{
                    fontSize: '2rem',
                    color: countdown <= 5 ? 'var(--accent-red)' : 'var(--primary-gold)',
                    fontWeight: '900',
                    marginBottom: '0.5rem'
                  }}>
                    {countdown}s
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Place your bets now!
                  </p>
                </div>
              )}
              
              {gameState === 'revealing' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎰</div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Revealing winner...
                  </p>
                </div>
              )}
              
              {gameState === 'finished' && (
                <div>
                  <div style={{
                    fontSize: '3rem',
                    color: colorInfo[winningColor]?.color,
                    marginBottom: '0.5rem'
                  }}>
                    {winningNumber}
                  </div>
                  <p style={{ color: colorInfo[winningColor]?.color, fontSize: '1.1rem' }}>
                    {colorInfo[winningColor]?.icon} {winningColor.toUpperCase()} WINS!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Number Display Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              const numColor = getColorFromNumber(num);
              const isWinner = winningNumber === num;
              
              return (
                <div
                  key={num}
                  style={{
                    padding: '1.5rem',
                    background: isWinner ? 
                      colorInfo[numColor].color : 
                      `${colorInfo[numColor].color}20`,
                    border: `2px solid ${colorInfo[numColor].color}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: isWinner ? '#fff' : colorInfo[numColor].color,
                    transform: isWinner ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    animation: (isSpinning && Math.random() > 0.7) ? 'pulse 0.5s infinite' : 'none'
                  }}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {/* Color Betting Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {Object.entries(colorInfo).map(([colorName, info]) => {
              const isSelected = selectedColor === colorName;
              const playerBet = playerBets.find(bet => bet.color === colorName);
              
              return (
                <button
                  key={colorName}
                  onClick={() => handleBet(colorName)}
                  disabled={gameState !== 'betting' || !user || betAmount > walletBalance}
                  style={{
                    padding: '2rem 1rem',
                    background: isSelected ? 
                      `linear-gradient(135deg, ${info.color}, ${info.color}CC)` :
                      `${info.color}20`,
                    border: `2px solid ${info.color}`,
                    borderRadius: '16px',
                    color: isSelected ? '#fff' : info.color,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: (gameState === 'betting' && user && betAmount <= walletBalance) ? 'pointer' : 'not-allowed',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: (gameState !== 'betting') ? 0.6 : 1
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {info.icon}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {colorName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {info.multiplier}x payout
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Numbers: {info.numbers.join(', ')}
                  </div>
                  {playerBet && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.3rem 0.6rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      Bet: ₹{playerBet.amount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Betting Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {gameState === 'betting' && !autoBetStats.isRunning && playerBets.length === 0 && (
              <button
                onClick={startAutoBet}
                disabled={!user || betAmount > walletBalance}
                style={{
                  padding: '1rem 2rem',
                  background: (user && betAmount <= walletBalance) ? 
                    'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                    'var(--glass-bg)',
                  color: (user && betAmount <= walletBalance) ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: (user && betAmount <= walletBalance) ? 'pointer' : 'not-allowed'
                }}
              >
                🤖 Start Auto Bet ({autoBetConfig.numberOfBets}x)
              </button>
            )}
            
            {autoBetStats.isRunning && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: 'var(--primary-gold)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  🔄 Auto Betting ({autoBetStats.currentBet}/{autoBetConfig.numberOfBets})
                </div>
                <button
                  onClick={stopAutoBet}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ Stop Auto Bet
                </button>
              </div>
            )}

            {playerBets.length > 0 && !autoBetStats.isRunning && gameState === 'betting' && (
              <button
                onClick={() => {
                  setPlayerBets([]);
                  setSelectedColor(null);
                  playSound('button');
                }}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ❌ Clear Bets
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Betting Panel */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              💰 Betting Panel
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={walletBalance}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {quickBets.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  style={{
                    padding: '0.5rem',
                    background: betAmount === amount ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: betAmount === amount ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Current Bets */}
          {playerBets.length > 0 && (
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                🎯 Your Bets
              </h3>
              {playerBets.map((bet, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: `${colorInfo[bet.color].color}20`,
                    border: `1px solid ${colorInfo[bet.color].color}`,
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div>
                    <span style={{ color: colorInfo[bet.color].color, fontWeight: '600' }}>
                      {colorInfo[bet.color].icon} {bet.color.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    ₹{bet.amount} → ₹{(bet.amount * bet.multiplier).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Game History */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📊 Recent Results
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {gameHistory.map((result, index) => (
                <div
                  key={result.gameId}
                  style={{
                    padding: '0.8rem 0.5rem',
                    background: `${colorInfo[result.color].color}20`,
                    border: `1px solid ${colorInfo[result.color].color}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{
                    color: colorInfo[result.color].color,
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    {result.number}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {result.color}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Guide */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📖 Game Rules
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.8rem' }}>
                <span style={{ color: colorInfo.red.color }}>🔴 RED</span>: Numbers 2, 4, 6, 8 (2x payout)
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <span style={{ color: colorInfo.green.color }}>🟢 GREEN</span>: Numbers 1, 3, 7, 9 (2x payout)
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <span style={{ color: colorInfo.violet.color }}>🟣 VIOLET</span>: Numbers 0, 5 (4.5x payout)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                💡 Place your bet before the countdown ends!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPredictionGame; 