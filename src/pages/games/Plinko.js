import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Plinko = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [gameState, setGameState] = useState('betting'); // betting, dropping, result
  const [isDropping, setIsDropping] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 });
  const [finalSlot, setFinalSlot] = useState(null);
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
    { user: 'Arjun_K294', amount: 50, risk: 'High', multiplier: '26x', win: 1300, id: 1 },
    { user: 'Priya_S817', amount: 75, risk: 'Medium', multiplier: '5.6x', win: 420, id: 2 },
    { user: 'Rahul_P453', amount: 100, risk: 'Low', multiplier: '2.4x', win: 240, id: 3 },
    { user: 'Ananya_M628', amount: 40, risk: 'High', multiplier: '0.2x', win: 8, id: 4 },
    { user: 'Vikram_R935', amount: 150, risk: 'Medium', multiplier: '13x', win: 1950, id: 5 }
  ]);

  // Plinko multipliers for different risk levels
  const multipliers = {
    low: [1.5, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.5],
    medium: [5.6, 2.1, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 2.1, 5.6],
    high: [29, 8.1, 3.0, 1.5, 1.0, 0.5, 0.2, 0.2, 0.5, 1.0, 1.5, 3.0, 8.1, 29]
  };

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'ball_drop':
        // Realistic ball drop sound - initial release with air whoosh
        const dropOsc = audioContext.createOscillator();
        const dropGain = audioContext.createGain();
        const dropFilter = audioContext.createBiquadFilter();
        
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(800, audioContext.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        
        dropFilter.type = 'lowpass';
        dropFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
        
        dropGain.gain.setValueAtTime(0.15, audioContext.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        dropOsc.connect(dropFilter);
        dropFilter.connect(dropGain);
        dropGain.connect(audioContext.destination);
        
        dropOsc.start(audioContext.currentTime);
        dropOsc.stop(audioContext.currentTime + 0.3);
        
        return;
        break;
      case 'ball_bounce':
        for (let i = 0; i < 8; i++) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(200 + Math.random() * 200, audioContext.currentTime + i * 0.2);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.1);
          osc.start(audioContext.currentTime + i * 0.2);
          osc.stop(audioContext.currentTime + i * 0.2 + 0.1);
        }
        return;
      case 'win':
        const frequencies = [261.63, 329.63, 392.00];
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
        return;
      case 'lose':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    }
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
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
    const risks = ['Low', 'Medium', 'High'];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    
    // Get random multiplier for the risk level
    const riskKey = risk.toLowerCase();
    const mults = multipliers[riskKey];
    const randomMult = mults[Math.floor(Math.random() * mults.length)];
    const win = Math.floor(amount * randomMult);
    
    return {
      user: userName,
      amount,
      risk,
      multiplier: `${randomMult}x`,
      win,
      id: Date.now() + Math.random()
    };
  };

  // Update live bets periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newBet = generateRandomBet();
      setLiveBets(prev => [newBet, ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Drop ball animation
  const dropBall = async (isAutomatic = false) => {
    if (gameState !== 'betting' || betAmount < 10 || betAmount > walletBalance) return;
    
    setIsLoading(true);
    setGameState('dropping');
    setIsDropping(true);
    setResult(null);
    setBallPosition({ x: 50, y: 0 });
    
    try {
      const gameResult = await placeBet(betAmount, 'plinko');
      
      // Simulate ball drop animation
      playSound('drop');
      
      // Determine final slot based on risk level
      const slots = multipliers[riskLevel];
      const finalSlotIndex = Math.floor(Math.random() * slots.length);
      const finalMultiplier = slots[finalSlotIndex];
      
      // Animate ball movement
      let animationStep = 0;
      const totalSteps = 20;
      const animationInterval = setInterval(() => {
        animationStep++;
        
        // Update ball position
        const progress = animationStep / totalSteps;
        const newX = 50 + (Math.random() - 0.5) * 30 * Math.sin(progress * Math.PI * 4);
        const newY = progress * 100;
        
        setBallPosition({ x: newX, y: newY });
        
        if (animationStep >= totalSteps) {
          clearInterval(animationInterval);
          setIsDropping(false);
          setFinalSlot(finalSlotIndex);
          
          const won = finalMultiplier > 1;
          const payout = Math.floor(betAmount * finalMultiplier);
          
          const result = {
            won,
            slotIndex: finalSlotIndex,
            multiplier: finalMultiplier,
            payout,
            betAmount,
            riskLevel
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
              setFinalSlot(null);
              setBallPosition({ x: 50, y: 0 });
              
              if (autoBetEnabledRef.current) {
                processAutoBetResult(result);
              }
            }, 3000);
            
          }, 500);
        }
      }, 100);
      
    } catch (error) {
      console.error('Bet failed:', error);
      setGameState('betting');
      setIsDropping(false);
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
    
    // Continue auto-betting after delay
    console.log(`Auto-bet: Will start bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets} in 2 seconds`);
    setTimeout(() => {
      if (autoBetEnabledRef.current && newCurrentBet < autoBetConfig.numberOfBets) {
        console.log(`Auto-bet: Starting bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets}`);
        dropBall(true);
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
            dropBall(true);
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

  const getMultiplierColor = (mult) => {
    if (mult >= 10) return '#ff6b35';
    if (mult >= 3) return '#f59e0b';
    if (mult >= 1) return '#22c55e';
    return '#ef4444';
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
          <div style={{ fontSize: '3rem' }}>⚪</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Plinko
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Drop the ball and watch it bounce! Different risk levels offer varying rewards!
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

          {/* Risk Level Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              🎯 Risk Level
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.5rem'
            }}>
              {['low', 'medium', 'high'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskLevel(risk)}
                  disabled={gameState !== 'betting'}
                  style={{
                    background: riskLevel === risk ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${riskLevel === risk ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)'}`,
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    opacity: gameState === 'betting' ? 1 : 0.5,
                    textTransform: 'capitalize'
                  }}
                >
                  {risk} Risk
                </button>
              ))}
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
              ₹{betAmount * Math.max(...multipliers[riskLevel])}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
              {Math.max(...multipliers[riskLevel])}x max multiplier
            </div>
          </div>

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => dropBall()}
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
              {isLoading ? '⚪ Dropping...' : '⚪ Drop Ball'}
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
              🔄 Next Drop
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
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of drops:</label>
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
          {/* Plinko Board */}
          <div style={{
            width: '300px',
            height: '400px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Pegs */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '260px',
              height: '320px'
            }}>
              {/* Create peg pattern */}
              {Array.from({ length: 8 }).map((_, row) => (
                <div key={row} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '15px'
                }}>
                  {Array.from({ length: row + 3 }).map((_, col) => (
                    <div
                      key={col}
                      style={{
                        width: '8px',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%',
                        boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Multiplier slots */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '2px'
            }}>
              {multipliers[riskLevel].map((mult, index) => (
                <div
                  key={index}
                  style={{
                    width: '18px',
                    height: '30px',
                    background: finalSlot === index ? 
                      'rgba(255, 215, 0, 0.8)' : 
                      getMultiplierColor(mult),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRadius: '2px',
                    border: finalSlot === index ? '2px solid #ffd700' : 'none',
                    boxShadow: finalSlot === index ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                    animation: finalSlot === index ? 'goldGlow 1s infinite alternate' : 'none'
                  }}
                >
                  {mult}x
                </div>
              ))}
            </div>

            {/* Ball Animation */}
            {isDropping && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '12px',
                background: 'white',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                animation: 'bounce 0.5s infinite alternate',
                zIndex: 10
              }}
              />
            )}

            {/* Game State Messages */}
            {gameState === 'betting' && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚪</div>
                <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>
                  Ready to Drop!
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0' }}>
                  Watch the ball bounce through the pegs
                </p>
              </div>
            )}

            {gameState === 'result' && result && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${result.won ? '#22c55e' : '#ef4444'}`
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {result.won ? '🎉' : '😔'}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: result.won ? '#22c55e' : '#ef4444',
                  margin: '0 0 0.5rem 0'
                }}>
                  {result.multiplier}x
                </h3>
                {result.won && (
                  <p style={{
                    color: '#22c55e',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    Won: ₹{result.payout}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Risk Level Info */}
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Risk Level: <span style={{ 
                color: riskLevel === 'high' ? '#ef4444' : riskLevel === 'medium' ? '#f59e0b' : '#22c55e',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {riskLevel}
              </span>
            </p>
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
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Drops</div>
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
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📋 Recent Drops</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {gameHistory.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  padding: '2rem',
                  fontSize: '0.9rem'
                }}>
                  No drops yet
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
                        {game.multiplier}x {game.riskLevel}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Slot {game.slotIndex + 1}
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
                      {bet.risk} {bet.multiplier}
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
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 1.7)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>⚪ How to Play Plinko</h2>
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
                <li>Drop a ball from the top of the board</li>
                <li>Ball bounces through pegs randomly</li>
                <li>Land in a multiplier slot at the bottom</li>
                <li>Win based on the multiplier you land on</li>
              </ul>
              
              <p><strong>🎲 Risk Levels:</strong></p>
              <ul>
                <li><strong>Low Risk:</strong> 9 slots, safer multipliers (0.5x - 1.5x)</li>
                <li><strong>Medium Risk:</strong> 11 slots, balanced (0.3x - 5.6x)</li>
                <li><strong>High Risk:</strong> 14 slots, extreme variance (0.2x - 29x)</li>
              </ul>

              <p><strong>💰 Strategy Tips:</strong></p>
              <ul>
                <li>Higher risk = higher potential rewards</li>
                <li>Ball path is completely random</li>
                <li>Center slots often have lower multipliers</li>
                <li>Edge slots typically have higher multipliers</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes goldGlow {
          0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.8); }
          100% { box-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default Plinko; 