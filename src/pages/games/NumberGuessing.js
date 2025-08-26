import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const NumberGuessing = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [rangeMin, setRangeMin] = useState(1);
  const [rangeMax, setRangeMax] = useState(10);
  const [gameState, setGameState] = useState('betting'); // betting, revealing, result
  const [generatedNumber, setGeneratedNumber] = useState(null);
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
    { user: 'Arjun_K294', amount: 50, guess: 7, actual: 7, range: '1-10', win: 450, id: 1 },
    { user: 'Priya_S817', amount: 75, guess: 15, actual: 23, range: '1-50', win: 0, id: 2 },
    { user: 'Rahul_P453', amount: 100, guess: 88, actual: 88, range: '1-100', win: 9900, id: 3 },
    { user: 'Ananya_M628', amount: 40, guess: 5, actual: 3, range: '1-10', win: 0, id: 4 },
    { user: 'Vikram_R935', amount: 150, guess: 42, actual: 42, range: '1-50', win: 7350, id: 5 }
  ]);

  // Predefined ranges with their multipliers
  const ranges = [
    { min: 1, max: 10, multiplier: 9, label: '1-10 (9x)' },
    { min: 1, max: 25, multiplier: 24, label: '1-25 (24x)' },
    { min: 1, max: 50, multiplier: 49, label: '1-50 (49x)' },
    { min: 1, max: 100, multiplier: 99, label: '1-100 (99x)' }
  ];

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'number_reveal':
        // Realistic number reveal - digital countdown with mechanical click
        
        // Digital beep for number display
        const digitalOsc = audioContext.createOscillator();
        const digitalGain = audioContext.createGain();
        const digitalFilter = audioContext.createBiquadFilter();
        
        digitalOsc.type = 'square';
        digitalOsc.frequency.setValueAtTime(800, audioContext.currentTime);
        digitalOsc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
        
        digitalFilter.type = 'lowpass';
        digitalFilter.frequency.setValueAtTime(1200, audioContext.currentTime);
        
        digitalGain.gain.setValueAtTime(0.15, audioContext.currentTime);
        digitalGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
        
        digitalOsc.connect(digitalFilter);
        digitalFilter.connect(digitalGain);
        digitalGain.connect(audioContext.destination);
        
        digitalOsc.start(audioContext.currentTime);
        digitalOsc.stop(audioContext.currentTime + 0.25);
        
        // Add mechanical switch click
        setTimeout(() => {
          const clickOsc = audioContext.createOscillator();
          const clickGain = audioContext.createGain();
          
          clickOsc.type = 'square';
          clickOsc.frequency.setValueAtTime(300, audioContext.currentTime);
          
          clickGain.gain.setValueAtTime(0.08, audioContext.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
          
          clickOsc.connect(clickGain);
          clickGain.connect(audioContext.destination);
          
          clickOsc.start(audioContext.currentTime);
          clickOsc.stop(audioContext.currentTime + 0.05);
        }, 100);
        
        return;
        break;
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
    
    // Random range
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    const guess = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const actual = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    const win = guess === actual ? amount * range.multiplier : 0;
    
    return {
      user: userName,
      amount,
      guess,
      actual,
      range: `${range.min}-${range.max}`,
      win,
      id: Date.now() + Math.random()
    };
  };

  // Update live bets periodically
  useEffect(() => {
      const interval = setInterval(() => {
      const newBet = generateRandomBet();
      setLiveBets(prev => [newBet, ...prev.slice(0, 4)]);
    }, 4500);
      
      return () => clearInterval(interval);
  }, []);

  // Get current multiplier
  const getCurrentMultiplier = () => {
    const range = ranges.find(r => r.min === rangeMin && r.max === rangeMax);
    return range ? range.multiplier : Math.floor(rangeMax - rangeMin);
  };

  // Set predefined range
  const setRange = (min, max) => {
    setRangeMin(min);
    setRangeMax(max);
    setSelectedNumber(''); // Clear selection when range changes
  };

  // Game logic
  const playGame = async (isAutomatic = false) => {
    if (gameState !== 'betting' || !selectedNumber || selectedNumber < rangeMin || selectedNumber > rangeMax || betAmount < 10 || betAmount > walletBalance) return;
    
    setIsLoading(true);
    setGameState('revealing');
    setResult(null);
    
    try {
      const gameResult = await placeBet(betAmount, 'number-guessing');
      
      // Generate random number in range
      const randomNumber = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
      
      playSound('reveal');
      
      // Show number generation animation
      let count = 0;
      const animationInterval = setInterval(() => {
        setGeneratedNumber(Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin);
        count++;
        
        if (count >= 20) { // Show animation for ~2 seconds
          clearInterval(animationInterval);
          setGeneratedNumber(randomNumber);
          
          const won = parseInt(selectedNumber) === randomNumber;
          const multiplier = getCurrentMultiplier();
          const payout = won ? betAmount * multiplier : 0;
          
          const result = {
            won,
            guessedNumber: parseInt(selectedNumber),
            generatedNumber: randomNumber,
            multiplier,
            payout,
            betAmount,
            range: `${rangeMin}-${rangeMax}`
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
              setSelectedNumber('');
              setGeneratedNumber(null);
              
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
    
    // For auto-bet, randomly select a number in the current range
    const randomGuess = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
    setSelectedNumber(randomGuess.toString());
    
    // Continue auto-betting after delay
    console.log(`Auto-bet: Will start bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets} in 2 seconds`);
    setTimeout(() => {
      if (autoBetEnabledRef.current && newCurrentBet < autoBetConfig.numberOfBets) {
        console.log(`Auto-bet: Starting bet ${newCurrentBet + 1}/${autoBetConfig.numberOfBets}`);
        playGame(true);
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
        const randomGuess = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
        setSelectedNumber(randomGuess.toString());
        setTimeout(() => {
          if (gameState === 'betting') {
            playGame(true);
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
          <div style={{ fontSize: '3rem' }}>🔢</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Number Guessing
          </h1>
      </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Guess the winning number! Higher or lower, odds or evens - multiple ways to win!
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

          {/* Number Range Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              🎯 Number Range
            </label>
          <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.5rem'
            }}>
              {ranges.map((range, index) => (
            <button
                  key={index}
                  onClick={() => setRange(range.min, range.max)}
                  disabled={gameState !== 'betting'}
              style={{
                    background: (rangeMin === range.min && rangeMax === range.max) ? 
                      'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${(rangeMin === range.min && rangeMax === range.max) ? 
                      'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)'}`,
                color: 'white',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                fontWeight: 'bold',
                    opacity: gameState === 'betting' ? 1 : 0.5
              }}
            >
                  {range.label}
            </button>
              ))}
          </div>
        </div>
          
          {/* Number Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              🔢 Your Guess ({rangeMin}-{rangeMax})
            </label>
            <input
              type="number"
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(e.target.value)}
              min={rangeMin}
              max={rangeMax}
              placeholder={`Enter ${rangeMin}-${rangeMax}`}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1.1rem',
          textAlign: 'center',
                outline: 'none'
              }}
              disabled={gameState !== 'betting'}
            />
          </div>
          
          {/* Potential Win Display */}
          {selectedNumber && (
          <div style={{ 
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
            padding: '1rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
          }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Potential Win
            </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>
                ₹{betAmount * getCurrentMultiplier()}
            </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                {getCurrentMultiplier()}x multiplier
            </div>
          </div>
          )}

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => playGame()}
              disabled={isLoading || !selectedNumber || selectedNumber < rangeMin || selectedNumber > rangeMax || betAmount < 10 || betAmount > walletBalance}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: isLoading || !selectedNumber || selectedNumber < rangeMin || selectedNumber > rangeMax || betAmount < 10 || betAmount > walletBalance ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                opacity: isLoading || !selectedNumber || selectedNumber < rangeMin || selectedNumber > rangeMax || betAmount < 10 || betAmount > walletBalance ? 0.5 : 1,
                marginBottom: '1rem'
              }}
            >
              {isLoading ? '🔢 Playing...' : '🔢 Guess Number'}
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
              🔄 Next Round
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
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of guesses:</label>
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
          {gameState === 'betting' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔢</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
                Ready to Guess?
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', maxWidth: '400px' }}>
                Pick a number range and make your guess! The higher the range, the bigger the multiplier. Guess correctly to win big!
              </p>
              {selectedNumber && (
                <div style={{ 
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.5)'
                }}>
                  <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Your Guess: {selectedNumber}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Range: {rangeMin} - {rangeMax}
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === 'revealing' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#f59e0b' }}>
                🎲 Generating Number...
              </h2>
              
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '4px solid rgba(59, 130, 246, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 auto 2rem',
                animation: 'pulse 1s infinite'
              }}>
                {generatedNumber || '?'}
              </div>
              
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
                Your guess: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{selectedNumber}</span>
              </p>
            </div>
          )}

          {gameState === 'result' && result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                {result.won ? '🎉' : '😔'}
              </div>
              
          <h3 style={{ 
                fontSize: '2rem',
                fontWeight: 'bold',
                color: result.won ? '#22c55e' : '#ef4444',
                margin: '0 0 1rem 0'
          }}>
                {result.won ? `PERFECT GUESS!` : 'Try Again!'}
          </h3>
          
          <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                alignItems: 'center',
                marginBottom: '2rem'
          }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Your Guess</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {result.guessedNumber}
                  </div>
                </div>

                <div style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  VS
          </div>
          
          <div style={{ 
                  background: result.won ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `2px solid ${result.won ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>Generated</div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: result.won ? '#22c55e' : '#ef4444' 
                  }}>
                    {result.generatedNumber}
                  </div>
                </div>
          </div>
          
              {result.won && (
            <div style={{ 
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: '#22c55e',
                  fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
                  Won: ₹{result.payout} ({result.multiplier}x)
            </div>
          )}
          
              <div style={{
                marginTop: '1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem'
              }}>
                Range: {result.range}
              </div>
            </div>
          )}
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
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Games</div>
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
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📋 Recent Games</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {gameHistory.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  padding: '2rem',
                  fontSize: '0.9rem'
                }}>
                  No games played yet
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
                        {game.guessedNumber} vs {game.generatedNumber}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {game.range} ({game.multiplier}x)
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
                      {bet.guess} vs {bet.actual} ({bet.range})
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
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 1.6)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🔢 How to Play Number Guessing</h2>
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
                <li>Choose a number range (higher = bigger multiplier)</li>
                <li>Pick your lucky number within that range</li>
                <li>Random number is generated</li>
                <li>Match exactly to win the multiplier</li>
              </ul>
              
              <p><strong>💰 Multipliers by Range:</strong></p>
              <ul>
                <li>1-10: 9x your bet</li>
                <li>1-25: 24x your bet</li>
                <li>1-50: 49x your bet</li>
                <li>1-100: 99x your bet</li>
              </ul>

              <p><strong>🎮 Strategy Tips:</strong></p>
              <ul>
                <li>Lower ranges = higher chance, lower payout</li>
                <li>Higher ranges = lower chance, higher payout</li>
                <li>All numbers have equal probability</li>
                <li>Trust your instincts and lucky numbers</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default NumberGuessing; 