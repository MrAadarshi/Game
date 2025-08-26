import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const FlyRocket = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(10);
  const [prediction, setPrediction] = useState(2.0);
  const [gameState, setGameState] = useState('idle'); // idle, flying, crashed, cashed_out
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameHistory, setGameHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
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

  // Live bets feed
  const [liveBets, setLiveBets] = useState([
    { user: 'Arjun_K294', amount: 50, multiplier: 3.5, win: 175, id: 1 },
    { user: 'Priya_S817', amount: 75, multiplier: 2.1, win: 157, id: 2 },
    { user: 'Rahul_P453', amount: 100, multiplier: 5.2, win: 520, id: 3 },
    { user: 'Ananya_M628', amount: 40, multiplier: 1.8, win: 72, id: 4 },
    { user: 'Vikram_R935', amount: 150, multiplier: 4.0, win: 600, id: 5 }
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
      case 'rocket_launch':
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 1);
        break;
      case 'cash_out':
        const cashFreqs = [392.00, 493.88, 587.33, 659.25];
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
        return;
      case 'crash':
        const whiteNoise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        whiteNoise.buffer = buffer;
        const crashGain = audioContext.createGain();
        crashGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        crashGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        whiteNoise.connect(crashGain);
        crashGain.connect(audioContext.destination);
        whiteNoise.start(audioContext.currentTime);
        whiteNoise.stop(audioContext.currentTime + 0.3);
        return;
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
      'Lakshya', 'Lalit', 'Luv', 'Laxman', 'Lokesh', 'Lohit', 'Lucky', 'Latesh', 'Lavan', 'Labhesh',
      'Manish', 'Mohit', 'Mukesh', 'Manoj', 'Mayank', 'Milan', 'Mithun', 'Mohan', 'Manan', 'Mahesh',
      'Nikhil', 'Nishant', 'Naveen', 'Nitesh', 'Naman', 'Naresh', 'Nitin', 'Nayan', 'Nilesh', 'Nakul',
      'Om', 'Omkar', 'Onkar', 'Ojas', 'Omprakash', 'Omveer', 'Omesh', 'Omprasad', 'Omnarain', 'Ompal',
      
      // P-T
      'Pradeep', 'Prakash', 'Pranav', 'Piyush', 'Puneet', 'Pawan', 'Parth', 'Paras', 'Priyank', 'Pranay',
      'Raj', 'Rahul', 'Raman', 'Rohan', 'Rohit', 'Ravi', 'Ritesh', 'Rajesh', 'Ramesh', 'Rakesh',
      'Sanjay', 'Suresh', 'Sandeep', 'Saurabh', 'Shubham', 'Sachin', 'Sumit', 'Siddharth', 'Shyam', 'Sameer',
      'Tarun', 'Tushar', 'Tanuj', 'Tejas', 'Tilak', 'Tarang', 'Tapan', 'Trilok', 'Tanmay', 'Tanveer',
      
      // U-Z
      'Umesh', 'Uday', 'Ujjwal', 'Utkarsh', 'Upendra', 'Uttam', 'Udit', 'Ulhas', 'Unmesh', 'Urvi',
      'Varun', 'Vikash', 'Vinay', 'Vishal', 'Vivek', 'Vipul', 'Vaibhav', 'Vinod', 'Vijay', 'Vimal',
      'Yash', 'Yogesh', 'Yashwant', 'Yatin', 'Yuvraj', 'Yasir', 'Yagnesh', 'Yadhav', 'Yamini', 'Yasmin',
      'Zayed', 'Zahir', 'Zain', 'Zeeshan', 'Zuber', 'Zakir', 'Zubair', 'Zeenat', 'Zoya', 'Zara',
      
      // Female names
      'Aadhya', 'Ananya', 'Aisha', 'Avni', 'Aditi', 'Anjali', 'Aarushi', 'Akshara', 'Aliya', 'Amara',
      'Bhavana', 'Bhavya', 'Bindiya', 'Brinda', 'Bela', 'Bhumi', 'Bhargavi', 'Bharti', 'Bhavika', 'Bhavna',
      'Chitra', 'Charvi', 'Chhavi', 'Chanda', 'Chandni', 'Charu', 'Chinmayee', 'Chitrangada', 'Chanchal', 'Chaitali',
      'Diya', 'Deepika', 'Divya', 'Disha', 'Damini', 'Daksha', 'Darshana', 'Deeksha', 'Devika', 'Dharti',
      'Ekta', 'Esha', 'Eshita', 'Elena', 'Elina', 'Evelyn', 'Eesha', 'Ekisha', 'Eshana', 'Etasha',
      'Falak', 'Falguni', 'Faria', 'Fatima', 'Fiza', 'Farheen', 'Farah', 'Farida', 'Fariha', 'Fayra',
      'Garima', 'Gitika', 'Geetika', 'Gunjan', 'Gauri', 'Garvita', 'Gayatri', 'Gita', 'Ganga', 'Geeta',
      'Harshita', 'Hema', 'Hina', 'Hriti', 'Hiral', 'Himanshi', 'Hasina', 'Heena', 'Himani', 'Hansika',
      'Ishita', 'Ira', 'Isha', 'Ishanvi', 'Indira', 'Indu', 'Ila', 'Ishani', 'Isha', 'Ivy',
      'Jaya', 'Jiya', 'Janvi', 'Juhi', 'Janhavi', 'Jasmin', 'Jayanti', 'Jyoti', 'Jasmeet', 'Jinal',
      'Kavya', 'Kiara', 'Khushi', 'Kriti', 'Kiran', 'Karishma', 'Kalpana', 'Kamini', 'Kavita', 'Komal',
      'Lavanya', 'Lata', 'Lila', 'Lakshmi', 'Laxmi', 'Leela', 'Lipika', 'Latha', 'Latha', 'Lipi',
      'Meera', 'Maya', 'Mira', 'Megha', 'Madhuri', 'Manisha', 'Mala', 'Manju', 'Mohini', 'Malini',
      'Nisha', 'Neha', 'Nita', 'Nikita', 'Nidhi', 'Naina', 'Namrata', 'Nandini', 'Natasha', 'Neelam',
      'Ojasvi', 'Ojaswini', 'Omisha', 'Oorja', 'Oviya', 'Oshee', 'Ojal', 'Oshika', 'Ojasara', 'Oshin',
      'Priya', 'Pooja', 'Preeti', 'Pallavi', 'Poonam', 'Payal', 'Priyanka', 'Pragya', 'Parul', 'Pushpa',
      'Radha', 'Riya', 'Rashmi', 'Rekha', 'Rani', 'Rohini', 'Rajni', 'Renu', 'Richa', 'Rakhi',
      'Sita', 'Sunita', 'Swati', 'Sneha', 'Shanti', 'Shilpa', 'Sushma', 'Shobha', 'Sapna', 'Sonia',
      'Tara', 'Tanvi', 'Trisha', 'Tejal', 'Tulsi', 'Trupti', 'Tanya', 'Tarini', 'Tanisha', 'Twinkle',
      'Uma', 'Usha', 'Urmila', 'Ujjwala', 'Utkarsha', 'Upasana', 'Urvi', 'Urvashi', 'Ujjwala', 'Ulka',
      'Vidya', 'Vanita', 'Vineeta', 'Veena', 'Varsha', 'Vimala', 'Vasudha', 'Vaishali', 'Vani', 'Vibha',
      'Yamini', 'Yasmin', 'Yogita', 'Yashika', 'Yami', 'Yamika', 'Yashasvi', 'Yasha', 'Yukti', 'Yuvika',
      'Zara', 'Zoya', 'Zehra', 'Zeenat', 'Zinia', 'Zinnia', 'Zara', 'Ziva', 'Zaira', 'Zia'
    ];
    
    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    const userName = `${randomName}_${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randomSuffix}`;
    
    const amounts = [10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 500];
    const multipliers = [1.2, 1.5, 1.8, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 7.5, 10.0];
    
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const win = Math.floor(amount * multiplier);
    
    return {
      user: userName,
      amount,
      multiplier,
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
  const startFlight = async (isAutomatic = false) => {
    if (gameState !== 'idle' || betAmount < 10 || betAmount > walletBalance) {
      if (isAutomatic) {
        console.log('Auto-bet: Cannot start flight - invalid state or insufficient balance');
      }
      return;
    }

    setIsLoading(true);
      setGameState('flying');
    setCurrentMultiplier(1.0);
    setResult(null);
    
    try {
      const gameResult = await placeBet(betAmount, 'fly-rocket');
      
      // Simulate rocket flight
      const crashMultiplier = Math.random() * 9 + 1; // 1x to 10x
      const flightDuration = Math.min(crashMultiplier * 1000, 10000); // Max 10 seconds
      
      let startTime = Date.now();
      const flightInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / flightDuration;
        const currentMult = 1 + (crashMultiplier - 1) * progress;
        
        setCurrentMultiplier(Math.min(currentMult, crashMultiplier));
        
        if (elapsed >= flightDuration) {
          clearInterval(flightInterval);
          setGameState('crashed');
          
          const won = prediction <= crashMultiplier;
          const payout = won ? betAmount * prediction : 0;
          
          const result = {
            won,
            prediction,
            crashMultiplier,
            payout,
            betAmount
          };
          
          setResult(result);
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
            setGameState('idle');
            setCurrentMultiplier(1.0);
            
            // Process auto-bet if enabled
            if (autoBetEnabledRef.current) {
              processAutoBetResult(result);
            }
          }, 3000);
        }
      }, 100);
      
    } catch (error) {
      console.error('Bet failed:', error);
      setGameState('idle');
    }
    
    setIsLoading(false);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    
    setGameState('cashed_out');
    const payout = betAmount * currentMultiplier;
    
    const result = {
      won: true,
      prediction: currentMultiplier,
      crashMultiplier: currentMultiplier,
      payout,
      betAmount,
      cashedOut: true
    };
    
    setResult(result);
    updateGameStats(result);
    playSound('win');
    
    // Process the win
    processGameResult({ gameType: 'fly-rocket' }, payout);
    
    // Add to history
    const newGame = {
      ...result,
      timestamp: Date.now()
    };
    
    setGameHistory(prev => [newGame, ...prev.slice(0, 9)]);
    
    setTimeout(() => {
      setGameState('idle');
      setCurrentMultiplier(1.0);
      
      // Process auto-bet if enabled
      if (autoBetEnabledRef.current) {
        processAutoBetResult(result);
      }
    }, 3000);
  };

  // Auto-bet logic with reliable counter
  const processAutoBetResult = (gameResult) => {
    // Increment counter immediately after a bet
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
        startFlight(true);
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
      if (gameState === 'idle') {
        console.log('Auto-bet: Starting first bet');
                 setTimeout(() => {
           if (gameState === 'idle') {
             startFlight(true);
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
          <div style={{ fontSize: '3rem' }}>🚀</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
            margin: 0
        }}>
            Fly Rocket
        </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Watch the rocket fly and cash out before it crashes! High risk, high reward!
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
                disabled={gameState !== 'idle'}
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
                disabled={gameState !== 'idle'}
                    style={{ 
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: gameState === 'idle' ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                  opacity: gameState === 'idle' ? 1 : 0.5
                }}
              >
                ÷2
                  </button>
            <button
                onClick={() => quickBetAmount(2)}
                disabled={gameState !== 'idle'}
              style={{ 
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: gameState === 'idle' ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                  opacity: gameState === 'idle' ? 1 : 0.5
                }}
              >
                ×2
            </button>
          </div>
        </div>

          {/* Prediction */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              🎯 Cash Out At
            </label>
          <div style={{ 
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <input
                type="number"
                value={prediction}
                onChange={(e) => setPrediction(Math.max(1.1, Math.min(100, parseFloat(e.target.value) || 1.1)))}
                min="1.1"
                max="100"
                step="0.1"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                disabled={gameState !== 'idle'}
              />
              <span style={{
                padding: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
              }}>x</span>
            </div>
          </div>

          {/* Potential Win */}
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
              ₹{Math.floor(betAmount * prediction)}
            </div>
          </div>

          {/* Main Action Button */}
          {gameState === 'idle' && (
            <button
              onClick={startFlight}
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
              {isLoading ? '🚀 Launching...' : '🚀 Launch Rocket'}
            </button>
          )}

          {gameState === 'flying' && (
            <button
              onClick={cashOut}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                border: 'none',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                animation: 'pulse 1s infinite'
              }}
            >
              💰 Cash Out {currentMultiplier.toFixed(2)}x
            </button>
          )}

          {(gameState === 'crashed' || gameState === 'cashed_out') && (
            <button
              onClick={() => setGameState('idle')}
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
                <label style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Number of bets:</label>
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
          {/* Current Multiplier Display */}
            <div style={{ 
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: gameState === 'flying' ? '#22c55e' : 
                   gameState === 'crashed' ? '#ef4444' :
                   gameState === 'cashed_out' ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
            textShadow: '0 0 20px currentColor'
          }}>
            {currentMultiplier.toFixed(2)}x
            </div>
            
          {/* Rocket Animation */}
          <div style={{
            fontSize: '4rem',
            transform: gameState === 'flying' ? 'translateY(-20px) rotate(-45deg)' : 
                      gameState === 'crashed' ? 'translateY(50px) rotate(45deg)' :
                      gameState === 'cashed_out' ? 'translateY(-30px) rotate(-30deg)' : 'none',
            transition: 'all 0.3s ease',
            animation: gameState === 'flying' ? 'bounce 0.5s infinite alternate' : 'none'
          }}>
            {gameState === 'crashed' ? '💥' : '🚀'}
          </div>

          {/* Game Status */}
            <div style={{ 
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}>
            {gameState === 'idle' && (
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Ready to launch! Set your prediction and bet amount.
              </div>
            )}
            
            {gameState === 'flying' && (
              <div style={{ color: '#22c55e' }}>
                🚀 Rocket is flying! Cash out at {prediction}x or watch it soar!
              </div>
            )}
            
            {gameState === 'crashed' && result && (
              <div style={{ 
                color: result.won ? '#22c55e' : '#ef4444',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {result.won ? '🎉 YOU WON!' : '💥 CRASHED!'} 
                <br />
                Rocket crashed at {result.crashMultiplier.toFixed(2)}x
                {result.won && <div>Won: ₹{result.payout}</div>}
              </div>
            )}
            
            {gameState === 'cashed_out' && result && (
              <div style={{ 
                color: '#3b82f6',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                💰 CASHED OUT!
                <br />
                At {result.crashMultiplier.toFixed(2)}x - Won: ₹{result.payout}
              </div>
            )}
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
                        {game.cashedOut ? 'Cashed Out' : game.won ? 'Won' : 'Lost'}
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {game.prediction || 0}x @ ₹{game.betAmount || 0}
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
                      ₹{bet.amount} × {bet.multiplier}x
                    </div>
                  </div>
                  <div style={{ 
                    color: '#f59e0b',
                    fontWeight: 'bold'
                  }}>
                    +₹{bet.win}
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
                ₹{formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 4.8)}
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
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🚀 How to Play Fly Rocket</h2>
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
                <li>A rocket launches and flies with an increasing multiplier</li>
                <li>Set your cash-out target before launch</li>
                <li>The rocket can crash at any moment</li>
                <li>Cash out before it crashes to win</li>
                <li>If rocket crashes before your target, you lose</li>
              </ul>
              
              <p><strong>💰 Betting:</strong></p>
              <ul>
                <li>Minimum bet: ₹10</li>
                <li>Maximum bet: ₹1,000</li>
                <li>Set your cash-out multiplier (1.1x to 100x)</li>
                <li>Win = Bet Amount × Cash-out Multiplier</li>
              </ul>

              <p><strong>🎮 Tips:</strong></p>
              <ul>
                <li>Lower targets are safer but offer smaller wins</li>
                <li>Higher targets are riskier but more rewarding</li>
                <li>You can cash out manually during flight</li>
                <li>Use auto-bet for consistent strategy</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0% { transform: translateY(-20px) rotate(-45deg) translateY(0px); }
          100% { transform: translateY(-20px) rotate(-45deg) translateY(-10px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default FlyRocket; 