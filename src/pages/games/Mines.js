import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Mines = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState('betting'); // betting, playing, gameOver
  const [board, setBoard] = useState([]);
  const [revealedCells, setRevealedCells] = useState([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [nextMultiplier, setNextMultiplier] = useState(1.35);
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
    { user: 'Arjun_K294', amount: 50, diamonds: 5, multiplier: '3.2x', win: 160, id: 1 },
    { user: 'Priya_S817', amount: 75, diamonds: 2, multiplier: '1.8x', win: 135, id: 2 },
    { user: 'Rahul_P453', amount: 100, diamonds: 8, multiplier: '8.5x', win: 850, id: 3 },
    { user: 'Ananya_M628', amount: 40, diamonds: 1, multiplier: '1.3x', win: 52, id: 4 },
    { user: 'Vikram_R935', amount: 150, diamonds: 0, multiplier: '0x', win: 0, id: 5 }
  ]);

  const BOARD_SIZE = 25; // 5x5 grid

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
      case 'cell_click':
        // Cell click sound - soft click
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
        
      case 'gem_found':
        // Gem found sound - sparkling chime
        const gemFreqs = [523.25, 659.25, 783.99]; // C-E-G
        gemFreqs.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.05);
          gain.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.05 + 0.3);
          osc.start(audioContext.currentTime + index * 0.05);
          osc.stop(audioContext.currentTime + index * 0.05 + 0.3);
        });
        break;
        
      case 'mine_explosion':
        // Mine explosion sound - harsh noise burst
        const whiteNoise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        whiteNoise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        
        const explosionGain = audioContext.createGain();
        explosionGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        explosionGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        whiteNoise.connect(filter);
        filter.connect(explosionGain);
        explosionGain.connect(audioContext.destination);
        
        whiteNoise.start(audioContext.currentTime);
        whiteNoise.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'cash_out':
        // Cash out sound - triumphant sequence
        const cashFreqs = [392.00, 493.88, 587.33, 659.25]; // G-B-D-E
        cashFreqs.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.5);
          osc.start(audioContext.currentTime + index * 0.1);
          osc.stop(audioContext.currentTime + index * 0.1 + 0.5);
        });
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

  // Initialize board
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill().map(() => ({ isMine: false, isRevealed: false }));
    
    // Place mines randomly
    const minePositions = [];
    while (minePositions.length < mineCount) {
      const position = Math.floor(Math.random() * BOARD_SIZE);
      if (!minePositions.includes(position)) {
        minePositions.push(position);
        newBoard[position].isMine = true;
      }
    }
    
    setBoard(newBoard);
    setRevealedCells([]);
    setCurrentMultiplier(1.0);
    calculateNextMultiplier(0);
  };

  // Calculate multiplier based on diamonds found and mines
  const calculateMultiplier = (diamondsFound) => {
    if (diamondsFound === 0) return 1.0;
    const safeCells = BOARD_SIZE - mineCount;
    const remainingSafeCells = safeCells - diamondsFound;
    const multiplier = Math.pow(safeCells / remainingSafeCells, diamondsFound * 0.1) * (1 + diamondsFound * 0.3);
    return Math.round(multiplier * 100) / 100;
  };

  const calculateNextMultiplier = (currentDiamonds) => {
    const nextMult = calculateMultiplier(currentDiamonds + 1);
    setNextMultiplier(Math.round(nextMult * 100) / 100);
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
    const diamonds = Math.floor(Math.random() * 10); // 0-9 diamonds found
    const multiplier = diamonds > 0 ? calculateMultiplier(diamonds) : 0;
    const win = Math.floor(amount * multiplier);
    
    return {
      user: userName,
      amount,
      diamonds,
      multiplier: `${multiplier.toFixed(1)}x`,
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

  // Start new game
  const startGame = async (isAutomatic = false) => {
    if (gameState !== 'betting' || betAmount < 10 || betAmount > walletBalance) return;
    
    setIsLoading(true);
    
    try {
      const gameResult = await placeBet(betAmount, 'mines');
      
      initializeBoard();
      setGameState('playing');
      playSound('start');
      
    } catch (error) {
      console.error('Bet failed:', error);
    }
    
    setIsLoading(false);
  };

  // Reveal cell
  const revealCell = (index) => {
    if (gameState !== 'playing' || revealedCells.includes(index)) return;
    
    const cell = board[index];
    const newRevealedCells = [...revealedCells, index];
    setRevealedCells(newRevealedCells);
    
    if (cell.isMine) {
      // Hit a mine - game over
      playSound('lose');
      setGameState('gameOver');
      
      const result = {
        won: false,
        hitMine: true,
        diamondsFound: newRevealedCells.length - 1,
        multiplier: currentMultiplier,
        payout: 0,
        betAmount
      };
      
      setResult(result);
      updateGameStats(result);
      processGameResult({ gameType: 'mines' }, 0);
      
      // Add to history
      const newGame = {
        ...result,
        timestamp: Date.now()
      };
      
      setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
      
      setTimeout(() => {
        if (autoBetEnabledRef.current) {
          processAutoBetResult(result);
        }
      }, 3000);
      
    } else {
      // Found a diamond
      playSound('gem_found');
      const diamondsFound = newRevealedCells.length;
      const newMultiplier = calculateMultiplier(diamondsFound);
      setCurrentMultiplier(newMultiplier);
      calculateNextMultiplier(diamondsFound);
      
      // Check if all safe cells are revealed
      const safeCells = BOARD_SIZE - mineCount;
      if (diamondsFound >= safeCells) {
        // All diamonds found - maximum win
        const result = {
          won: true,
          allDiamondsFound: true,
          diamondsFound,
          multiplier: newMultiplier,
          payout: Math.floor(betAmount * newMultiplier),
          betAmount
        };
        
        setResult(result);
        setGameState('gameOver');
        updateGameStats(result);
        processGameResult({ gameType: 'mines' }, result.payout);
        playSound('win');
        
        // Add to history
        const newGame = {
          ...result,
          timestamp: Date.now()
        };
        
        setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
        
        setTimeout(() => {
          if (autoBetEnabledRef.current) {
            processAutoBetResult(result);
          }
        }, 3000);
      }
    }
  };

  // Cash out
  const cashOut = () => {
    if (gameState !== 'playing' || revealedCells.length === 0) return;
    
    const payout = Math.floor(betAmount * currentMultiplier);
    
    const result = {
      won: true,
      cashedOut: true,
      diamondsFound: revealedCells.length,
      multiplier: currentMultiplier,
      payout,
      betAmount
    };
    
    setResult(result);
    setGameState('gameOver');
    updateGameStats(result);
    processGameResult({ gameType: 'mines' }, payout);
    playSound('cash_out');
    
    // Add to history
    const newGame = {
      ...result,
      timestamp: Date.now()
    };
    
    setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
    
    setTimeout(() => {
      if (autoBetEnabledRef.current) {
        processAutoBetResult(result);
      }
    }, 3000);
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
        setGameState('betting');
        setResult(null);
        setTimeout(() => startGame(true), 500);
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
            startGame(true);
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

  const resetGame = () => {
    setGameState('betting');
    setResult(null);
    setBoard([]);
    setRevealedCells([]);
    setCurrentMultiplier(1.0);
    setNextMultiplier(1.35);
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
          <div style={{ fontSize: '3rem' }}>💣</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Mines
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Navigate the minefield! Find gems while avoiding bombs to multiply your winnings!
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

          {/* Mine Count */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
                marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
              }}>
              💣 Number of Mines
              </label>
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <input
                type="number"
                value={mineCount}
                onChange={(e) => setMineCount(Math.max(1, Math.min(24, parseInt(e.target.value) || 3)))}
                min="1"
                max="24"
                style={{
                  width: '100%',
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
          </div>

          {/* Current Multiplier Display */}
          {gameState === 'playing' && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Current Multiplier
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#22c55e' }}>
                {currentMultiplier.toFixed(2)}x
            </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                Payout: ₹{Math.floor(betAmount * currentMultiplier)}
              </div>
            </div>
          )}

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => startGame()}
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
              {isLoading ? '💣 Starting...' : '💣 Start Game'}
            </button>
      )}

      {gameState === 'playing' && (
              <button
                onClick={cashOut}
              disabled={revealedCells.length === 0}
                style={{ 
                width: '100%',
                background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                  border: 'none',
                color: 'white',
                padding: '1rem',
                  borderRadius: '12px',
                cursor: revealedCells.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                opacity: revealedCells.length === 0 ? 0.5 : 1,
                marginBottom: '1rem'
              }}
            >
              💰 Cash Out (₹{Math.floor(betAmount * currentMultiplier)})
              </button>
          )}

          {gameState === 'gameOver' && (
              <button
                onClick={resetGame}
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
              🔄 New Game
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
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of games:</label>
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
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>💎</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
                Ready to Play Mines?
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', maxWidth: '400px' }}>
                Find diamonds and avoid mines! Each diamond increases your multiplier. Cash out anytime to secure your winnings.
              </p>
        </div>
      )}

          {(gameState === 'playing' || gameState === 'gameOver') && (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              {/* Game Info */}
            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <span>💎 Diamonds: {revealedCells.filter(index => !board[index]?.isMine).length}</span>
                <span>💣 Mines: {mineCount}</span>
                {gameState === 'playing' && (
                  <span>🔮 Next: {nextMultiplier.toFixed(2)}x</span>
                )}
            </div>
            
              {/* Game Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => revealCell(index)}
                    disabled={gameState !== 'playing' || revealedCells.includes(index)}
                    style={{
                      width: '60px',
                      height: '60px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.5rem',
                      cursor: gameState === 'playing' && !revealedCells.includes(index) ? 'pointer' : 'default',
                      background: revealedCells.includes(index) 
                        ? (cell.isMine ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)')
                        : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${revealedCells.includes(index) 
                        ? (cell.isMine ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)')
                        : 'rgba(255, 255, 255, 0.2)'}`,
                      color: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {revealedCells.includes(index) ? (cell.isMine ? '💣' : '💎') : '?'}
                  </button>
                ))}
              </div>

              {/* Game Result */}
              {gameState === 'gameOver' && result && (
            <div style={{ 
                  marginTop: '2rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: `2px solid ${result.won ? '#22c55e' : '#ef4444'}`
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {result.won ? '🎉' : '💥'}
                  </div>
                  <h3 style={{
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                    color: result.won ? '#22c55e' : '#ef4444',
                    margin: '0 0 1rem 0'
                  }}>
                    {result.won ? `${result.multiplier.toFixed(2)}x WIN!` : 'Mine Hit!'}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 1rem 0' }}>
                    Found {result.diamondsFound} diamonds
                  </p>
                  {result.won && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem',
                      color: '#22c55e',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      Won: ₹{result.payout}
                    </div>
                  )}
                </div>
              )}
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
                        {game.diamondsFound}💎 {game.multiplier.toFixed(2)}x
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {game.won ? (game.cashedOut ? 'Cashed out' : 'All diamonds') : 'Hit mine'}
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
                      {bet.diamonds}💎 {bet.multiplier}
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
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 1.8)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>💣 How to Play Mines</h2>
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
                <li>Choose number of mines (1-24)</li>
                <li>Click tiles to reveal diamonds or mines</li>
                <li>Each diamond increases your multiplier</li>
                <li>Hit a mine and lose everything</li>
                <li>Cash out anytime to secure winnings</li>
              </ul>
              
              <p><strong>💰 How Multipliers Work:</strong></p>
              <ul>
                <li>More mines = higher potential multipliers</li>
                <li>Each diamond found increases payout</li>
                <li>Risk vs reward - more mines, more danger</li>
                <li>Maximum multiplier at 24 mines</li>
              </ul>

              <p><strong>🎮 Strategy Tips:</strong></p>
              <ul>
                <li>Start with fewer mines to learn</li>
                <li>Don't get greedy - cash out early</li>
                <li>Higher mine counts are for experts</li>
                <li>Every click is a risk</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mines; 