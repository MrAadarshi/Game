import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRewards } from '../../context/RewardsContext';

const Aviator = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [gameState, setGameState] = useState('betting'); // betting, flying, crashed, cashed_out
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0
  });

  // Auto Bet States
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState({
    numberOfBets: 5,
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50,
    increaseOnWin: false,
    increaseOnLoss: false,
    winIncreasePercent: 50,
    lossIncreasePercent: 50,
    resetOnWin: false,
    resetOnLoss: false
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
  
  const autoBetTimeoutRef = useRef(null);
  const baseBetAmountRef = useRef(10);
  const currentBetCountRef = useRef(0);
  const gameInterval = useRef(null);

  // Live bets feed
  const [liveBets, setLiveBets] = useState([
    { user: 'Arjun_K294', amount: 50, multiplier: 3.2, win: 160, id: 1 },
    { user: 'Priya_S817', amount: 75, multiplier: 5.4, win: 405, id: 2 },
    { user: 'Rahul_P453', amount: 100, multiplier: 2.1, win: 210, id: 3 },
    { user: 'Ananya_M628', amount: 40, multiplier: 8.7, win: 348, id: 4 },
    { user: 'Vikram_R935', amount: 150, multiplier: 1.8, win: 270, id: 5 }
  ]);

  // Sound effects - matching FlipCoin
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch (type) {
      case 'takeoff':
        // Plane takeoff sound
        const takeoffDuration = 0.8;
        const takeoffFreq = 400;
        
        const takeoffOsc = audioContext.createOscillator();
        const takeoffGain = audioContext.createGain();
        const takeoffFilter = audioContext.createBiquadFilter();
        
        takeoffOsc.connect(takeoffFilter);
        takeoffFilter.connect(takeoffGain);
        takeoffGain.connect(audioContext.destination);
        
        takeoffOsc.type = 'sawtooth';
        takeoffOsc.frequency.setValueAtTime(takeoffFreq, audioContext.currentTime);
        takeoffOsc.frequency.exponentialRampToValueAtTime(takeoffFreq * 2, audioContext.currentTime + takeoffDuration);
        
        takeoffFilter.type = 'lowpass';
        takeoffFilter.frequency.setValueAtTime(800, audioContext.currentTime);
        takeoffFilter.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + takeoffDuration);
        
        takeoffGain.gain.setValueAtTime(0, audioContext.currentTime);
        takeoffGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
        takeoffGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + takeoffDuration);
        
        takeoffOsc.start(audioContext.currentTime);
        takeoffOsc.stop(audioContext.currentTime + takeoffDuration);
        break;
        
      case 'cashout':
        // Success cashout sound
        const cashoutFreqs = [523.25, 659.25, 783.99]; // C, E, G
        cashoutFreqs.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          osc.type = 'sine';
          
          gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
          gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.4);
          
          osc.start(audioContext.currentTime + index * 0.1);
          osc.stop(audioContext.currentTime + index * 0.1 + 0.4);
        });
        break;
        
      case 'crash':
        // Crash sound
        const crashOsc = audioContext.createOscillator();
        const crashGain = audioContext.createGain();
        const crashFilter = audioContext.createBiquadFilter();
        
        crashOsc.connect(crashFilter);
        crashFilter.connect(crashGain);
        crashGain.connect(audioContext.destination);
        
        crashOsc.type = 'sawtooth';
        crashOsc.frequency.setValueAtTime(200, audioContext.currentTime);
        crashOsc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.8);
        
        crashFilter.type = 'lowpass';
        crashFilter.frequency.setValueAtTime(400, audioContext.currentTime);
        crashFilter.Q.setValueAtTime(5, audioContext.currentTime);
        
        crashGain.gain.setValueAtTime(0, audioContext.currentTime);
        crashGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        crashGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        crashOsc.start(audioContext.currentTime);
        crashOsc.stop(audioContext.currentTime + 0.8);
        break;
        
      case 'button':
        // Button click
        const buttonOsc = audioContext.createOscillator();
        const buttonGain = audioContext.createGain();
        
        buttonOsc.connect(buttonGain);
        buttonGain.connect(audioContext.destination);
        
        buttonOsc.frequency.setValueAtTime(800, audioContext.currentTime);
        buttonOsc.type = 'sine';
        
        buttonGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        buttonGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        buttonOsc.start(audioContext.currentTime);
        buttonOsc.stop(audioContext.currentTime + 0.2);
        break;
        
      default:
        break;
    }
  };

  // Auto Bet Functions
  const startAutoBet = () => {
    if (gameState !== 'betting') return;
    
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
    executeAutoBet();
  };

  const stopAutoBet = () => {
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
  };

  const executeAutoBet = () => {
    if (currentBetCountRef.current >= autoBetConfig.numberOfBets) {
      stopAutoBet();
      return;
    }

    try {
      if (placeBet(betAmount, 0, 'aviator')) {
        setIsPlaying(true);
        currentBetCountRef.current += 1;
        setAutoBetStats(prev => ({
          ...prev,
          currentBet: currentBetCountRef.current,
          totalBets: prev.totalBets + 1,
          totalWagered: prev.totalWagered + betAmount
        }));
        
        updateChallengeProgress('games_played');
        startGame(true);
      }
    } catch (error) {
      console.error('Auto bet error:', error);
      stopAutoBet();
    }
  };

  // Game Functions
  const startGame = (isAutomatic = false) => {
    if (gameState !== 'betting') return;
    
    setGameState('flying');
    setCurrentMultiplier(1.0);
    setIsLoading(true);
    
    playSound('takeoff');
    
    // Generate crash point (1.01x to 50x with weighted probability)
    const random = Math.random();
    let crashPoint;
    
    if (random < 0.5) crashPoint = 1.01 + Math.random() * 0.99; // 50% chance: 1.01x - 2x
    else if (random < 0.8) crashPoint = 2 + Math.random() * 3; // 30% chance: 2x - 5x
    else if (random < 0.95) crashPoint = 5 + Math.random() * 10; // 15% chance: 5x - 15x
    else crashPoint = 15 + Math.random() * 35; // 5% chance: 15x - 50x
    
    let startTime = Date.now();
    let multiplier = 1.0;
    
    const updateMultiplier = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      multiplier = 1 + (elapsed * 0.5) + (elapsed * elapsed * 0.1);
      
      setCurrentMultiplier(multiplier);
      
      // Auto cashout check
      if (isPlaying && autoCashout && multiplier >= autoCashout) {
        handleCashout(true, isAutomatic);
        return;
      }
      
      // Crash check
      if (multiplier >= crashPoint) {
        handleCrash(crashPoint, isAutomatic);
        return;
      }
      
      gameInterval.current = setTimeout(updateMultiplier, 50);
    };
    
    gameInterval.current = setTimeout(updateMultiplier, 50);
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleBet = () => {
    if (gameState !== 'betting' || !placeBet(betAmount, 0, 'aviator')) return;
    
    setIsPlaying(true);
    updateChallengeProgress('games_played');
    startGame();
  };

  const handleCashout = (isAuto = false, isAutomatic = false) => {
    if (gameState !== 'flying' || !isPlaying) return;
    
    const winnings = betAmount * currentMultiplier;
    const profit = winnings - betAmount;
    
    setGameState('cashed_out');
    setIsPlaying(false);
    
    playSound('cashout');
    
    // Process game result
    processGameResult(profit, 'aviator');
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      wins: prev.wins + 1,
      winStreak: prev.winStreak + 1,
      currentStreak: prev.currentStreak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
      totalWagered: prev.totalWagered + betAmount,
      totalWon: prev.totalWon + winnings,
      netProfit: prev.netProfit + profit
    }));
    
    // Add to results
    setGameResults(prev => [{
      result: 'win',
      multiplier: currentMultiplier,
      bet: betAmount,
      win: winnings,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]);
    
    // Update challenges
    updateChallengeProgress('games_won');
    updateChallengeProgress('earnings', profit);
    
    // Check achievements
    checkAchievement('first_win', { wins: 1 });
    if (winnings >= 1000) {
      checkAchievement('big_winner', { amount: winnings });
    }
    
    // Auto bet stats
    if (autoBetStats.isRunning) {
      setAutoBetStats(prev => ({
        ...prev,
        wins: prev.wins + 1,
        totalProfit: prev.totalProfit + profit
      }));
      
      if (autoBetConfig.stopOnWin && profit >= autoBetConfig.winAmount) {
        setTimeout(() => stopAutoBet(), 100);
      }
    }
    
    if (gameInterval.current) {
      clearTimeout(gameInterval.current);
    }
    
    if (isAutomatic && autoBetStats.isRunning) {
      setTimeout(() => {
        resetGame();
        setTimeout(() => executeAutoBet(), 1000);
      }, 2000);
    } else {
      setTimeout(() => resetGame(), 3000);
    }
  };

  const handleCrash = (crashPoint, isAutomatic = false) => {
    setGameState('crashed');
    setCurrentMultiplier(crashPoint);
    
    playSound('crash');
    
    if (isPlaying) {
      const loss = betAmount;
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        losses: prev.losses + 1,
        currentStreak: 0,
        totalWagered: prev.totalWagered + betAmount,
        netProfit: prev.netProfit - loss
      }));
      
      // Add to results
      setGameResults(prev => [{
        result: 'lose',
        multiplier: crashPoint,
        bet: betAmount,
        win: 0,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
      
      // Auto bet stats
      if (autoBetStats.isRunning) {
        setAutoBetStats(prev => ({
          ...prev,
          losses: prev.losses + 1,
          totalProfit: prev.totalProfit - loss
        }));
        
        if (autoBetConfig.stopOnLoss && loss >= autoBetConfig.lossAmount) {
          setTimeout(() => stopAutoBet(), 100);
        }
      }
      
      setIsPlaying(false);
    }
    
    if (gameInterval.current) {
      clearTimeout(gameInterval.current);
    }
    
    if (isAutomatic && autoBetStats.isRunning) {
      setTimeout(() => {
        resetGame();
        setTimeout(() => executeAutoBet(), 1000);
      }, 2000);
    } else {
      setTimeout(() => resetGame(), 3000);
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setCurrentMultiplier(1.0);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const quickBetAmount = (amount) => {
    playSound('button');
    setBetAmount(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num?.toLocaleString() || '0'}`;
  };

  const getWinRate = () => {
    return gameStats.totalGames > 0 ? ((gameStats.wins / gameStats.totalGames) * 100).toFixed(1) : '0.0';
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
        {/* Betting Panel */}
        <div className="game-area">
          <h3 style={{ 
            color: 'var(--primary-gold)',
            fontSize: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✈️ Place Your Bet
          </h3>
          
          {/* Manual/Auto Toggle */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: 'var(--glass-bg)',
            padding: '0.3rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setIsAutoBetting(false)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                background: !isAutoBetting ? 'var(--accent-green)' : 'transparent',
                color: !isAutoBetting ? '#000' : 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Manual
            </button>
            <button
              onClick={() => setIsAutoBetting(true)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                background: isAutoBetting ? 'var(--accent-green)' : 'transparent',
                color: isAutoBetting ? '#000' : 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Auto
            </button>
          </div>

          {/* Cashout Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '0.8rem',
              display: 'block',
              fontWeight: '600'
            }}>
              Auto Cashout Multiplier
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.8rem'
            }}>
              <button
                onClick={() => {
                  playSound('button');
                  setAutoCashout(2.0);
                }}
                disabled={gameState !== 'betting'}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: autoCashout === 2.0 ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  background: autoCashout === 2.0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' : 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔥</span>
                <span>2.0x</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Safe</span>
              </button>
              <button
                onClick={() => {
                  playSound('button');
                  setAutoCashout(5.0);
                }}
                disabled={gameState !== 'betting'}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: autoCashout === 5.0 ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  background: autoCashout === 5.0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' : 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
                <span>5.0x</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Risky</span>
              </button>
            </div>
          </div>

          {/* Bet Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '0.8rem',
              display: 'block',
              fontWeight: '600'
            }}>
              Bet Amount
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={walletBalance}
                disabled={gameState !== 'betting'}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              <button
                onClick={() => setBetAmount(Math.floor(walletBalance / 2))}
                disabled={gameState !== 'betting'}
                style={{
                  padding: '0.8rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed'
                }}
              >
                1/2
              </button>
              <button
                onClick={() => setBetAmount(walletBalance)}
                disabled={gameState !== 'betting'}
                style={{
                  padding: '0.8rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed'
                }}
              >
                Max
              </button>
            </div>
            
            {/* Quick Bet Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {[10, 50, 100, 250, 500, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => quickBetAmount(amount)}
                  disabled={gameState !== 'betting'}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: betAmount === amount ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: betAmount === amount ? '#000' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: gameState === 'betting' ? 'pointer' : 'not-allowed'
                  }}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Bet Configuration */}
          {isAutoBetting && (
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--primary-gold)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontSize: '1rem' }}>
                🤖 Auto Bet Settings
              </h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
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
                    padding: '0.6rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: 'var(--text-secondary)', 
                    fontSize: '0.8rem',
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
                        padding: '0.4rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
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
                    fontSize: '0.8rem',
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
                        padding: '0.4rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto Bet Stats */}
          {autoBetStats.isRunning && (
            <div style={{
              background: 'rgba(0, 173, 181, 0.1)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                {autoBetStats.isRunning ? '🔄 Auto Betting...' : '✅ Auto Bet Complete'}
              </h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Bet:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{autoBetStats.currentBet}/{autoBetConfig.numberOfBets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Wins:</span>
                  <span style={{ color: 'var(--accent-green)' }}>{autoBetStats.wins}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Losses:</span>
                  <span style={{ color: 'var(--accent-red)' }}>{autoBetStats.losses}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Profit:</span>
                  <span style={{ 
                    color: autoBetStats.totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                  }}>
                    {formatNumber(autoBetStats.totalProfit)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bet Button */}
          <button
            onClick={autoBetStats.isRunning ? stopAutoBet : (isAutoBetting ? startAutoBet : handleBet)}
            disabled={gameState !== 'betting' || betAmount > walletBalance}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: autoBetStats.isRunning ? 
                'linear-gradient(135deg, var(--accent-red), #DC2626)' :
                'linear-gradient(135deg, var(--accent-green), #00CC70)',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: (gameState === 'betting' && betAmount <= walletBalance) ? 'pointer' : 'not-allowed',
              opacity: (gameState !== 'betting' || betAmount > walletBalance) ? 0.6 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '1rem'
            }}
          >
            {autoBetStats.isRunning ? 
              `⏹️ Stop Auto Bet` :
              isAutoBetting ? 
                `🤖 Start Auto Bet ₹${betAmount}` :
                `🎯 Place Bet ₹${betAmount}`
            }
          </button>

          {/* Manual Cashout Button */}
          {gameState === 'flying' && isPlaying && (
            <button
              onClick={() => handleCashout()}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
                color: '#000',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                animation: 'pulse 1s infinite',
                marginBottom: '1rem'
              }}
            >
              💰 Cash Out {formatNumber(betAmount * currentMultiplier)}
            </button>
          )}
        </div>

        {/* Game Display Area */}
        <div className="game-area">
          <h3 style={{ 
            color: 'var(--primary-gold)',
            fontSize: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✈️ Flight Status
          </h3>

          {/* Game State Display */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            {gameState === 'betting' && (
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Ready for Takeoff
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Place your bet and wait for the plane to fly!
                </p>
              </div>
            )}
            
            {gameState === 'flying' && (
              <div>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  animation: isLoading ? 'none' : 'bounce 2s infinite'
                }}>
                  ✈️
                </div>
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
                <h2 style={{ color: 'var(--accent-red)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                  Crashed at {currentMultiplier.toFixed(2)}x
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Better luck next time!
                </p>
              </div>
            )}
            
            {gameState === 'cashed_out' && (
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: 'var(--accent-green)', fontSize: '2rem', marginBottom: '0.5rem' }}>
                  Cashed Out at {currentMultiplier.toFixed(2)}x
                </h2>
                <p style={{ color: 'var(--accent-green)' }}>
                  You won {formatNumber(betAmount * currentMultiplier)}!
                </p>
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
              📊 Recent Flights
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem'
            }}>
              {gameResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.8rem 0.5rem',
                    borderRadius: '8px',
                    background: result.result === 'win' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${result.result === 'win' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    color: result.result === 'win' ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}>
                    {result.multiplier.toFixed(2)}x
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {result.result === 'win' ? 'WIN' : 'LOSE'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
              📈 Your Stats
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '700' }}>
                  {gameStats.totalGames}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Games
                </div>
              </div>
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '700' }}>
                  {getWinRate()}%
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Win Rate
                </div>
              </div>
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  color: gameStats.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', 
                  fontSize: '1.2rem', 
                  fontWeight: '700' 
                }}>
                  {formatNumber(gameStats.netProfit)}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Net Profit
                </div>
              </div>
              <div style={{
                background: 'var(--glass-bg)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '700' }}>
                  {gameStats.bestStreak}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Best Streak
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Bets Feed */}
        <div className="game-area">
          <h3 style={{ 
            color: 'var(--primary-gold)',
            fontSize: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🌟 Live Bets
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {liveBets.map((bet, index) => (
              <div
                key={bet.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  background: 'var(--glass-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  animation: index === 0 ? 'slideInRight 0.5s ease-out' : 'none'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    {bet.user}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {formatNumber(bet.amount)} × {bet.multiplier}x
                  </div>
                </div>
                <div style={{
                  color: 'var(--accent-green)',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  +{formatNumber(bet.win)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid var(--border-color)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
              ✈️ Aviator Rules
            </h2>
            
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>How to Play:</strong>
              </p>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>Place your bet before the plane takes off</li>
                <li>Watch the multiplier increase as the plane flies</li>
                <li>Cash out before the plane crashes to win</li>
                <li>The longer you wait, the higher the multiplier</li>
                <li>If the plane crashes before you cash out, you lose your bet</li>
              </ul>
              
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Auto Bet:</strong>
              </p>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>Set the number of automatic bets</li>
                <li>Configure auto cashout multiplier</li>
                <li>Set stop conditions for wins/losses</li>
                <li>Monitor your progress in real-time</li>
              </ul>
              
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Tips:</strong>
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Start with smaller bets to learn the game</li>
                <li>Use auto cashout for consistent strategy</li>
                <li>Set stop loss limits to manage risk</li>
                <li>Remember: Higher multipliers are rarer</li>
              </ul>
            </div>
            
            <button
              onClick={() => setShowRules(false)}
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '1.5rem',
                background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aviator; 