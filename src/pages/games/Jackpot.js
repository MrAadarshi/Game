import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const Jackpot = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('betting'); // betting, running, result
  const [jackpotPool, setJackpotPool] = useState(8750000); // Starting jackpot
  const [timeLeft, setTimeLeft] = useState(45);
  const [participants, setParticipants] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [winner, setWinner] = useState(null);

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
    { user: 'Arjun_K294', amount: 50, tickets: 5, chance: '12.5%', id: 1 },
    { user: 'Priya_S817', amount: 100, tickets: 10, chance: '25.0%', id: 2 },
    { user: 'Rahul_P453', amount: 75, tickets: 7, chance: '17.5%', id: 3 },
    { user: 'Ananya_M628', amount: 25, tickets: 2, chance: '5.0%', id: 4 },
    { user: 'Vikram_R935', amount: 150, tickets: 15, chance: '37.5%', id: 5 }
  ]);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'jackpot_spin':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5);
        break;
      case 'jackpot_win':
        const jackpotFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        jackpotFreqs.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
          gain.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.8);
          osc.start(audioContext.currentTime + index * 0.1);
          osc.stop(audioContext.currentTime + index * 0.1 + 0.8);
        });
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
    const tickets = Math.floor(amount / 10);
    const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0) + tickets;
    const chance = totalTickets > 0 ? ((tickets / totalTickets) * 100).toFixed(1) : '0.0';
    
    return {
      user: userName,
      amount,
      tickets,
      chance: `${chance}%`,
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

  // Jackpot timer
  useEffect(() => {
    if (gameState === 'betting' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'betting') {
      runJackpot();
    }
  }, [timeLeft, gameState]);

  // Increase jackpot pool
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpotPool(prev => prev + Math.floor(Math.random() * 1000) + 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Game logic
  const joinJackpot = async (isAutomatic = false) => {
    if (gameState !== 'betting' || betAmount < 10 || betAmount > walletBalance) return;
    
    setIsLoading(true);
    
    try {
      const gameResult = await placeBet(betAmount, 'jackpot');
      
      // Add user to participants
      const tickets = Math.floor(betAmount / 10); // 1 ticket per ₹10
      const newParticipant = {
        user: 'You',
        amount: betAmount,
        tickets,
        id: Date.now()
      };
      
      setParticipants(prev => [...prev, newParticipant]);
      setJackpotPool(prev => prev + betAmount * 0.8); // 80% goes to pool
      
      playSound('join');
      
    } catch (error) {
      console.error('Bet failed:', error);
    }
    
    setIsLoading(false);
  };

  const runJackpot = async () => {
    setGameState('running');
    playSound('spin');
    
    // Simulate drawing
    setTimeout(() => {
      const allParticipants = [...participants, ...liveBets];
      if (allParticipants.length === 0) {
        // Reset if no participants
        setTimeLeft(45);
        setGameState('betting');
        return;
      }
      
      // Calculate total tickets
      const totalTickets = allParticipants.reduce((sum, p) => sum + p.tickets, 0);
      
      // Random winner selection
      const winningTicket = Math.floor(Math.random() * totalTickets);
      let ticketCount = 0;
      let winner = null;
      
      for (const participant of allParticipants) {
        ticketCount += participant.tickets;
        if (winningTicket < ticketCount) {
          winner = participant;
          break;
        }
      }
      
      const isUserWinner = winner && winner.user === 'You';
      const winAmount = isUserWinner ? jackpotPool : 0;
      
      const result = {
        won: isUserWinner,
        winner: winner?.user || 'Unknown',
        winAmount,
        jackpotPool,
        totalParticipants: allParticipants.length,
        userTickets: participants.reduce((sum, p) => sum + (p.user === 'You' ? p.tickets : 0), 0),
        totalTickets
      };
      
      setResult(result);
      setWinner(winner);
      setGameState('result');
      updateGameStats(result);
      
      if (isUserWinner) {
        playSound('jackpot');
        processGameResult({ gameType: 'jackpot' }, winAmount);
      } else {
        playSound('lose');
        processGameResult({ gameType: 'jackpot' }, 0);
      }
      
      // Add to history
      const newGame = {
        ...result,
        timestamp: Date.now()
      };
      
      setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
      
      setTimeout(() => {
        // Reset for next round
        setGameState('betting');
        setTimeLeft(45);
        setParticipants([]);
        setJackpotPool(prev => prev * 0.1 + 1000000); // Keep 10% + base amount
        setResult(null);
        setWinner(null);
        
        if (autoBetEnabledRef.current) {
          processAutoBetResult(result);
        }
      }, 5000);
      
    }, 3000);
  };

  // Auto-bet logic with reliable counter
  const processAutoBetResult = (gameResult) => {
    currentBetCountRef.current += 1;
    const newCurrentBet = currentBetCountRef.current;
    setDisplayBetCount(newCurrentBet);
    
    console.log(`Auto-bet: Completed bet ${newCurrentBet}/${autoBetConfig.numberOfBets}`);
    
    // Check stop conditions
    if (autoBetConfig.stopOnWin && gameResult.won && gameResult.winAmount >= autoBetConfig.winAmount) {
      console.log('Auto-bet stopped: Win target reached');
      setAutoBetConfig(prev => ({ ...prev, enabled: false }));
      autoBetEnabledRef.current = false;
      currentBetCountRef.current = 0;
      setDisplayBetCount(0);
      return;
    }
    
    if (autoBetConfig.stopOnLoss && !gameResult.won && betAmount >= autoBetConfig.lossAmount) {
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
    
    // Continue auto-betting for next round
    console.log(`Auto-bet: Will join next jackpot round`);
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
    }
  };

  const updateGameStats = (gameResult) => {
    setGameStats(prev => {
      const newStats = { ...prev };
      newStats.totalGames += 1;
      
      if (gameResult.won) {
        newStats.totalWins += 1;
        newStats.totalWinAmount += gameResult.winAmount;
        newStats.biggestWin = Math.max(newStats.biggestWin, gameResult.winAmount);
        newStats.currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1;
      } else {
        newStats.totalLosses += 1;
        newStats.totalLossAmount += betAmount;
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Jackpot
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Progressive jackpot slots! Spin to win the growing prize pool!
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
            💰 Place Your Bet
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

          {/* Tickets Info */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              You'll Get
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700' }}>
              {Math.floor(betAmount / 10)} Tickets
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
              1 ticket per ₹10
              </div>
            </div>

          {/* Main Action Button */}
          {gameState === 'betting' && (
            <button
              onClick={() => joinJackpot()}
              disabled={isLoading || betAmount < 10 || betAmount > walletBalance}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
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
              {isLoading ? '🎫 Joining...' : '🎫 Join Jackpot'}
            </button>
          )}

          {gameState !== 'betting' && (
            <button
              disabled
              style={{
                width: '100%',
                background: 'rgba(156, 163, 175, 0.3)',
                border: '1px solid rgba(156, 163, 175, 0.5)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'not-allowed',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                opacity: 0.5
              }}
            >
              {gameState === 'running' ? '🎰 Drawing...' : '⏳ Next Round'}
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
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of rounds:</label>
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
          {/* Jackpot Pool Display */}
          <div style={{
          textAlign: 'center',
            marginBottom: '2rem'
        }}>
            <div style={{
              fontSize: '4rem',
            marginBottom: '1rem',
              animation: gameState === 'running' ? 'goldGlow 1s infinite alternate' : 'none'
            }}>
              🏆
            </div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              margin: 0,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ₹{formatNumber(jackpotPool)}
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0.5rem 0 0 0'
            }}>
              Current Jackpot Pool
            </p>
          </div>

          {/* Timer and Status */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            minWidth: '300px'
          }}>
            {gameState === 'betting' && (
              <>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: timeLeft <= 10 ? '#ef4444' : '#22c55e',
                  marginBottom: '0.5rem'
                }}>
                  {formatTime(timeLeft)}
                </div>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Time until draw
                </p>
              </>
            )}

            {gameState === 'running' && (
              <>
          <div style={{ 
            fontSize: '1.5rem', 
                  color: '#f59e0b',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  🎰 Drawing Winner...
                </div>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0
                }}>
                  Selecting random ticket
                </p>
              </>
            )}

            {gameState === 'result' && result && (
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
            marginBottom: '1rem'
          }}>
                  {result.won ? '🎊' : '😔'}
                </div>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: result.won ? '#22c55e' : '#ef4444',
                  margin: '0 0 1rem 0'
                }}>
                  {result.won ? 'JACKPOT WON!' : 'Better Luck Next Time!'}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  margin: '0 0 1rem 0'
                }}>
                  Winner: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
                    {result.winner}
                  </span>
                </p>
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
                    Won: ₹{formatNumber(result.winAmount)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participants Count */}
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {participants.length + liveBets.length} Participants • {' '}
              {participants.reduce((sum, p) => sum + p.tickets, 0) + liveBets.reduce((sum, p) => sum + p.tickets, 0)} Total Tickets
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
          
        {/* Game Statistics */}
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
            📊 Statistics
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={clearResults}
                style={{
                  background: 'var(--accent-red)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.3rem 0.8rem',
                  color: 'white',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </h3>
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
                <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Rounds</div>
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
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📋 Recent Rounds</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {gameHistory.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  padding: '2rem',
                  fontSize: '0.9rem'
                }}>
                  No rounds played yet
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
                        {game.won ? 'Jackpot Won!' : 'No Win'}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {game.userTickets} tickets
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      color: game.won ? '#22c55e' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {game.won ? `+₹${formatNumber(game.winAmount)}` : `-₹${betAmount}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Participants */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>🎫 Live Participants</h3>
            
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
                      {bet.tickets} tickets
                    </div>
                  </div>
                  <div style={{ 
                    color: '#f59e0b',
                    fontWeight: 'bold'
                  }}>
                    {bet.chance}
                  </div>
                </div>
                          ))}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🏆 How to Play Jackpot</h2>
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
                <li>Join the jackpot round with your bet</li>
                <li>Get 1 ticket for every ₹10 you bet</li>
                <li>Wait for the timer to reach zero</li>
                <li>Random ticket wins the entire jackpot</li>
                <li>More tickets = higher chance to win</li>
              </ul>
              
              <p><strong>💰 How It Works:</strong></p>
              <ul>
                <li>80% of all bets go to the jackpot pool</li>
                <li>Winner takes the entire pool</li>
                <li>New round starts immediately</li>
                <li>Base jackpot always starts at ₹1,000,000</li>
              </ul>

              <p><strong>🎮 Tips:</strong></p>
              <ul>
                <li>Bigger bets give you more tickets</li>
                <li>Join early for better position</li>
                <li>Watch other participants' chances</li>
                <li>Use auto-bet to join multiple rounds</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes goldGlow {
          0% { filter: drop-shadow(0 0 5px #ffd700); }
          100% { filter: drop-shadow(0 0 20px #ffd700); }
        }
      `}</style>
    </div>
  );
};

export default Jackpot; 