import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRewards } from '../../context/RewardsContext';

const ColorPredictionGame = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  const [betAmount, setBetAmount] = useState(10);
  const [prediction, setPrediction] = useState('');
  const [gameState, setGameState] = useState('betting'); // betting, spinning, result
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [winningColor, setWinningColor] = useState('');
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
  const roundTimerRef = useRef(null);

  // Color options
  const colors = [
    { name: 'Red', color: '#ef4444', emoji: '🔴', payout: 2 },
    { name: 'Green', color: '#22c55e', emoji: '🟢', payout: 2 },
    { name: 'Blue', color: '#3b82f6', emoji: '🔵', payout: 2 },
    { name: 'Yellow', color: '#eab308', emoji: '🟡', payout: 5 },
    { name: 'Purple', color: '#a855f7', emoji: '🟣', payout: 5 }
  ];

  // Recent results
  const [recentResults, setRecentResults] = useState([
    'Red', 'Green', 'Blue', 'Red', 'Yellow', 'Green', 'Purple', 'Blue', 'Red', 'Green'
  ]);

  // Sound effects - matching FlipCoin
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch (type) {
      case 'spin':
        // Spinning sound
        const spinDuration = 2;
        const spinOsc = audioContext.createOscillator();
        const spinGain = audioContext.createGain();
        const spinFilter = audioContext.createBiquadFilter();
        
        spinOsc.connect(spinFilter);
        spinFilter.connect(spinGain);
        spinGain.connect(audioContext.destination);
        
        spinOsc.type = 'sawtooth';
        spinOsc.frequency.setValueAtTime(100, audioContext.currentTime);
        spinOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + spinDuration);
        
        spinFilter.type = 'lowpass';
        spinFilter.frequency.setValueAtTime(200, audioContext.currentTime);
        spinFilter.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + spinDuration);
        
        spinGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        spinGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + spinDuration);
        
        spinOsc.start(audioContext.currentTime);
        spinOsc.stop(audioContext.currentTime + spinDuration);
        break;
        
      case 'win':
        // Win sound
        const winFreqs = [523.25, 659.25, 783.99]; // C, E, G
        winFreqs.forEach((freq, index) => {
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
        
      case 'lose':
        // Lose sound
        const loseOsc = audioContext.createOscillator();
        const loseGain = audioContext.createGain();
        
        loseOsc.connect(loseGain);
        loseGain.connect(audioContext.destination);
        
        loseOsc.type = 'sawtooth';
        loseOsc.frequency.setValueAtTime(200, audioContext.currentTime);
        loseOsc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        
        loseGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        loseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        loseOsc.start(audioContext.currentTime);
        loseOsc.stop(audioContext.currentTime + 0.5);
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
        
      case 'tick':
        // Countdown tick
        const tickOsc = audioContext.createOscillator();
        const tickGain = audioContext.createGain();
        
        tickOsc.connect(tickGain);
        tickGain.connect(audioContext.destination);
        
        tickOsc.frequency.setValueAtTime(400, audioContext.currentTime);
        tickOsc.type = 'square';
        
        tickGain.gain.setValueAtTime(0.05, audioContext.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        tickOsc.start(audioContext.currentTime);
        tickOsc.stop(audioContext.currentTime + 0.1);
        break;
        
      default:
        break;
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'betting' && timeLeft > 0) {
      roundTimerRef.current = setTimeout(() => {
        if (timeLeft <= 5) {
          playSound('tick');
        }
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'betting') {
      startRound();
    }

    return () => {
      if (roundTimerRef.current) {
        clearTimeout(roundTimerRef.current);
      }
    };
  }, [timeLeft, gameState]);

  // Auto Bet Functions
  const startAutoBet = () => {
    if (gameState !== 'betting' || !prediction) return;
    
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
      if (placeBet(betAmount, 0, 'color_prediction')) {
        currentBetCountRef.current += 1;
        setAutoBetStats(prev => ({
          ...prev,
          currentBet: currentBetCountRef.current,
          totalBets: prev.totalBets + 1,
          totalWagered: prev.totalWagered + betAmount
        }));
        
        updateChallengeProgress('games_played');
        
        // Wait for next round if this round is running
        if (gameState !== 'betting') {
          autoBetTimeoutRef.current = setTimeout(() => executeAutoBet(), 5000);
        }
      }
    } catch (error) {
      console.error('Auto bet error:', error);
      stopAutoBet();
    }
  };

  // Game Functions
  const startRound = () => {
    setGameState('spinning');
    setIsLoading(true);
    setWinningColor('');
    
    playSound('spin');
    
    // Determine winning color after spin animation
    setTimeout(() => {
      // Weighted probability: Red/Green/Blue (40% each), Yellow/Purple (10% each)
      const random = Math.random();
      let winner;
      
      if (random < 0.4) winner = 'Red';
      else if (random < 0.8) winner = 'Green';
      else if (random < 0.9) winner = 'Blue';
      else if (random < 0.95) winner = 'Yellow';
      else winner = 'Purple';
      
      setWinningColor(winner);
      setGameState('result');
      setIsLoading(false);
      
      // Check if player won
      const won = prediction === winner;
      const colorData = colors.find(c => c.name === winner);
      const payout = won ? colorData.payout : 0;
      const winnings = betAmount * payout;
      const profit = winnings - betAmount;
      
      if (won) {
        playSound('win');
        processGameResult(profit, 'color_prediction');
      } else {
        playSound('lose');
      }
      
      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: won ? prev.losses : prev.losses + 1,
        winStreak: won ? prev.winStreak + 1 : 0,
        currentStreak: won ? prev.currentStreak + 1 : 0,
        bestStreak: won ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
        totalWagered: prev.totalWagered + betAmount,
        totalWon: prev.totalWon + winnings,
        netProfit: prev.netProfit + profit
      }));
      
      // Add to results
      setGameResults(prev => [{
        result: won ? 'win' : 'lose',
        prediction: prediction,
        actual: winner,
        bet: betAmount,
        win: winnings,
        payout: payout,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
      
      // Update recent results
      setRecentResults(prev => [winner, ...prev.slice(0, 9)]);
      
      // Update challenges
      if (won) {
        updateChallengeProgress('games_won');
        updateChallengeProgress('earnings', profit);
        checkAchievement('first_win', { wins: 1 });
        if (winnings >= 1000) {
          checkAchievement('big_winner', { amount: winnings });
        }
      }
      
      // Auto bet stats
      if (autoBetStats.isRunning) {
        setAutoBetStats(prev => ({
          ...prev,
          wins: won ? prev.wins + 1 : prev.wins,
          losses: won ? prev.losses : prev.losses + 1,
          totalProfit: prev.totalProfit + profit
        }));
        
        if (won && autoBetConfig.stopOnWin && profit >= autoBetConfig.winAmount) {
          setTimeout(() => stopAutoBet(), 100);
        } else if (!won && autoBetConfig.stopOnLoss && betAmount >= autoBetConfig.lossAmount) {
          setTimeout(() => stopAutoBet(), 100);
        }
      }
      
      // Start next round
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setTimeLeft(30);
        setGameState('betting');
        setWinningColor('');
        setPrediction('');
        
        if (autoBetStats.isRunning) {
          executeAutoBet();
        }
      }, 3000);
    }, 3000);
  };

  const handleBet = () => {
    if (gameState !== 'betting' || !prediction || !placeBet(betAmount, 0, 'color_prediction')) return;
    
    updateChallengeProgress('games_played');
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
          <div style={{ fontSize: '3rem' }}>🎨</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Color Prediction Pro
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Predict the winning color and multiply your rewards!
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
            🎯 Place Your Bet
          </h3>
          
          {/* Round Info */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '700' }}>
              Round #{currentRound}
            </div>
            <div style={{ 
              color: timeLeft <= 5 ? 'var(--accent-red)' : 'var(--text-primary)', 
              fontSize: '2rem', 
              fontWeight: '900',
              marginTop: '0.5rem'
            }}>
              {timeLeft}s
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {gameState === 'betting' ? 'Time to bet' : gameState === 'spinning' ? 'Spinning...' : 'Round complete'}
            </div>
          </div>
          
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

          {/* Color Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '0.8rem',
              display: 'block',
              fontWeight: '600'
            }}>
              Choose Your Color
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.8rem'
            }}>
              {colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => {
                    playSound('button');
                    setPrediction(color.name);
                  }}
                  disabled={gameState !== 'betting'}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: prediction === color.name ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                    background: prediction === color.name ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' : 'var(--glass-bg)',
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
                  <span style={{ fontSize: '1.5rem', color: color.color }}>{color.emoji}</span>
                  <span>{color.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{color.payout}:1</span>
                </button>
              ))}
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
            disabled={gameState !== 'betting' || betAmount > walletBalance || (!autoBetStats.isRunning && !prediction)}
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
              cursor: (gameState === 'betting' && betAmount <= walletBalance && (prediction || autoBetStats.isRunning)) ? 'pointer' : 'not-allowed',
              opacity: (gameState !== 'betting' || betAmount > walletBalance || (!autoBetStats.isRunning && !prediction)) ? 0.6 : 1,
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
            🎨 Color Wheel
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
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Place Your Bets
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Choose a color and wait for the result!
                </p>
              </div>
            )}
            
            {gameState === 'spinning' && (
              <div>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  animation: 'spin 2s linear infinite'
                }}>
                  🌈
                </div>
                <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Spinning...
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  The wheel is spinning!
                </p>
              </div>
            )}
            
            {gameState === 'result' && winningColor && (
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {colors.find(c => c.name === winningColor)?.emoji}
                </div>
                <h2 style={{
                  color: colors.find(c => c.name === winningColor)?.color,
                  fontSize: '2rem',
                  fontWeight: '900',
                  marginBottom: '0.5rem'
                }}>
                  {winningColor} Wins!
                </h2>
                {prediction === winningColor && (
                  <p style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '700' }}>
                    🎉 You won {formatNumber(betAmount * colors.find(c => c.name === winningColor)?.payout)}!
                  </p>
                )}
                {prediction !== winningColor && prediction && (
                  <p style={{ color: 'var(--accent-red)', fontSize: '1.2rem' }}>
                    Better luck next time!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Results */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
              📊 Recent Results
            </h4>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {recentResults.map((result, index) => {
                const colorData = colors.find(c => c.name === result);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: `${colorData?.color}20`,
                      border: `1px solid ${colorData?.color}`,
                      color: colorData?.color,
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {colorData?.emoji} {result}
                  </div>
                );
              })}
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

        {/* Game History */}
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
            🏆 Game History
          </h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {gameResults.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '2rem',
                fontSize: '0.9rem'
              }}>
                No games played yet. Start betting to see your history!
              </div>
            ) : (
              gameResults.map((result, index) => {
                const colorData = colors.find(c => c.name === result.actual);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: `1px solid ${result.result === 'win' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                      animation: index === 0 ? 'slideInRight 0.5s ease-out' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ 
                        color: 'var(--text-primary)', 
                        fontWeight: '600', 
                        fontSize: '0.9rem',
                        marginBottom: '0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {colorData?.emoji} {result.prediction} → {result.actual}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Bet: {formatNumber(result.bet)} | Payout: {result.payout}:1
                      </div>
                    </div>
                    <div style={{
                      color: result.result === 'win' ? 'var(--accent-green)' : 'var(--accent-red)',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {result.result === 'win' ? '+' : ''}{formatNumber(result.win - result.bet)}
                    </div>
                  </div>
                );
              })
            )}
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
              🎨 Color Prediction Rules
            </h2>
            
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>How to Play:</strong>
              </p>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>Each round lasts 30 seconds for betting</li>
                <li>Choose a color before the timer runs out</li>
                <li>Watch the wheel spin to reveal the winning color</li>
                <li>Win if your chosen color matches the result</li>
              </ul>
              
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Payouts:</strong>
              </p>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>🔴 Red, 🟢 Green, 🔵 Blue: 2:1 (common)</li>
                <li>🟡 Yellow, 🟣 Purple: 5:1 (rare)</li>
              </ul>
              
              <p style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Auto Bet:</strong>
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Set number of automatic bets</li>
                <li>Configure stop conditions</li>
                <li>Uses your last selected color</li>
                <li>Runs across multiple rounds</li>
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

export default ColorPredictionGame; 