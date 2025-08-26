import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVirtualCurrency } from '../../context/VirtualCurrencyContext';
import { useSound } from '../../context/SoundContext';
import { useRewards } from '../../context/RewardsContext';

const Aviator = () => {
  const { user } = useAuth();
  const { coins, placeBet: placeVirtualBet, addWinnings } = useVirtualCurrency();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  const { globalSoundEnabled, playSound: globalPlaySound, stopAllSounds } = useSound();
  
  const [betAmount, setBetAmount] = useState(50);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [gameState, setGameState] = useState('waiting'); // waiting, flying, crashed, cashed_out
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastCrashPoint, setLastCrashPoint] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [gameId, setGameId] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(5);
  
  const gameInterval = useRef(null);
  const countdownInterval = useRef(null);
  const animationRef = useRef(null);
  
  // Game statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalWon: 0,
    totalLost: 0,
    biggestMultiplier: 0,
    currentStreak: 0
  });

  // Auto Bet States
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState({
    numberOfBets: 5,
    autoCashoutEnabled: true,
    autoCashoutMultiplier: 2.0,
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50,
    increaseOnWin: false,
    increaseOnLoss: false,
    winIncreasePercent: 50,
    lossIncreasePercent: 50
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
  const [showRules, setShowRules] = useState(false);
  const [showAutoBetConfig, setShowAutoBetConfig] = useState(false);
  
  const autoBetTimeoutRef = useRef(null);
  const baseBetAmountRef = useRef(50);
  const currentBetCountRef = useRef(0);

  // Auto Bet Functions
  const startAutoBet = () => {
    if (gameState !== 'waiting' || !user || betAmount > coins) return;
    
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
    
    baseBetAmountRef.current = betAmount;
    currentBetCountRef.current = 0;
    
    // Wait for the current game to start if needed
    if (gameState === 'waiting') {
      setAutoBetStats(prev => ({ ...prev, isRunning: true }));
    }
  };

  const stopAutoBet = () => {
    setIsAutoBetting(false);
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
  };

  const executeAutoBet = async () => {
    if (!isAutoBetting || currentBetCountRef.current >= autoBetConfig.numberOfBets) {
      stopAutoBet();
      return;
    }

    if (gameState === 'waiting') {
      try {
        await placeVirtualBet(betAmount, 'aviator');
      currentBetCountRef.current += 1;
      setAutoBetStats(prev => ({
        ...prev,
        currentBet: currentBetCountRef.current,
        totalBets: prev.totalBets + 1,
        totalWagered: prev.totalWagered + betAmount
      }));
      
      updateChallengeProgress('games_played');
      
        // Set auto cashout if enabled
        if (autoBetConfig.autoCashoutEnabled) {
          setAutoCashout(autoBetConfig.autoCashoutMultiplier);
        }
      } catch (error) {
        console.error('Auto bet failed:', error);
        if (isAutoBetting) stopAutoBet();
      }
    }
  };

  // Sound effects using global sound manager
  const playSound = (type) => {
    globalPlaySound(type, true); // true means game-specific sound is enabled
  };

  // Start new game countdown
  const startCountdown = () => {
    setTimeRemaining(5);
    setGameState('waiting');
    setCurrentMultiplier(1.0);
    setWinAmount(0);
    
    countdownInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          startFlight();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the flight phase
  const startFlight = () => {
    setGameState('flying');
    setCurrentMultiplier(1.0);
    playSound('takeoff');
    
    // Random crash point between 1.01x and 50x with weighted probability
    const random = Math.random();
    let crashPoint;
    
    if (random < 0.5) crashPoint = 1.01 + Math.random() * 0.99; // 50% chance: 1.01x - 2x
    else if (random < 0.8) crashPoint = 2 + Math.random() * 3; // 30% chance: 2x - 5x
    else if (random < 0.95) crashPoint = 5 + Math.random() * 10; // 15% chance: 5x - 15x
    else crashPoint = 15 + Math.random() * 35; // 5% chance: 15x - 50x
    
    let startTime = Date.now();
    let multiplier = 1.0;
    
    const updateFlight = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      multiplier = 1 + (elapsed * 0.5) + (elapsed * elapsed * 0.1); // Accelerating growth
      
      setCurrentMultiplier(multiplier);
      
      // Play flying sound occasionally
      if (Math.random() < 0.1) {
        playSound('flying');
      }
      
      // Check auto cashout
      if (isPlaying && autoCashout && multiplier >= autoCashout) {
        handleCashout();
        return;
      }
      
      // Check crash
      if (multiplier >= crashPoint) {
        handleCrash(crashPoint);
        return;
      }
      
      animationRef.current = requestAnimationFrame(updateFlight);
    };
    
    animationRef.current = requestAnimationFrame(updateFlight);
  };

  // Handle manual cashout
  const handleCashout = async () => {
    if (gameState !== 'flying' || !isPlaying) return;
    
    const winnings = betAmount * currentMultiplier;
    setWinAmount(winnings);
    setGameState('cashed_out');
    setIsPlaying(false);
    
    playSound('cashout');
    
    // Add winnings to virtual wallet
    await addWinnings(winnings, 'aviator');
    
    // Update stats
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalWon: prev.totalWon + winnings,
      biggestMultiplier: Math.max(prev.biggestMultiplier, currentMultiplier),
      currentStreak: prev.currentStreak + 1
    }));
    
    // Update challenges
    updateChallengeProgress('games_played');
    updateChallengeProgress('games_won');
    updateChallengeProgress('earnings', winnings - betAmount);
    
    // Update auto-bet stats if running
    if (autoBetStats.isRunning) {
      const profit = winnings - betAmount;
      setAutoBetStats(prev => ({
        ...prev,
        wins: prev.wins + 1,
        totalProfit: prev.totalProfit + profit
      }));
      
      // Check stop conditions
      if (autoBetConfig.stopOnWin && profit >= autoBetConfig.winAmount) {
        setTimeout(() => stopAutoBet(), 1000);
      }
    }
    
    // Check achievements
    checkAchievement('first_win', { wins: 1 });
    if (winnings >= 1000) {
      checkAchievement('big_winner', { amount: winnings });
    }
    if (currentMultiplier >= 10) {
      checkAchievement('high_roller', { amount: betAmount });
    }
    
    cancelAnimationFrame(animationRef.current);
  };

  // Handle crash
  const handleCrash = (crashPoint) => {
    setGameState('crashed');
    setLastCrashPoint(crashPoint);
    setCurrentMultiplier(crashPoint);
    
    playSound('crash');
    
    if (isPlaying) {
      // Player lost
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalLost: prev.totalLost + betAmount,
        currentStreak: 0
      }));
      setIsPlaying(false);
      
      // Update auto-bet stats if running
      if (autoBetStats.isRunning) {
        setAutoBetStats(prev => ({
          ...prev,
          losses: prev.losses + 1,
          totalProfit: prev.totalProfit - betAmount
        }));
        
        // Check stop conditions
        if (autoBetConfig.stopOnLoss && betAmount >= autoBetConfig.lossAmount) {
          setTimeout(() => stopAutoBet(), 1000);
        }
      }
    }
    
    // Update game history
    setGameHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
    
    cancelAnimationFrame(animationRef.current);
    
    // Start next game after 3 seconds
    setTimeout(() => {
      setGameId(prev => prev + 1);
      startCountdown();
    }, 3000);
  };

  // Place bet
  const handleBet = async () => {
    if (gameState !== 'waiting' || !user || betAmount > coins) return;
    
    try {
      await placeVirtualBet(betAmount, 'aviator');
      setIsPlaying(true);
      updateChallengeProgress('games_played');
      playSound('button');
    } catch (error) {
      console.error('Bet failed:', error);
      alert(error.message || 'Failed to place bet');
    }
  };

  // Handle countdown and auto-betting
  useEffect(() => {
    if (gameState === 'waiting' && autoBetStats.isRunning && timeRemaining <= 1) {
      executeAutoBet();
    }
  }, [gameState, timeRemaining, autoBetStats.isRunning]);

  // Quick bet amounts
  const quickBets = [10, 25, 50, 100, 250, 500];
  const quickMultipliers = [1.5, 2.0, 3.0, 5.0, 10.0];

  // Initialize game
  useEffect(() => {
    startCountdown();
    
    return () => {
      // Clean up intervals and animations
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
      
      // Stop all sounds when leaving the game
      stopAllSounds();
    };
  }, [stopAllSounds]);

  // Plane animation style
  const getPlaneStyle = () => {
    if (gameState === 'waiting') {
      return { transform: 'translateX(0px) translateY(0px) rotate(0deg)' };
    }
    if (gameState === 'flying') {
      const progress = Math.min((currentMultiplier - 1) * 50, 300);
      return {
        transform: `translateX(${progress}px) translateY(-${progress}px) rotate(${progress * 0.5}deg)`,
        transition: 'none'
      };
    }
    if (gameState === 'crashed') {
      return {
        transform: 'translateX(200px) translateY(100px) rotate(180deg)',
        transition: 'transform 0.5s ease-out'
      };
    }
    return { transform: 'translateX(150px) translateY(-150px) rotate(45deg)' };
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 173, 181, 0.1) 100%)',
        border: '1px solid var(--primary-gold)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>✈️</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Aviator
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Watch the plane take off and cash out before it crashes!
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
                        onClick={() => {
               // This button now shows global sound state but doesn't toggle
               // The actual toggle is in the navbar
               globalPlaySound('button', true);
             }}
            style={{
              background: globalSoundEnabled ? 'var(--accent-green)' : 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              color: globalSoundEnabled ? '#000' : 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {globalSoundEnabled ? '🔊' : '🔇'} Sound
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

      {/* Main Game Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Main Game Area */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          position: 'relative',
          minHeight: '500px'
        }}>
          {/* Game State Display */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            {gameState === 'waiting' && (
              <div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  🕒 Next Flight in {timeRemaining}s
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Place your bets now!
                </p>
              </div>
            )}
            
            {gameState === 'flying' && (
              <div>
                <h2 style={{
                  color: currentMultiplier > 2 ? 'var(--accent-green)' : 'var(--primary-gold)',
                  fontSize: '3rem',
                  fontWeight: '900',
                  marginBottom: '0.5rem'
                }}>
                  {currentMultiplier.toFixed(2)}x
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isPlaying ? '✈️ Flying! Cash out anytime' : '✈️ Flying...'}
                </p>
              </div>
            )}
            
            {gameState === 'crashed' && (
              <div>
                <h2 style={{ color: 'var(--accent-red)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                  💥 Crashed at {lastCrashPoint?.toFixed(2)}x
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {winAmount > 0 ? `You won 🪙${winAmount.toFixed(2)}!` : 'Better luck next time!'}
                </p>
              </div>
            )}
            
            {gameState === 'cashed_out' && (
              <div>
                <h2 style={{ color: 'var(--accent-green)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                  ✅ Cashed out at {currentMultiplier.toFixed(2)}x
                </h2>
                <p style={{ color: 'var(--accent-green)' }}>
                  You won 🪙{winAmount.toFixed(2)}!
                </p>
              </div>
            )}
          </div>

          {/* Flight Path Visualization */}
          <div style={{
            position: 'relative',
            height: '300px',
            background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            {/* Grid Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
            
            {/* Airplane */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '50px',
              fontSize: '2rem',
              ...getPlaneStyle(),
              filter: gameState === 'crashed' ? 'sepia(1) hue-rotate(320deg) saturate(3)' : 'none'
            }}>
              ✈️
            </div>
            
            {/* Multiplier Trail */}
            {gameState === 'flying' && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                height: '2px',
                background: `linear-gradient(90deg, var(--primary-gold), transparent)`,
                width: `${Math.min((currentMultiplier - 1) * 50, 80)}%`
              }} />
            )}
          </div>

          {/* Game Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {gameState === 'waiting' && !autoBetStats.isRunning && (
              <>
                {!isPlaying ? (
                  <>
                    <button
                      onClick={handleBet}
                      disabled={!user || betAmount > coins}
                      style={{
                        padding: '1rem 2rem',
                        background: (user && betAmount <= coins) ? 
                          'linear-gradient(135deg, var(--accent-green), #00CC70)' : 
                          'var(--glass-bg)',
                        color: (user && betAmount <= coins) ? '#000' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: (user && betAmount <= coins) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🎯 Place Bet (🪙{betAmount})
                    </button>
                    
                    <button
                      onClick={startAutoBet}
                      disabled={!user || betAmount > coins}
                      style={{
                        padding: '1rem 2rem',
                        background: (user && betAmount <= coins) ? 
                          'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                          'var(--glass-bg)',
                        color: (user && betAmount <= coins) ? '#000' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: (user && betAmount <= coins) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🤖 Auto Bet ({autoBetConfig.numberOfBets}x)
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      color: 'var(--primary-gold)',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      marginBottom: '1rem'
                    }}>
                      ✈️ Your bet is placed! Flight starting soon...
                    </div>
                    <button
                      onClick={() => {
                        setIsPlaying(false);
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
                      ❌ Cancel Bet
                    </button>
                  </div>
                )}
              </>
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
            
            {gameState === 'flying' && isPlaying && (
              <button
                onClick={handleCashout}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  animation: 'pulse 1s infinite'
                }}
              >
                💰 Cash Out (🪙{(betAmount * currentMultiplier).toFixed(2)})
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
              🎯 Betting Panel
            </h3>
            
            {/* Bet Amount */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={coins}
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

            {/* Quick Bet Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem'
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
                                        🪙{amount}
                </button>
              ))}
            </div>

            {/* Auto Cashout */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Auto Cashout at
              </label>
              <input
                type="number"
                value={autoCashout}
                onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.0)}
                min="1.01"
                step="0.01"
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

            {/* Quick Multiplier Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {quickMultipliers.map(mult => (
                <button
                  key={mult}
                  onClick={() => setAutoCashout(mult)}
                  style={{
                    padding: '0.5rem',
                    background: autoCashout === mult ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: autoCashout === mult ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>

          {/* Auto Bet Configuration */}
          {showAutoBetConfig && (
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                🤖 Auto Bet Settings
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Number of Bets
                </label>
                <input
                  type="number"
                  value={autoBetConfig.numberOfBets}
                  onChange={(e) => setAutoBetConfig(prev => ({
                    ...prev,
                    numberOfBets: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  min="1"
                  max="100"
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: 'var(--text-secondary)', 
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={autoBetConfig.autoCashoutEnabled}
                    onChange={(e) => setAutoBetConfig(prev => ({
                      ...prev,
                      autoCashoutEnabled: e.target.checked
                    }))}
                  />
                  Auto Cashout
                </label>
                {autoBetConfig.autoCashoutEnabled && (
                  <input
                    type="number"
                    value={autoBetConfig.autoCashoutMultiplier}
                    onChange={(e) => setAutoBetConfig(prev => ({
                      ...prev,
                      autoCashoutMultiplier: parseFloat(e.target.value) || 1.0
                    }))}
                    min="1.01"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      marginTop: '0.5rem'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: 'var(--text-secondary)', 
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={autoBetConfig.stopOnWin}
                      onChange={(e) => setAutoBetConfig(prev => ({
                        ...prev,
                        stopOnWin: e.target.checked
                      }))}
                    />
                    Stop on Win
                  </label>
                  {autoBetConfig.stopOnWin && (
                    <input
                      type="number"
                      value={autoBetConfig.winAmount}
                      onChange={(e) => setAutoBetConfig(prev => ({
                        ...prev,
                        winAmount: parseInt(e.target.value) || 0
                      }))}
                      placeholder="Win Amount"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: 'var(--text-secondary)', 
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={autoBetConfig.stopOnLoss}
                      onChange={(e) => setAutoBetConfig(prev => ({
                        ...prev,
                        stopOnLoss: e.target.checked
                      }))}
                    />
                    Stop on Loss
                  </label>
                  {autoBetConfig.stopOnLoss && (
                    <input
                      type="number"
                      value={autoBetConfig.lossAmount}
                      onChange={(e) => setAutoBetConfig(prev => ({
                        ...prev,
                        lossAmount: parseInt(e.target.value) || 0
                      }))}
                      placeholder="Loss Amount"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto Bet Stats */}
          {(autoBetStats.isRunning || autoBetStats.totalBets > 0) && (
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                📊 Auto Bet Stats
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Current Bet:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{autoBetStats.currentBet}/{autoBetConfig.numberOfBets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Total Bets:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{autoBetStats.totalBets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Wins:</span>
                  <span style={{ color: 'var(--accent-green)' }}>{autoBetStats.wins}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Losses:</span>
                  <span style={{ color: 'var(--accent-red)' }}>{autoBetStats.losses}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Total Wagered:</span>
                  <span style={{ color: 'var(--text-primary)' }}>🪙{autoBetStats.totalWagered}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Profit:</span>
                  <span style={{ 
                    color: autoBetStats.totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                  }}>
                    🪙{autoBetStats.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>
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
              📊 Recent Crashes
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              {gameHistory.map((crash, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.5rem',
                    background: crash >= 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: crash >= 2 ? 'var(--accent-green)' : 'var(--accent-red)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  {crash.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📈 Your Stats
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Games Played:</span>
                <span style={{ color: 'var(--text-primary)' }}>{stats.gamesPlayed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Won:</span>
                <span style={{ color: 'var(--accent-green)' }}>🪙{stats.totalWon.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Lost:</span>
                <span style={{ color: 'var(--accent-red)' }}>🪙{stats.totalLost.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Biggest Multiplier:</span>
                <span style={{ color: 'var(--primary-gold)' }}>{stats.biggestMultiplier.toFixed(2)}x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Streak:</span>
                <span style={{ color: 'var(--text-primary)' }}>{stats.currentStreak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aviator; 