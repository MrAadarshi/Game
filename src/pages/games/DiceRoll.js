import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const DiceRoll = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [prediction, setPrediction] = useState('higher');
  const [gameState, setGameState] = useState('betting'); // betting, rolling, result
  const [result, setResult] = useState(null);
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

  // Live bets feed
  const [liveBets, setLiveBets] = useState([
    { user: 'Arjun_K294', amount: 50, multiplier: 6.0, win: 300, id: 1 },
    { user: 'Priya_S817', amount: 75, multiplier: 2.0, win: 150, id: 2 },
    { user: 'Rahul_P453', amount: 100, multiplier: 3.0, win: 300, id: 3 },
    { user: 'Ananya_M628', amount: 40, multiplier: 6.0, win: 240, id: 4 },
    { user: 'Vikram_R935', amount: 150, multiplier: 2.0, win: 300, id: 5 }
  ]);

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
      case 'dice_roll':
        // Realistic dice rolling sound - tumbling with surface friction
        const rollDuration = 1.5;
        const bounceCount = 12;
        
        // Create rolling/tumbling sound using noise
        const bufferSize = audioContext.sampleRate * rollDuration;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Generate filtered noise for rolling surface friction
        for (let i = 0; i < bufferSize; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3;
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const rollFilter = audioContext.createBiquadFilter();
        rollFilter.type = 'bandpass';
        rollFilter.frequency.setValueAtTime(150, audioContext.currentTime);
        rollFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + rollDuration);
        rollFilter.Q.setValueAtTime(2, audioContext.currentTime);
        
        const rollGain = audioContext.createGain();
        rollGain.gain.setValueAtTime(0.15, audioContext.currentTime);
        rollGain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + rollDuration);
        
        noiseSource.connect(rollFilter);
        rollFilter.connect(rollGain);
        rollGain.connect(audioContext.destination);
        
        noiseSource.start(audioContext.currentTime);
        noiseSource.stop(audioContext.currentTime + rollDuration);
        
        // Add individual dice bounce impacts
        for (let i = 0; i < bounceCount; i++) {
          const delay = (i / bounceCount) * rollDuration;
          const intensity = 1 - (i / bounceCount); // Decreasing intensity
          
          setTimeout(() => {
            // Each bounce creates multiple frequency components (dice corners hitting)
            const bounceFreqs = [180, 220, 280, 350]; // Different corners/edges
            
            bounceFreqs.forEach((freq, idx) => {
              const bounceOsc = audioContext.createOscillator();
              const bounceGain = audioContext.createGain();
              const bounceFilter = audioContext.createBiquadFilter();
              
              bounceOsc.type = 'square';
              bounceOsc.frequency.setValueAtTime(freq + Math.random() * 50, audioContext.currentTime);
              bounceOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, audioContext.currentTime + 0.08);
              
              bounceFilter.type = 'lowpass';
              bounceFilter.frequency.setValueAtTime(800, audioContext.currentTime);
              
              const amplitude = 0.08 * intensity / (idx + 1);
              bounceGain.gain.setValueAtTime(amplitude, audioContext.currentTime);
              bounceGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
              
              bounceOsc.connect(bounceFilter);
              bounceFilter.connect(bounceGain);
              bounceGain.connect(audioContext.destination);
              
              bounceOsc.start(audioContext.currentTime);
              bounceOsc.stop(audioContext.currentTime + 0.1);
            });
          }, delay * 1000);
        }
        
        return; // Don't execute the default oscillator code
        break;
        
      case 'dice_land':
        // Realistic dice landing sound - final impact with settling
        
        // Main impact sound (dice hitting surface)
        const impactOsc = audioContext.createOscillator();
        const impactGain = audioContext.createGain();
        const impactFilter = audioContext.createBiquadFilter();
        
        impactOsc.type = 'square';
        impactOsc.frequency.setValueAtTime(120, audioContext.currentTime);
        impactOsc.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.15);
        
        impactFilter.type = 'lowpass';
        impactFilter.frequency.setValueAtTime(400, audioContext.currentTime);
        
        impactGain.gain.setValueAtTime(0.25, audioContext.currentTime);
        impactGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        impactOsc.connect(impactFilter);
        impactFilter.connect(impactGain);
        impactGain.connect(audioContext.destination);
        
        impactOsc.start(audioContext.currentTime);
        impactOsc.stop(audioContext.currentTime + 0.15);
        
        // Add small settling bounces
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const settleOsc = audioContext.createOscillator();
            const settleGain = audioContext.createGain();
            
            settleOsc.type = 'triangle';
            settleOsc.frequency.setValueAtTime(200 + i * 30, audioContext.currentTime);
            settleOsc.frequency.exponentialRampToValueAtTime(100 + i * 15, audioContext.currentTime + 0.08);
            
            const amplitude = 0.1 / (i + 1);
            settleGain.gain.setValueAtTime(amplitude, audioContext.currentTime);
            settleGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
            
            settleOsc.connect(settleGain);
            settleGain.connect(audioContext.destination);
            
            settleOsc.start(audioContext.currentTime);
            settleOsc.stop(audioContext.currentTime + 0.08);
          }, (i + 1) * 100);
        }
        
        return;
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
      // A-E
      'Aarav', 'Aayan', 'Abhay', 'Aditya', 'Advait', 'Ahaan', 'Akash', 'Aman', 'Amit', 'Aniket', 'Ansh', 'Arjun', 'Aryan', 'Ashwin', 'Atharv', 'Avinash', 'Ayush', 'Azan', 'Azeem',
      'Bhavesh', 'Bharat', 'Bhanu', 'Bhargav', 'Bhuvan', 'Bilal', 'Bimal', 'Bhuvesh', 'Badrinath', 'Baleshwar',
      'Chaitanya', 'Chirag', 'Chetan', 'Charan', 'Chandresh', 'Chandan', 'Chiranjeev', 'Chinmay', 'Chintan', 'Chaitra',
      'Darshan', 'Deepak', 'Dev', 'Dhananjay', 'Dhruv', 'Dinesh', 'Dipesh', 'Divyansh', 'Danish', 'Dayanand',
      'Eshan', 'Ekansh', 'Eklavya', 'Eshwar', 'Eshaan', 'Elvin', 'Edwin', 'Ebrahim', 'Eshanveer', 'Eshanth',
      
      // F-J
      'Faizan', 'Farhan', 'Faisal', 'Fardeen', 'Firoz', 'Faiyaz', 'Fanish', 'Fanishwar', 'Fanishkumar', 'Fanishdeep',
      'Gaurav', 'Gopal', 'Gautam', 'Ganesh', 'Girish', 'Govind', 'Gagan', 'Gauransh', 'Gitesh', 'Gokul',
      'Harsh', 'Harshit', 'Hitesh', 'Himanshu', 'Hrithik', 'Harshad', 'Hemanth', 'Harendra', 'Himmat', 'Hiranmay',
      'Ishaan', 'Imran', 'Irfan', 'Ishanveer', 'Indrajit', 'Iqbal', 'Ishan', 'Inder', 'Ilesh', 'Ivaan',
      'Jay', 'Jatin', 'Jitesh', 'Jai', 'Jignesh', 'Jitendra', 'Janak', 'Jayanth', 'Jaskaran', 'Jashan',
      
      // K-O
      'Karan', 'Krish', 'Kunal', 'Keshav', 'Kartik', 'Kabir', 'Kushal', 'Kavin', 'Kshitij', 'Kiran',
      'Lakshya', 'Lalit', 'Luv', 'Lokesh', 'Laxman', 'Laxmikant', 'Lingaraj', 'Lavesh', 'Lankesh', 'Lajpat',
      'Manish', 'Mayank', 'Mohit', 'Mukesh', 'Madhav', 'Mahesh', 'Mudit', 'Manav', 'Maan', 'Moin',
      'Nikhil', 'Nishant', 'Neeraj', 'Nitin', 'Nilesh', 'Namit', 'Nandan', 'Nirav', 'Naitik', 'Nabeel',
      'Om', 'Omkar', 'Onkar', 'Ojas', 'Ojaswin', 'Oshin', 'Ovais', 'Ojasdeep', 'Omveer', 'Ojasraj',
      
      // P-T
      'Pranav', 'Pratik', 'Piyush', 'Parth', 'Prashant', 'Prem', 'Pushkar', 'Pradeep', 'Pranesh', 'Pradyumna',
      'Qasim', 'Qadir', 'Quamar', 'Qudrat', 'Qurban', 'Qavi', 'Qaiser', 'Qutub', 'Qamar', 'Qayum',
      'Rohan', 'Rahul', 'Raj', 'Rishabh', 'Ritesh', 'Rohit', 'Raghav', 'Ranveer', 'Ranjit', 'Ramesh',
      'Siddharth', 'Sahil', 'Saurabh', 'Sandeep', 'Shubham', 'Shaurya', 'Sameer', 'Sumit', 'Suraj', 'Satyam',
      'Tushar', 'Tarun', 'Tanmay', 'Tejas', 'Taran', 'Tanuj', 'Trilok', 'Tapan', 'Tirth', 'Tanish',
      
      // U-Z
      'Uday', 'Utkarsh', 'Ujjwal', 'Umesh', 'Utsav', 'Udit', 'Umanath', 'Uvaish', 'Ubaid', 'Uvesh',
      'Varun', 'Vikram', 'Vikas', 'Vijay', 'Vishal', 'Vivek', 'Vasant', 'Veer', 'Vinit', 'Vimal',
      'Wasim', 'Waseem', 'Wali', 'Waman', 'Wajid', 'Wazir', 'Wajahat', 'Waleed', 'Waqas', 'Wazih',
      'Yash', 'Yuvraj', 'Yogesh', 'Yatin', 'Yashwant', 'Yagnesh', 'Yashdeep', 'Yashpal', 'Yudhveer', 'Yuvan',
      'Zaid', 'Zain', 'Zubair', 'Zaki', 'Zameer', 'Zohair', 'Zarar', 'Zayan', 'Zafar', 'Zishan'
    ];
    
    const amounts = [10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250];
    const multipliers = [2.0, 3.0, 6.0]; // Common dice multipliers
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const userName = indianNames[Math.floor(Math.random() * indianNames.length)];
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    const uniqueName = `${userName}_${randomSuffix}`;
    
    return {
      user: uniqueName,
      amount,
      multiplier,
      win: amount * multiplier,
      id: Date.now() + Math.random()
    };
  };

  // Auto-update live bets
  useEffect(() => {
      const interval = setInterval(() => {
      setLiveBets(prevBets => {
        const newBet = generateRandomBet();
        return [newBet, ...prevBets.slice(0, 7)];
      });
    }, Math.random() * 3000 + 2000);
      
      return () => clearInterval(interval);
  }, []);

  // Load game data on mount
  useEffect(() => {
    const stored = localStorage.getItem('diceroll_results');
    const storedStats = localStorage.getItem('diceroll_stats');
    
    if (stored) setGameResults(JSON.parse(stored));
    if (storedStats) setGameStats(JSON.parse(storedStats));
  }, []);

  // Save game results
  useEffect(() => {
    if (gameResults.length > 0) {
      localStorage.setItem('diceroll_results', JSON.stringify(gameResults.slice(-50)));
    }
  }, [gameResults]);

  // Save game stats
  useEffect(() => {
    localStorage.setItem('diceroll_stats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Game logic
  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const getMultiplier = (pred, roll) => {
    if (pred === 'exact' && (roll === 1 || roll === 6)) {
      return 6.0; // 6x for rolling 1 or 6
    } else if (pred === 'higher' && roll >= 4) {
      return 2.0; // 2x for rolling 4, 5, or 6
    } else if (pred === 'lower' && roll <= 3) {
      return 2.0; // 2x for rolling 1, 2, or 3
    } else if (pred === 'middle' && (roll === 3 || roll === 4)) {
      return 3.0; // 3x for rolling 3 or 4
    }
    return 0;
  };

  const getPredictionText = (pred) => {
    switch (pred) {
      case 'higher': return 'Higher (4-6)';
      case 'lower': return 'Lower (1-3)';
      case 'middle': return 'Middle (3-4)';
      case 'exact': return 'Extreme (1 or 6)';
      default: return pred;
    }
  };

  const handleBet = async (isAutomatic = false) => {
    if (betAmount < 10 || betAmount > 1000) return;
    if (betAmount > (walletBalance || 0)) {
      if (isAutomatic) stopAutoBet();
      return;
    }

    setIsLoading(true);
    playSound('button'); // Changed from 'bet_placed' to 'button'

    try {
      await placeBet(betAmount, 'dice-roll', 'Dice Roll');
      setGameState('rolling');
      
      // Simulate rolling animation
      setTimeout(() => {
        const diceResult = rollDice();
        const multiplier = getMultiplier(prediction, diceResult);
        const isWin = multiplier > 0;
        const winAmount = isWin ? betAmount * multiplier : 0;
        
        // Update game result
        const gameResult = {
          isWin,
          prediction,
          diceResult,
          multiplier,
          betAmount,
          winAmount,
          timestamp: new Date()
        };

        setResult(gameResult);
        setGameResults(prev => [...prev, gameResult]);
        
        // Update statistics
        updateGameStats(gameResult);
        
        // Process with auth context
          processGameResult(betAmount, multiplier, 'dice-roll', 'Dice Roll', isWin);
          
        setGameState('result');
        playSound(isWin ? 'win' : 'lose');

        // Auto-reset after 3 seconds
        setTimeout(() => {
          resetGame();
          if (isAutoBetting) {
            processAutoBetResult(gameResult);
          }
        }, 3000);
      }, 2000); // 2 second rolling animation
      
    } catch (error) {
      console.error('Error placing bet:', error);
      if (isAutomatic) stopAutoBet();
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameStats = (gameResult) => {
    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: gameResult.isWin ? prev.wins + 1 : prev.wins,
        losses: !gameResult.isWin ? prev.losses + 1 : prev.losses,
        totalWagered: prev.totalWagered + gameResult.betAmount,
        totalWon: prev.totalWon + gameResult.winAmount,
        netProfit: prev.netProfit + (gameResult.winAmount - gameResult.betAmount),
        currentStreak: gameResult.isWin ? prev.currentStreak + 1 : 0,
        bestStreak: gameResult.isWin ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak
      };
      return newStats;
    });
  };

  const resetGame = () => {
    setGameState('betting');
    setResult(null);
  };

  // Auto Bet Functions
  const startAutoBet = () => {
    if (betAmount > (walletBalance || 0)) return;

    baseBetAmountRef.current = betAmount;
    currentBetCountRef.current = 0;
    setIsAutoBetting(true);
    setAutoBetStats({
      currentBet: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      totalWagered: 0,
      totalProfit: 0,
      isRunning: true
    });
    
    executeAutoBet();
  };

  const stopAutoBet = () => {
    setIsAutoBetting(false);
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
  };

  const executeAutoBet = async () => {
    if (!isAutoBetting || gameState !== 'betting') return;

    try {
      await handleBet(true);
    } catch (error) {
      console.error('Auto bet error:', error);
      stopAutoBet();
    }
  };

  const processAutoBetResult = (gameResult) => {
    if (!isAutoBetting) return;

    currentBetCountRef.current += 1;
    const currentBetNumber = currentBetCountRef.current;
    const targetBets = autoBetConfig.numberOfBets;

    setAutoBetStats(prev => ({
      ...prev,
      currentBet: currentBetNumber,
      totalBets: prev.totalBets + 1,
      wins: gameResult.isWin ? prev.wins + 1 : prev.wins,
      losses: !gameResult.isWin ? prev.losses + 1 : prev.losses,
      totalWagered: prev.totalWagered + gameResult.betAmount,
      totalProfit: prev.totalProfit + (gameResult.winAmount - gameResult.betAmount)
    }));

    // Check stop conditions
    if (autoBetConfig.stopOnWin && gameResult.isWin && gameResult.winAmount >= autoBetConfig.winAmount) {
      setTimeout(() => stopAutoBet(), 100);
      return;
    }

    if (autoBetConfig.stopOnLoss && !gameResult.isWin) {
      setTimeout(() => stopAutoBet(), 100);
      return;
    }

    if (currentBetNumber >= targetBets) {
      setTimeout(() => stopAutoBet(), 100);
      return;
    }

    // Schedule next bet
    setTimeout(() => {
      if (!isAutoBetting) return;
      
      let newBetAmount = betAmount;
      
      if (gameResult.isWin && autoBetConfig.increaseOnWin) {
        newBetAmount = Math.min(1000, betAmount * (1 + autoBetConfig.winIncreasePercent / 100));
      } else if (!gameResult.isWin && autoBetConfig.increaseOnLoss) {
        newBetAmount = Math.min(1000, betAmount * (1 + autoBetConfig.lossIncreasePercent / 100));
      }

      if (gameResult.isWin && autoBetConfig.resetOnWin) {
        newBetAmount = baseBetAmountRef.current;
      } else if (!gameResult.isWin && autoBetConfig.resetOnLoss) {
        newBetAmount = baseBetAmountRef.current;
      }

      setBetAmount(Math.round(newBetAmount));

      autoBetTimeoutRef.current = setTimeout(() => {
        if (isAutoBetting && gameState === 'betting') {
          executeAutoBet();
        }
      }, 2500);
    }, 100);
  };

  // Helper functions
  const quickBetAmount = (amount) => {
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

  const getDiceEmoji = (num) => {
    const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[num] || '🎲';
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
          <div style={{ fontSize: '3rem' }}>🎲</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Dice Roll
          </h1>
      </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Predict where the dice will land! Multiple ways to win with different odds.
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
            💰 Place Your Bet
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
              onClick={() => {
                if (autoBetStats.isRunning) return;
                setIsAutoBetting(false);
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                background: !isAutoBetting ? 'var(--accent-green)' : 'transparent',
                color: !isAutoBetting ? '#000' : 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: autoBetStats.isRunning ? 0.6 : 1
              }}
            >
              Manual
            </button>
            <button
              onClick={() => {
                if (autoBetStats.isRunning) return;
                setIsAutoBetting(true);
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: 'none',
                background: isAutoBetting ? 'var(--accent-green)' : 'transparent',
                color: isAutoBetting ? '#000' : 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: autoBetStats.isRunning ? 0.6 : 1
              }}
            >
              Auto
            </button>
          </div>

          {/* Prediction Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '0.8rem',
              display: 'block',
              fontWeight: '600'
            }}>
              Your Prediction
              </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              {[
                { value: 'higher', label: 'Higher (4-6)', multiplier: '2x', icon: '⬆️' },
                { value: 'lower', label: 'Lower (1-3)', multiplier: '2x', icon: '⬇️' }
              ].map(option => (
                  <button
                  key={option.value}
                  onClick={() => setPrediction(option.value)}
                  disabled={autoBetStats.isRunning}
                    style={{ 
                    padding: '0.8rem',
                    background: prediction === option.value ? 'var(--accent-green)' : 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: prediction === option.value ? '#000' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                    textAlign: 'center',
                    opacity: autoBetStats.isRunning ? 0.6 : 1
                    }}
                  >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{option.icon}</div>
                  <div>{option.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{option.multiplier}</div>
                  </button>
                ))}
              </div>
              
              <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              {[
                { value: 'middle', label: 'Middle (3-4)', multiplier: '3x', icon: '🎯' },
                { value: 'exact', label: 'Extreme (1,6)', multiplier: '6x', icon: '🎲' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setPrediction(option.value)}
                  disabled={autoBetStats.isRunning}
                  style={{
                    padding: '0.8rem',
                    background: prediction === option.value ? 'var(--accent-green)' : 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: prediction === option.value ? '#000' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    opacity: autoBetStats.isRunning ? 0.6 : 1
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{option.icon}</div>
                  <div>{option.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{option.multiplier}</div>
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
            
            {/* Quick Bet Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => quickBetAmount(amount)}
                  disabled={autoBetStats.isRunning}
                  style={{
                    padding: '0.6rem',
                    background: betAmount === amount ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: betAmount === amount ? '#000' : 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: betAmount === amount ? '700' : '600',
                    cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: autoBetStats.isRunning ? 0.6 : 1
                  }}
                >
                  ₹{amount}
                </button>
              ))}
              </div>

            {/* Custom Amount Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                disabled={autoBetStats.isRunning}
                style={{
                  padding: '0.8rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: autoBetStats.isRunning ? 0.6 : 1
                }}
              >
                ½
              </button>
              
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(1000, Number(e.target.value))))}
                disabled={autoBetStats.isRunning}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  opacity: autoBetStats.isRunning ? 0.6 : 1
                }}
                min="10"
                max="1000"
              />
              
              <button
                onClick={() => setBetAmount(Math.min(1000, betAmount * 2))}
                disabled={autoBetStats.isRunning}
                style={{
                  padding: '0.8rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: autoBetStats.isRunning ? 0.6 : 1
                }}
              >
                2×
              </button>
            </div>
          </div>

          {/* Auto Bet Configuration */}
          {isAutoBetting && (
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
                  padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontSize: '1rem' }}>
                Auto Bet Settings
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
                    numberOfBets: Math.max(1, Number(e.target.value))
                  }))}
                  disabled={autoBetStats.isRunning}
                  style={{
                  width: '100%',
                    padding: '0.6rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    opacity: autoBetStats.isRunning ? 0.6 : 1
                  }}
                  min="1"
                  max="1000"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={autoBetConfig.stopOnWin}
                    onChange={(e) => setAutoBetConfig(prev => ({
                      ...prev,
                      stopOnWin: e.target.checked
                    }))}
                    disabled={autoBetStats.isRunning}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Stop on Win
                </label>
                <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={autoBetConfig.stopOnLoss}
                    onChange={(e) => setAutoBetConfig(prev => ({
                      ...prev,
                      stopOnLoss: e.target.checked
                    }))}
                    disabled={autoBetStats.isRunning}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Stop on Loss
                </label>
              </div>
            </div>
          )}

          {/* Auto Bet Stats */}
          {(autoBetStats.isRunning || autoBetStats.totalBets > 0) && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                color: autoBetStats.isRunning ? 'var(--accent-green)' : 'var(--primary-gold)',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {autoBetStats.isRunning ? '🔄 Auto Betting...' : '✅ Auto Bet Complete'}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Bets</div>
                  <div style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                    {autoBetStats.currentBet}/{autoBetConfig.numberOfBets}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Win Rate</div>
                  <div style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                    {autoBetStats.totalBets > 0 ? ((autoBetStats.wins / autoBetStats.totalBets) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Profit</div>
                  <div style={{
                    color: autoBetStats.totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontWeight: '600'
                  }}>
                    {formatNumber(autoBetStats.totalProfit)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                {autoBetStats.isRunning ? (
                  <button
                    onClick={stopAutoBet}
                    style={{ 
                      padding: '0.6rem 1.5rem',
                      background: 'var(--accent-red)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ⏹️ Stop Auto Bet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAutoBetStats({ currentBet: 0, totalBets: 0, wins: 0, losses: 0, totalWagered: 0, totalProfit: 0, isRunning: false });
                      setIsAutoBetting(false);
                      currentBetCountRef.current = 0;
                      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
                    }}
                    style={{
                      padding: '0.6rem 1.5rem',
                      background: 'var(--primary-gold)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🗑️ Clear Results
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Game Button */}
            <button
            onClick={() => isAutoBetting ? startAutoBet() : handleBet()}
            disabled={isLoading || autoBetStats.isRunning || gameState !== 'betting'}
              style={{
              width: '100%',
              padding: '1.2rem',
              background: (isLoading || autoBetStats.isRunning || gameState !== 'betting') ? 'var(--glass-bg)' : 
                         'linear-gradient(135deg, var(--accent-green), #00CC70)',
                border: 'none',
              borderRadius: '12px',
              color: (isLoading || autoBetStats.isRunning || gameState !== 'betting') ? 'var(--text-secondary)' : '#000',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: (isLoading || autoBetStats.isRunning || gameState !== 'betting') ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              opacity: (isLoading || autoBetStats.isRunning || gameState !== 'betting') ? 0.6 : 1,
              boxShadow: (isLoading || autoBetStats.isRunning || gameState !== 'betting') ? 'none' : '0 4px 15px rgba(0, 255, 136, 0.3)'
            }}
          >
            {isLoading ? '🎲 Rolling Dice...' :
             autoBetStats.isRunning ? `🔄 Auto Betting (${autoBetStats.currentBet}/${autoBetConfig.numberOfBets})` :
             gameState !== 'betting' ? '🎲 Rolling...' :
             isAutoBetting ? `🤖 Start Auto Bet ₹${betAmount}` :
             `🎲 Roll Dice ₹${betAmount}`}
            </button>
          </div>

        {/* Game Display Area */}
        <div className="game-area" style={{ textAlign: 'center' }}>
          <h3 style={{
            color: 'var(--primary-gold)',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            fontWeight: '700'
          }}>
            🎲 Dice Arena
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            {gameState === 'betting' && (
              <div>
                <div style={{
                  fontSize: '6rem',
                  marginBottom: '2rem',
                  filter: 'drop-shadow(0 10px 20px rgba(255, 215, 0, 0.3))'
                }}>
                  🎲
                </div>
                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
                  Ready to Roll!
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Select your prediction: {getPredictionText(prediction)}
                </p>
        </div>
      )}

            {gameState === 'rolling' && (
              <div>
      <div style={{ 
                  fontSize: '6rem',
                  marginBottom: '2rem',
                  animation: 'diceRoll 0.5s infinite',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 255, 136, 0.5))'
                }}>
                  🎲
                </div>
                <h3 style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>
                  Rolling...
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Predicting: {getPredictionText(prediction)}
                </p>
              </div>
            )}

            {gameState === 'result' && result && (
              <div>
        <div style={{
                  fontSize: '8rem',
                  marginBottom: '2rem',
                  filter: `drop-shadow(0 10px 20px ${result.isWin ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 76, 76, 0.5)'})`
                }}>
                  {getDiceEmoji(result.diceResult)}
                </div>
                
                <div style={{
                  background: result.isWin ? 
                    'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))' :
                    'linear-gradient(135deg, rgba(255, 76, 76, 0.2), rgba(255, 76, 76, 0.1))',
                  border: `2px solid ${result.isWin ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  margin: '1rem 0'
                }}>
                  <h3 style={{
                    color: result.isWin ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    {result.isWin ? '🎉 You Win!' : '😞 You Lose!'}
                  </h3>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Rolled: <strong style={{ color: 'var(--text-primary)' }}>
                      {result.diceResult}
                    </strong>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Your prediction: <strong>{getPredictionText(result.prediction)}</strong>
                  </div>
                  
                  {result.isWin && (
                    <div style={{
                      color: 'var(--accent-green)',
                      fontSize: '1.3rem',
                      fontWeight: '700'
                    }}>
                      +{formatNumber(result.winAmount)} ({result.multiplier}x)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics & History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
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
            📊 Your Statistics
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Total Games
              </div>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: '700' }}>
                {gameStats.totalGames}
              </div>
            </div>

            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Win Rate
              </div>
              <div style={{ color: 'var(--accent-green)', fontSize: '1.5rem', fontWeight: '700' }}>
                {getWinRate()}%
              </div>
            </div>

            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Best Streak
              </div>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: '700' }}>
                {gameStats.bestStreak}
              </div>
            </div>

            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Net Profit
              </div>
              <div style={{
                color: gameStats.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                {formatNumber(gameStats.netProfit)}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Wins:</span>
                <span style={{ color: 'var(--accent-green)', marginLeft: '0.5rem', fontWeight: '600' }}>
                  {gameStats.wins}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Losses:</span>
                <span style={{ color: 'var(--accent-red)', marginLeft: '0.5rem', fontWeight: '600' }}>
                  {gameStats.losses}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Current Streak:</span>
                <span style={{ color: 'var(--primary-gold)', marginLeft: '0.5rem', fontWeight: '600' }}>
                  {gameStats.currentStreak}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Total Wagered:</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem', fontWeight: '600' }}>
                  {formatNumber(gameStats.totalWagered)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
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
            📝 Recent Games
          </h3>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {gameResults.slice(-10).reverse().map((game, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                  justifyContent: 'space-between',
                alignItems: 'center',
                  padding: '0.8rem',
                  background: game.isWin ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 76, 76, 0.05)',
                  border: `1px solid ${game.isWin ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 76, 76, 0.2)'}`,
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ fontSize: '1.2rem' }}>
                    {game.isWin ? '✅' : '❌'}
            </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      Rolled {game.diceResult} ({game.multiplier}x)
        </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {getPredictionText(game.prediction)} • ₹{game.betAmount || 0}
                    </div>
                  </div>
                </div>
          <div style={{ 
                  color: game.isWin ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {game.isWin ? '+' : '-'}₹{game.isWin ? (game.winAmount || 0) : (game.betAmount || 0)}
          </div>
      </div>
            ))}
            
            {gameResults.length === 0 && (
              <div style={{
          textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '2rem',
                fontSize: '0.9rem'
              }}>
                No games played yet. Start rolling the dice!
              </div>
            )}
          </div>
        </div>

        {/* Live Wins */}
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
            🔥 Live Wins
          </h3>

          <div style={{ maxHeight: '300px', overflowY: 'hidden' }}>
            {liveBets.slice(0, 8).map((bet, index) => (
              <div
                key={bet.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.8rem',
                  background: index === 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 255, 136, 0.05)',
                  borderRadius: '6px',
                  marginBottom: '0.4rem',
                  border: index === 0 ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(0, 255, 136, 0.1)',
                  opacity: 1 - (index * 0.1),
                  transform: `scale(${1 - (index * 0.02)})`,
                  animation: index === 0 ? 'slideUp 0.5s ease-out' : 'none'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: '600' }}>
                    {bet.user}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    ₹{bet.amount} bet • {bet.multiplier}x
                  </div>
                </div>
          <div style={{ 
                  color: 'var(--accent-green)',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  +₹{bet.win}
          </div>
              </div>
            ))}
          </div>

            <div style={{ 
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              Total Won Today
            </div>
            <div style={{ color: 'var(--accent-green)', fontSize: '1rem', fontWeight: '700' }}>
              {formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 3.2)}
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
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(25, 25, 25, 0.98))',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: 'var(--primary-gold)', margin: 0, fontSize: '1.3rem' }}>
                🎲 Dice Roll Rules
              </h3>
          <button
                onClick={() => setShowRules(false)}
            style={{
                  background: 'var(--accent-red)',
              border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: 'white',
              cursor: 'pointer',
                  fontSize: '1rem'
            }}
          >
                ×
          </button>
        </div>

            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>How to Play:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Choose your prediction type before rolling</li>
                  <li>Place your bet and roll the dice</li>
                  <li>Win based on your prediction accuracy</li>
                </ul>
        </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Prediction Types:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li><strong>Higher (4-6):</strong> 2x multiplier</li>
                  <li><strong>Lower (1-3):</strong> 2x multiplier</li>
                  <li><strong>Middle (3-4):</strong> 3x multiplier</li>
                  <li><strong>Extreme (1 or 6):</strong> 6x multiplier</li>
                </ul>
      </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Strategy Tips:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Higher/Lower have 50% chance but lower payouts</li>
                  <li>Extreme bets are risky but very rewarding</li>
                  <li>Middle bets offer balanced risk-reward</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoll; 