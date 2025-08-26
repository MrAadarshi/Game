import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const LuckyWheel = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('betting'); // betting, spinning, result
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  // Auto-bet configuration
  const [autoBetConfig, setAutoBetConfig] = useState({
    enabled: false,
    numberOfBets: 10,
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50,
    increaseOnWin: false,
    increaseOnLoss: false,
    increasePercentage: 10
  });

  // Game statistics
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalWinAmount: 0,
    totalLossAmount: 0,
    biggestWin: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  // Auto-bet refs for reliable counting
  const baseBetAmountRef = useRef(10);
  const currentBetCountRef = useRef(0);
  const autoBetEnabledRef = useRef(false);
  const [displayBetCount, setDisplayBetCount] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);

  // Live bets feed
  const [liveBets, setLiveBets] = useState([
    { user: 'Arjun_K294', amount: 50, multiplier: '2x', win: 100, id: 1 },
    { user: 'Priya_S817', amount: 75, multiplier: '10x', win: 750, id: 2 },
    { user: 'Rahul_P453', amount: 100, multiplier: '0x', win: 0, id: 3 },
    { user: 'Ananya_M628', amount: 40, multiplier: '5x', win: 200, id: 4 },
    { user: 'Vikram_R935', amount: 150, multiplier: '3x', win: 450, id: 5 }
  ]);

  // Wheel segments with multipliers
  const wheelSegments = [
    { multiplier: 2, color: '#22c55e', label: '2x' },
    { multiplier: 0, color: '#ef4444', label: '0x' },
    { multiplier: 3, color: '#3b82f6', label: '3x' },
    { multiplier: 0, color: '#ef4444', label: '0x' },
    { multiplier: 5, color: '#f59e0b', label: '5x' },
    { multiplier: 0, color: '#ef4444', label: '0x' },
    { multiplier: 10, color: '#8b5cf6', label: '10x' },
    { multiplier: 0, color: '#ef4444', label: '0x' },
    { multiplier: 2, color: '#22c55e', label: '2x' },
    { multiplier: 0, color: '#ef4444', label: '0x' },
    { multiplier: 50, color: '#ffd700', label: '50x' },
    { multiplier: 0, color: '#ef4444', label: '0x' }
  ];

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    // Create audio context for better sound generation
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on type
    switch (type) {
      case 'wheel_spin':
        // Realistic wheel spinning sound - mechanical spinning with air whoosh
        const spinDuration = 3;
        
        // Create spinning whoosh using filtered noise
        const wheelBuffer = audioContext.createBuffer(1, audioContext.sampleRate * spinDuration, audioContext.sampleRate);
        const wheelData = wheelBuffer.getChannelData(0);
        
        for (let i = 0; i < wheelData.length; i++) {
          const t = i / wheelData.length;
          const intensity = 1 - t; // Decreasing intensity
          wheelData[i] = (Math.random() * 2 - 1) * intensity * 0.3;
        }
        
        const wheelSource = audioContext.createBufferSource();
        wheelSource.buffer = wheelBuffer;
        
        const wheelFilter = audioContext.createBiquadFilter();
        wheelFilter.type = 'bandpass';
        wheelFilter.frequency.setValueAtTime(300, audioContext.currentTime);
        wheelFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + spinDuration);
        wheelFilter.Q.setValueAtTime(3, audioContext.currentTime);
        
        const wheelGain = audioContext.createGain();
        wheelGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        wheelGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + spinDuration);
        
        wheelSource.connect(wheelFilter);
        wheelFilter.connect(wheelGain);
        wheelGain.connect(audioContext.destination);
        
        wheelSource.start(audioContext.currentTime);
        wheelSource.stop(audioContext.currentTime + spinDuration);
        
        // Add mechanical clicking sounds (wheel segments)
        const clickCount = 20;
        for (let i = 0; i < clickCount; i++) {
          const delay = (i / clickCount) * spinDuration;
          const clickInterval = (spinDuration / clickCount) * (1 + i * 0.1); // Decreasing frequency
          
          setTimeout(() => {
            const clickOsc = audioContext.createOscillator();
            const clickGain = audioContext.createGain();
            
            clickOsc.type = 'square';
            clickOsc.frequency.setValueAtTime(150 + Math.random() * 50, audioContext.currentTime);
            
            const amplitude = 0.1 * (1 - delay / spinDuration);
            clickGain.gain.setValueAtTime(amplitude, audioContext.currentTime);
            clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            
            clickOsc.connect(clickGain);
            clickGain.connect(audioContext.destination);
            
            clickOsc.start(audioContext.currentTime);
            clickOsc.stop(audioContext.currentTime + 0.05);
          }, delay * 1000);
        }
        
        return;
        break;
        
      case 'wheel_stop':
        // Wheel stopping sound - click
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
        
      case 'win':
        // Win sound - triumphant chord progression
        const frequencies = [261.63, 329.63, 392.00]; // C-E-G chord
        frequencies.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
          osc.start(audioContext.currentTime + index * 0.1);
          osc.stop(audioContext.currentTime + 0.8);
        });
        break;
        
      case 'lose':
        // Lose sound - descending tone
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'button':
        // Button click sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
        
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  // Generate realistic live bets
  const generateRandomBet = () => {
    const indianNames = [
      'Aarav', 'Aayan', 'Abhay', 'Aditya', 'Advait', 'Ahaan', 'Akash', 'Aman', 'Amit', 'Aniket', 
      'Ansh', 'Arjun', 'Aryan', 'Ashwin', 'Atharv', 'Avinash', 'Ayush', 'Bhavesh', 'Bharat', 
      'Chaitanya', 'Chirag', 'Darshan', 'Deepak', 'Dev', 'Dhruv', 'Gaurav', 'Harsh', 'Ishaan',
      'Jay', 'Karan', 'Krish', 'Kunal', 'Manish', 'Mohit', 'Nikhil', 'Pranav', 'Rohan', 'Sahil',
      'Siddharth', 'Tushar', 'Uday', 'Varun', 'Vikram', 'Yash', 'Ananya', 'Aditi', 'Bhavana',
      'Chitra', 'Diya', 'Garima', 'Ishita', 'Kavya', 'Meera', 'Nisha', 'Priya', 'Radha', 'Sneha'
    ];
    
    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const userName = `${randomName}_${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randomSuffix}`;
    
    const amounts = [10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 500];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    // Random segment result
    const segment = wheelSegments[Math.floor(Math.random() * wheelSegments.length)];
    const win = amount * segment.multiplier;
    
    return {
      user: userName,
      amount,
      multiplier: segment.label,
      win,
      id: Date.now() + Math.random()
    };
  };

  // Update live bets periodically
  useEffect(() => {
      const interval = setInterval(() => {
      const newBet = generateRandomBet();
      setLiveBets(prev => [newBet, ...prev.slice(0, 4)]);
    }, 4000);
      
      return () => clearInterval(interval);
  }, []);

  // Game logic
  const spinWheel = async (isAutomatic = false) => {
    if (gameState !== 'betting' || betAmount < 10 || betAmount > walletBalance) return;
    
    setIsLoading(true);
    setGameState('spinning');
    setIsSpinning(true);
    setResult(null);
    
    try {
      const gameResult = await placeBet(betAmount, 'lucky-wheel');
      
      // Generate random spin result
      const winningSegmentIndex = Math.floor(Math.random() * wheelSegments.length);
      const winningSegment = wheelSegments[winningSegmentIndex];
      
      // Calculate rotation (each segment is 30 degrees)
      const segmentAngle = 360 / wheelSegments.length;
      const targetAngle = (winningSegmentIndex * segmentAngle) + (segmentAngle / 2);
      const spins = 5; // Number of full rotations
      const finalRotation = wheelRotation + (spins * 360) + (360 - targetAngle);
      
      setWheelRotation(finalRotation);
      playSound('wheel_spin');
      
      // Wait for spin animation to complete
      setTimeout(() => {
        setIsSpinning(false);
        playSound('wheel_stop');
        
        const won = winningSegment.multiplier > 0;
        const payout = Math.floor(betAmount * winningSegment.multiplier);
        
        const result = {
          won,
          segment: winningSegment,
          multiplier: winningSegment.multiplier,
          payout,
          betAmount
        };
        
        setTimeout(() => {
          setResult(result);
          setGameState('result');
          updateGameStats(result);
          
          if (won) {
            playSound('win');
            processGameResult(gameResult, payout);
          } else {
            playSound('lose');
            processGameResult(gameResult, 0);
          }
          
          // Add to history
          const newGame = {
            ...result,
            timestamp: Date.now()
          };
          
          setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
          
          setTimeout(() => {
            setGameState('betting');
            
            if (autoBetEnabledRef.current) {
              processAutoBetResult(result);
            }
          }, 3000);
          
        }, 500);
      }, 3000);
      
    } catch (error) {
      console.error('Bet failed:', error);
      setGameState('betting');
      setIsSpinning(false);
    }
    
    setIsLoading(false);
  };

  // Auto-bet logic with reliable counter
  const processAutoBetResult = (gameResult) => {
    currentBetCountRef.current += 1;
    const newCurrentBet = currentBetCountRef.current;
    setDisplayBetCount(newCurrentBet);
    
    console.log(`Auto-bet: Completed bet ${newCurrentBet}/${autoBetConfig.numberOfBets}`);
    
    // Check stop conditions
    if (autoBetConfig.stopOnWin && gameResult.won && gameResult.payout >= autoBetConfig.winAmount) {
      console.log('Auto-bet stopped: Win target reached');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      return;
    }
    
    if (autoBetConfig.stopOnLoss && !gameResult.won && gameResult.betAmount >= autoBetConfig.lossAmount) {
      console.log('Auto-bet stopped: Loss limit reached');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      return;
    }
    
    if (newCurrentBet >= autoBetConfig.numberOfBets) {
      console.log('Auto-bet stopped: Target number of bets reached');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      return;
    }
    
    // Adjust bet amount
    if (gameResult.won && autoBetConfig.increaseOnWin) {
      const newAmount = Math.floor(baseBetAmountRef.current * (1 + autoBetConfig.increasePercentage / 100));
      setBetAmount(Math.min(newAmount, 1000));
      baseBetAmountRef.current = Math.min(newAmount, 1000);
    } else if (!gameResult.won && autoBetConfig.increaseOnLoss) {
      const newAmount = Math.floor(baseBetAmountRef.current * (1 + autoBetConfig.increasePercentage / 100));
      setBetAmount(Math.min(newAmount, 1000));
      baseBetAmountRef.current = Math.min(newAmount, 1000);
    }
    
    // Continue auto-betting after delay
    console.log(`Auto-bet: Will start bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets} in 2 seconds`);
    setTimeout(() => {
      if (autoBetEnabledRef.current && newCurrentBet < autoBetConfig.numberOfBets) {
        console.log(`Auto-bet: Starting bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets}`);
        spinWheel(true);
      } else {
        console.log('Auto-bet: Not continuing - enabled:', autoBetEnabledRef.current, 'count:', newCurrentBet, 'target:', autoBetConfig.numberOfBets);
      }
    }, 2000);
  };

  const toggleAutoPlay = () => {
    if (autoBetConfig.enabled) {
      console.log('Auto-bet: Stopping');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
    } else {
      console.log('Auto-bet: Starting');
      baseBetAmountRef.current = betAmount;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      setAutoBetConfig(prev => ({ ...prev, enabled: true }));
      autoBetEnabledRef.current = true;
      
      // Start first auto-bet immediately if game is idle
      if (gameState === 'betting') {
        console.log('Auto-bet: Starting first bet');
        setTimeout(() => {
          if (gameState === 'betting') {
            spinWheel(true);
          }
        }, 500);
      }
    }
  };

  const updateGameStats = (gameResult) => {
    setGameStats(prev => {
      const newStats = { ...prev };
      newStats.totalGames += 1;
      
      if (gameResult.won) {
        newStats.totalWins += 1;
        newStats.totalWinAmount += gameResult.payout;
        newStats.biggestWin = Math.max(newStats.biggestWin, gameResult.payout);
        newStats.currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1;
      } else {
        newStats.totalLosses += 1;
        newStats.totalLossAmount += gameResult.betAmount;
        newStats.currentStreak = prev.currentStreak <= 0 ? prev.currentStreak - 1 : -1;
      }
      
      newStats.bestStreak = Math.max(newStats.bestStreak, Math.abs(newStats.currentStreak));
      
      return newStats;
    });
  };

  const quickBetAmount = (multiplier) => {
    setBetAmount(prev => Math.min(Math.max(Math.floor(prev * multiplier), 10), 1000));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getWinRate = () => {
    if (gameStats.totalGames === 0) return 0;
    return Math.round((gameStats.totalWins / gameStats.totalGames) * 100);
  };

  const clearResults = () => {
    setGameHistory([]);
    setGameStats({
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalWinAmount: 0,
      totalLossAmount: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0
    });
    currentBetCountRef.current = 0;
    setDisplayBetCount(0);
  };

  return (
    <div className="container animate-fadeInUp" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 173, 181, 0.1) 100%)',
        border: '1px solid var(--primary-gold)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>🎡</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Lucky Wheel
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Spin the wheel of fortune! Different colors offer different multipliers!
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem'
        }}>
          <span>💰 Balance: ₹{walletBalance}</span>
          <span>🎯 Win Rate: {getWinRate()}%</span>
          <span>🔥 Streak: {gameStats.currentStreak}</span>
        </div>
        
        {/* Game Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
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
        
        {/* Left Panel - Betting Controls */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          height: 'fit-content'
        }}>
            <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            fontSize: '1.2rem',
              textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.9)'
            }}>
            🎮 Betting Panel
            </h3>
            
          {/* Bet Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
                marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
              }}>
              💰 Bet Amount
              </label>
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{
                padding: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)'
              }}>₹</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(1000, parseInt(e.target.value) || 10)))}
                min="10"
                max="1000"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                disabled={gameState !== 'betting'}
              />
            </div>
            
            {/* Quick bet buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              <button
                onClick={() => quickBetAmount(0.5)}
                disabled={gameState !== 'betting'}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                  opacity: gameState === 'betting' ? 1 : 0.5
                }}
              >
                ÷2
              </button>
                  <button
                onClick={() => quickBetAmount(2)}
                disabled={gameState !== 'betting'}
                    style={{ 
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                  opacity: gameState === 'betting' ? 1 : 0.5
                }}
              >
                ×2
                  </button>
            </div>
          </div>

          {/* Max Win Display */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Max Possible Win
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700' }}>
              ₹{betAmount * 50}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
              50x multiplier
              </div>
            </div>

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => spinWheel()}
              disabled={isLoading || betAmount < 10 || betAmount > walletBalance}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: isLoading || betAmount < 10 || betAmount > walletBalance ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                opacity: isLoading || betAmount < 10 || betAmount > walletBalance ? 0.5 : 1,
                marginBottom: '1rem'
              }}
            >
              {isLoading ? '🎡 Spinning...' : '🎡 Spin Wheel'}
            </button>
          )}

          {gameState !== 'betting' && (
            <button
              onClick={() => setGameState('betting')}
              style={{
                width: '100%',
                background: 'rgba(156, 163, 175, 0.3)',
                border: '1px solid rgba(156, 163, 175, 0.5)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}
            >
              🔄 Next Spin
            </button>
          )}

          {/* Auto-bet Toggle */}
          <button
            onClick={toggleAutoPlay}
            style={{
              width: '100%',
              background: autoBetConfig.enabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${autoBetConfig.enabled ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            {autoBetConfig.enabled ? `⏹️ Stop Auto (${displayBetCount}/${autoBetConfig.numberOfBets})` : '▶️ Start Auto'}
          </button>

          {/* Auto-bet Configuration */}
          {!autoBetConfig.enabled && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of spins:</label>
                <input
                  type="number"
                  value={autoBetConfig.numberOfBets}
                  onChange={(e) => setAutoBetConfig(prev => ({ ...prev, numberOfBets: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="100"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    color: 'white',
                    marginTop: '0.25rem'
                  }}
                />
          </div>
        </div>
      )}
        </div>

        {/* Center Panel - Game Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '500px'
        }}>
          {/* Lucky Wheel */}
          <div style={{
            position: 'relative',
            width: '300px',
            height: '300px',
            marginBottom: '2rem'
          }}>
            {/* Wheel */}
            <div style={{
              width: '100%',
              height: '100%',
            borderRadius: '50%',
              border: '4px solid #ffd700',
            position: 'relative',
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
              background: 'conic-gradient(from 0deg, ' + 
                wheelSegments.map((segment, index) => 
                  `${segment.color} ${(index * 30)}deg ${((index + 1) * 30)}deg`
                ).join(', ') + ')',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
          }}>
            {/* Segment Labels */}
            {wheelSegments.map((segment, index) => {
                const angle = (index * 30) + 15; // Center of each segment
                const radian = (angle * Math.PI) / 180;
                const x = Math.cos(radian) * 120;
                const y = Math.sin(radian) * 120;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                    color: 'white',
                    fontWeight: 'bold',
                      fontSize: '0.9rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {segment.label}
                </div>
              );
            })}
          </div>
          
            {/* Pointer */}
          <div style={{
            position: 'absolute',
              top: '-10px',
            left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '20px solid #ffd700',
              zIndex: 10,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} />
        </div>

          {/* Game Status */}
          <div style={{
            textAlign: 'center',
            minHeight: '60px'
          }}>
            {gameState === 'betting' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'white' }}>
                  Ready to Spin!
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Land on a multiplier to win big
                </p>
              </div>
            )}

            {gameState === 'spinning' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#f59e0b' }}>
                  🎡 Spinning...
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  The wheel is spinning!
                </p>
              </div>
            )}

            {gameState === 'result' && result && (
              <div>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem'
                }}>
                  {result.won ? '🎉' : '😔'}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: result.won ? '#22c55e' : '#ef4444',
                  margin: '0 0 0.5rem 0'
                }}>
                  {result.won ? `${result.multiplier}x WIN!` : 'Better Luck Next Time!'}
                </h3>
                {result.won && (
                  <p style={{
                    color: '#22c55e',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    Won: ₹{result.payout}
                  </p>
                )}
              </div>
            )}
      </div>

          {/* Multiplier Info */}
          <div style={{
            marginTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            fontSize: '0.8rem',
            width: '100%',
            maxWidth: '300px'
          }}>
            <div style={{ 
              textAlign: 'center', 
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              0x
            </div>
            <div style={{ 
              textAlign: 'center', 
              color: '#22c55e',
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              2x-3x
            </div>
            <div style={{ 
              textAlign: 'center', 
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              5x-10x
            </div>
            <div style={{ 
          textAlign: 'center',
              color: '#ffd700',
              background: 'rgba(255, 215, 0, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px'
            }}>
              50x
            </div>
          </div>
        </div>

        {/* Right Panel - Stats and History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Game Statistics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '1.5rem'
          }}>
          <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📊 Statistics</h3>
              <button
                onClick={clearResults}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.7rem'
                }}
              >
                Clear
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Spins</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{gameStats.totalGames}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Win Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>{getWinRate()}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Won</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#22c55e' }}>₹{formatNumber(gameStats.totalWinAmount)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Biggest Win</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{formatNumber(gameStats.biggestWin)}</div>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '1.5rem',
            flex: 1
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📋 Recent Spins</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {gameHistory.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  padding: '2rem',
                  fontSize: '0.9rem'
                }}>
                  No spins yet
                </div>
              ) : (
                gameHistory.map((game, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: game.won ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${game.won ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {game.segment && game.segment.label}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        ₹{game.betAmount} bet
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      color: game.won ? '#22c55e' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {game.won ? `+₹${game.payout || 0}` : `-₹${game.betAmount || 0}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Wins Feed */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>🔥 Live Wins</h3>
            
            <div style={{ fontSize: '0.85rem' }}>
              {liveBets.map((bet, index) => (
                <div key={bet.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: index < liveBets.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#22c55e' }}>
                      {bet.user}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {bet.multiplier}
                    </div>
                  </div>
                  <div style={{ 
                    color: bet.win > 0 ? '#f59e0b' : '#ef4444',
                    fontWeight: 'bold'
                  }}>
                    {bet.win > 0 ? `+₹${bet.win}` : 'Lost'}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.85rem'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Won Today</div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                color: '#22c55e' 
              }}>
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 2.4)}
              </div>
            </div>
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '2rem',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎡 How to Play Lucky Wheel</h2>
          <button
                onClick={() => setShowRules(false)}
            style={{
                  background: 'none',
                  border: 'none',
              color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
          </button>
            </div>
            
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              <p><strong>🎯 Game Rules:</strong></p>
              <ul>
                <li>Place your bet and spin the wheel</li>
                <li>The wheel has 12 segments with different multipliers</li>
                <li>Win based on where the pointer lands</li>
                <li>Red segments (0x) = lose your bet</li>
                <li>Colored segments = win that multiplier</li>
              </ul>
              
              <p><strong>💰 Multipliers:</strong></p>
              <ul>
                <li>🔴 0x = Lose (appears 6 times)</li>
                <li>🟢 2x = Double your bet (appears 2 times)</li>
                <li>🔵 3x = Triple your bet (appears 1 time)</li>
                <li>🟡 5x = 5x your bet (appears 1 time)</li>
                <li>🟣 10x = 10x your bet (appears 1 time)</li>
                <li>🟨 50x = 50x your bet (appears 1 time)</li>
              </ul>

              <p><strong>🎮 Tips:</strong></p>
              <ul>
                <li>Higher multipliers are rarer</li>
                <li>All spins are completely random</li>
                <li>Use auto-spin for consistent play</li>
                <li>Set limits to manage your bankroll</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LuckyWheel; 