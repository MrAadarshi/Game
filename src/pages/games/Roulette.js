import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Roulette = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('betting'); // betting, spinning, result
  const [selectedBets, setSelectedBets] = useState([]);
  const [spinningNumber, setSpinningNumber] = useState(0);
  const [finalNumber, setFinalNumber] = useState(null);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
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
    { user: 'Arjun_K294', amount: 50, number: 7, color: 'Red', win: 1750, id: 1 },
    { user: 'Priya_S817', amount: 75, number: 0, color: 'Green', win: 2625, id: 2 },
    { user: 'Rahul_P453', amount: 100, number: 23, color: 'Red', win: 200, id: 3 },
    { user: 'Ananya_M628', amount: 40, number: 15, color: 'Black', win: 80, id: 4 },
    { user: 'Vikram_R935', amount: 150, number: 31, color: 'Black', win: 0, id: 5 }
  ]);

  // Roulette numbers with their colors
  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 1, color: 'red' }, { number: 2, color: 'black' }, { number: 3, color: 'red' },
    { number: 4, color: 'black' }, { number: 5, color: 'red' }, { number: 6, color: 'black' },
    { number: 7, color: 'red' }, { number: 8, color: 'black' }, { number: 9, color: 'red' },
    { number: 10, color: 'black' }, { number: 11, color: 'black' }, { number: 12, color: 'red' },
    { number: 13, color: 'black' }, { number: 14, color: 'red' }, { number: 15, color: 'black' },
    { number: 16, color: 'red' }, { number: 17, color: 'black' }, { number: 18, color: 'red' },
    { number: 19, color: 'red' }, { number: 20, color: 'black' }, { number: 21, color: 'red' },
    { number: 22, color: 'black' }, { number: 23, color: 'red' }, { number: 24, color: 'black' },
    { number: 25, color: 'red' }, { number: 26, color: 'black' }, { number: 27, color: 'red' },
    { number: 28, color: 'black' }, { number: 29, color: 'black' }, { number: 30, color: 'red' },
    { number: 31, color: 'black' }, { number: 32, color: 'red' }, { number: 33, color: 'black' },
    { number: 34, color: 'red' }, { number: 35, color: 'black' }, { number: 36, color: 'red' }
  ];

  // Bet types and their payouts
  const betTypes = {
    'straight': { payout: 35, label: 'Straight Up' },
    'red': { payout: 1, label: 'Red' },
    'black': { payout: 1, label: 'Black' },
    'green': { payout: 35, label: 'Green (0)' },
    'odd': { payout: 1, label: 'Odd' },
    'even': { payout: 1, label: 'Even' },
    'low': { payout: 1, label: '1-18' },
    'high': { payout: 1, label: '19-36' }
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
      case 'wheel_spin':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 3);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3.5);
        break;
      case 'ball_bounce':
        for (let i = 0; i < 10; i++) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          const freq = 400 + Math.random() * 200;
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.05);
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.05);
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
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    const numberData = rouletteNumbers.find(n => n.number === winningNumber);
    
    // Random bet type
    const betTypeKeys = Object.keys(betTypes);
    const randomBetType = betTypeKeys[Math.floor(Math.random() * betTypeKeys.length)];
    
    let win = 0;
    if (randomBetType === 'straight' && Math.random() < 0.027) { // 1/37 chance
      win = amount * 35;
    } else if (randomBetType === 'red' && numberData.color === 'red') {
      win = amount * 1;
    } else if (randomBetType === 'black' && numberData.color === 'black') {
      win = amount * 1;
    } else if (randomBetType === 'green' && numberData.color === 'green') {
      win = amount * 35;
    }
    
    return {
      user: userName,
      amount,
      number: winningNumber,
      color: numberData.color === 'red' ? 'Red' : numberData.color === 'black' ? 'Black' : 'Green',
      win,
      id: Date.now() + Math.random()
    };
  };

  // Update live bets periodically
  useEffect(() => {
      const interval = setInterval(() => {
      const newBet = generateRandomBet();
      setLiveBets(prev => [newBet, ...prev.slice(0, 4)]);
    }, 6000);
      
      return () => clearInterval(interval);
  }, []);

  // Add bet
  const addBet = (type, value) => {
    const existingBetIndex = selectedBets.findIndex(bet => bet.type === type && bet.value === value);
    
    if (existingBetIndex >= 0) {
      // Remove existing bet
      setSelectedBets(prev => prev.filter((_, index) => index !== existingBetIndex));
    } else {
      // Add new bet
      const newBet = {
        type,
        value,
        amount: betAmount,
        payout: betTypes[type]?.payout || (type === 'straight' ? 35 : 1)
      };
      setSelectedBets(prev => [...prev, newBet]);
    }
  };

  // Get total bet amount
  const getTotalBetAmount = () => {
    return selectedBets.reduce((total, bet) => total + bet.amount, 0);
  };

  // Clear all bets
  const clearAllBets = () => {
    setSelectedBets([]);
  };

  // Spin roulette
  const spinRoulette = async (isAutomatic = false) => {
    if (gameState !== 'betting' || selectedBets.length === 0 || getTotalBetAmount() > walletBalance) return;
    
    setIsLoading(true);
      setGameState('spinning');
      setIsSpinning(true);
    setResult(null);
    
    try {
      const gameResult = await placeBet(getTotalBetAmount(), 'roulette');
      
      // Generate winning number
        const winningNumber = Math.floor(Math.random() * 37); // 0-36
      const winningData = rouletteNumbers.find(n => n.number === winningNumber);
      
      // Animate spinning
      let spinCount = 0;
      const spinInterval = setInterval(() => {
        setSpinningNumber(Math.floor(Math.random() * 37));
        spinCount++;
        
        if (spinCount >= 30) { // Spin for ~3 seconds
          clearInterval(spinInterval);
          setSpinningNumber(winningNumber);
          setFinalNumber(winningNumber);
        setIsSpinning(false);
          
          // Calculate winnings
          let totalWinnings = 0;
          const winningBets = [];
          
          selectedBets.forEach(bet => {
            let isWinningBet = false;
            
            switch (bet.type) {
              case 'straight':
                isWinningBet = bet.value === winningNumber;
                break;
              case 'red':
                isWinningBet = winningData.color === 'red' && winningNumber !== 0;
                break;
              case 'black':
                isWinningBet = winningData.color === 'black' && winningNumber !== 0;
                break;
              case 'green':
                isWinningBet = winningNumber === 0;
                break;
              case 'odd':
                isWinningBet = winningNumber > 0 && winningNumber % 2 === 1;
                break;
              case 'even':
                isWinningBet = winningNumber > 0 && winningNumber % 2 === 0;
                break;
              case 'low':
                isWinningBet = winningNumber >= 1 && winningNumber <= 18;
                break;
              case 'high':
                isWinningBet = winningNumber >= 19 && winningNumber <= 36;
                break;
            }
            
            if (isWinningBet) {
              const winAmount = bet.amount * (bet.payout + 1); // +1 to include original bet
              totalWinnings += winAmount;
              winningBets.push({ ...bet, winAmount });
            }
          });
          
          const won = totalWinnings > 0;
          const result = {
            won,
            winningNumber,
            winningColor: winningData.color,
            totalBetAmount: getTotalBetAmount(),
            totalWinnings,
            winningBets,
            allBets: selectedBets
          };
          
          setTimeout(() => {
            setResult(result);
            setGameState('result');
            updateGameStats(result);
            
            if (won) {
              playSound('win');
              processGameResult(gameResult, totalWinnings);
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
              setSelectedBets([]);
              setFinalNumber(null);
              
              if (autoBetEnabledRef.current) {
                processAutoBetResult(result);
              }
            }, 4000);
            
          }, 1000);
        }
      }, 100);
      
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
    if (autoBetConfig.stopOnWin && gameResult.won && gameResult.totalWinnings >= autoBetConfig.winAmount) {
      console.log('Auto-bet stopped: Win target reached');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      return;
    }
    
    if (autoBetConfig.stopOnLoss && !gameResult.won && gameResult.totalBetAmount >= autoBetConfig.lossAmount) {
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
        // Auto-bet would select the same bets again
        setTimeout(() => spinRoulette(true), 500);
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
      
      // Start first auto-bet immediately if game is idle and has bets
      if (gameState === 'betting' && selectedBets.length > 0) {
        console.log('Auto-bet: Starting first bet');
        setTimeout(() => {
          if (gameState === 'betting' && selectedBets.length > 0) {
            spinRoulette(true);
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
        newStats.totalWinAmount += gameResult.totalWinnings;
        newStats.biggestWin = Math.max(newStats.biggestWin, gameResult.totalWinnings);
        newStats.currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1;
      } else {
        newStats.totalLosses += 1;
        newStats.totalLossAmount += gameResult.totalBetAmount;
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

  const getNumberColor = (number) => {
    const numberData = rouletteNumbers.find(n => n.number === number);
    return numberData ? numberData.color : 'black';
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
          <div style={{ fontSize: '3rem' }}>🎯</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Roulette
          </h1>
          </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Place your bets on the classic wheel! Red, black, odd, even, or specific numbers!
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
          
          {/* Selected Bets */}
          {selectedBets.length > 0 && (
          <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Selected Bets</span>
                <button
                  onClick={clearAllBets}
                  disabled={gameState !== 'betting'}
                  style={{
                    background: 'rgba(239, 68, 68, 0.3)',
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
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {selectedBets.map((bet, index) => (
                  <div key={index} style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.25rem'
                  }}>
                    {bet.type === 'straight' ? `#${bet.value}` : betTypes[bet.type]?.label} - ₹{bet.amount}
            </div>
                ))}
              </div>
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Total: ₹{getTotalBetAmount()}
              </div>
            </div>
          )}

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => spinRoulette()}
              disabled={isLoading || selectedBets.length === 0 || getTotalBetAmount() > walletBalance}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: isLoading || selectedBets.length === 0 || getTotalBetAmount() > walletBalance ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                opacity: isLoading || selectedBets.length === 0 || getTotalBetAmount() > walletBalance ? 0.5 : 1,
                marginBottom: '1rem'
              }}
            >
              {isLoading ? '🎯 Spinning...' : '🎯 Spin Roulette'}
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
          {/* Roulette Wheel */}
          <div style={{
            marginBottom: '2rem'
          }}>
            {/* Winning Number Display */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: finalNumber !== null ? 
                (getNumberColor(finalNumber) === 'red' ? '#ef4444' : 
                 getNumberColor(finalNumber) === 'black' ? '#374151' : '#22c55e') : 
                'rgba(255, 255, 255, 0.1)',
              border: '4px solid #ffd700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
              animation: isSpinning ? 'rotate 0.1s infinite linear' : 'none',
              margin: '0 auto'
            }}>
              {finalNumber !== null ? finalNumber : (isSpinning ? spinningNumber : '?')}
            </div>
            
            <div style={{ 
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {gameState === 'betting' && 'Place your bets!'}
              {gameState === 'spinning' && 'Spinning...'}
              {gameState === 'result' && result && (
                <span style={{ color: result.won ? '#22c55e' : '#ef4444' }}>
                  {result.won ? `You Won ₹${result.totalWinnings}!` : 'House Wins'}
                </span>
              )}
              </div>
            </div>
            
          {/* Betting Board */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            maxWidth: '500px'
          }}>
            {/* Numbers Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {/* Green 0 */}
              <button
                onClick={() => addBet('green', 0)}
                disabled={gameState !== 'betting'}
                style={{
                  gridColumn: '1 / -1',
                  background: selectedBets.some(bet => bet.type === 'green') ? 
                    'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                0 (35:1)
              </button>
              
              {/* Sample numbers for demo */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                  <button
                  key={number}
                  onClick={() => addBet('straight', number)}
                  disabled={gameState !== 'betting'}
                    style={{ 
                    background: selectedBets.some(bet => bet.type === 'straight' && bet.value === number) ? 
                      (getNumberColor(number) === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(55, 65, 81, 0.5)') :
                      (getNumberColor(number) === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(55, 65, 81, 0.2)'),
                    border: `1px solid ${getNumberColor(number) === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(55, 65, 81, 0.5)'}`,
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {number}
                  </button>
                ))}
            </div>
            
            {/* Outside Bets */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => addBet('red', 'red')}
                disabled={gameState !== 'betting'}
                style={{
                  background: selectedBets.some(bet => bet.type === 'red') ? 
                    'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                Red (1:1)
              </button>
              
              <button
                onClick={() => addBet('black', 'black')}
                disabled={gameState !== 'betting'}
                style={{
                  background: selectedBets.some(bet => bet.type === 'black') ? 
                    'rgba(55, 65, 81, 0.5)' : 'rgba(55, 65, 81, 0.2)',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                Black (1:1)
              </button>
              
              <button
                onClick={() => addBet('odd', 'odd')}
                disabled={gameState !== 'betting'}
                style={{
                  background: selectedBets.some(bet => bet.type === 'odd') ? 
                    'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                Odd (1:1)
              </button>
              
              <button
                onClick={() => addBet('even', 'even')}
                disabled={gameState !== 'betting'}
                style={{
                  background: selectedBets.some(bet => bet.type === 'even') ? 
                    'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: gameState === 'betting' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                Even (1:1)
              </button>
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
                        #{game.winningNumber} {game.winningColor}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {game.allBets?.length || 0} bet{game.allBets?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
          <div style={{ 
                      textAlign: 'right',
                      color: game.won ? '#22c55e' : '#ef4444',
            fontWeight: 'bold'
          }}>
                      {game.won ? `+₹${game.totalWinnings || 0}` : `-₹${game.totalBetAmount || 0}`}
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
                      #{bet.number} {bet.color}
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
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 2.1)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎯 How to Play Roulette</h2>
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
                <li>Place bets on numbers, colors, or groups</li>
                <li>Spin the wheel to get a random number</li>
                <li>Win if the ball lands on your bet</li>
                <li>Multiple bets allowed per spin</li>
              </ul>
              
              <p><strong>💰 Bet Types & Payouts:</strong></p>
              <ul>
                <li>Single Number (0-36): 35:1 payout</li>
                <li>Red/Black: 1:1 payout</li>
                <li>Odd/Even: 1:1 payout</li>
                <li>Green (0): 35:1 payout</li>
              </ul>

              <p><strong>🎮 How to Play:</strong></p>
              <ul>
                <li>Set your bet amount per selection</li>
                <li>Click on numbers or colors to bet</li>
                <li>Multiple bets multiply your total stake</li>
                <li>Spin when ready with your selections</li>
              </ul>
      </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Roulette; 