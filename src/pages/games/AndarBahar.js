import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const AndarBahar = () => {
  const { walletBalance, placeBet, processGameResult } = useAuth();

  // Game state
  const [gameState, setGameState] = useState('betting'); // betting, dealing, result
  const [betAmount, setBetAmount] = useState(50);
  const [selectedSide, setSelectedSide] = useState('andar');
  const [jokerCard, setJokerCard] = useState(null);
  const [dealingCards, setDealingCards] = useState({ andar: [], bahar: [] });
  const [result, setResult] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Sound control
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto bet states
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState({
    numberOfBets: 10,
    stopOnWin: false,
    stopOnLoss: false,
    stopWinAmount: 100,
    stopLossAmount: 100,
    increaseOnWin: false,
    increaseOnLoss: false,
    increasePercent: 50,
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

  const [displayBetCount, setDisplayBetCount] = useState(0);

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

  const [gameResults, setGameResults] = useState([]);
  const [liveBets, setLiveBets] = useState([]);

  // Refs for auto-betting
  const currentBetCountRef = useRef(0);
  const autoBetEnabledRef = useRef(false);
  const autoBetTimeoutRef = useRef(null);
  const baseBetAmountRef = useRef(50);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch (type) {
      case 'card_deal':
        // Realistic card dealing sound - paper friction with snap
        
        // Create paper friction sound using filtered noise
        const dealBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const dealData = dealBuffer.getChannelData(0);
        
        for (let i = 0; i < dealData.length; i++) {
          dealData[i] = (Math.random() * 2 - 1) * (1 - i / dealData.length) * 0.5;
        }
        
        const dealSource = audioContext.createBufferSource();
        dealSource.buffer = dealBuffer;
        
        const dealFilter = audioContext.createBiquadFilter();
        dealFilter.type = 'highpass';
        dealFilter.frequency.setValueAtTime(1500, audioContext.currentTime);
        dealFilter.Q.setValueAtTime(3, audioContext.currentTime);
        
        const dealGain = audioContext.createGain();
        dealGain.gain.setValueAtTime(0.15, audioContext.currentTime);
        dealGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        dealSource.connect(dealFilter);
        dealFilter.connect(dealGain);
        dealGain.connect(audioContext.destination);
        
        dealSource.start(audioContext.currentTime);
        dealSource.stop(audioContext.currentTime + 0.2);
        
        // Add card snap sound
        const snapOsc = audioContext.createOscillator();
        const snapGain = audioContext.createGain();
        const snapFilter = audioContext.createBiquadFilter();
        
        snapOsc.type = 'square';
        snapOsc.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
        snapOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.12);
        
        snapFilter.type = 'bandpass';
        snapFilter.frequency.setValueAtTime(600, audioContext.currentTime);
        snapFilter.Q.setValueAtTime(8, audioContext.currentTime);
        
        snapGain.gain.setValueAtTime(0.1, audioContext.currentTime + 0.05);
        snapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        
        snapOsc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(audioContext.destination);
        
        snapOsc.start(audioContext.currentTime + 0.05);
        snapOsc.stop(audioContext.currentTime + 0.12);
        
        return;
        break;
        
      case 'card_flip':
        // Realistic card flip sound - quick paper whoosh with snap
        
        // Create whoosh sound using filtered noise
        const flipBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
        const flipData = flipBuffer.getChannelData(0);
        
        for (let i = 0; i < flipData.length; i++) {
          const t = i / flipData.length;
          flipData[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.4;
        }
        
        const flipSource = audioContext.createBufferSource();
        flipSource.buffer = flipBuffer;
        
        const flipFilter = audioContext.createBiquadFilter();
        flipFilter.type = 'bandpass';
        flipFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
        flipFilter.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        flipFilter.Q.setValueAtTime(5, audioContext.currentTime);
        
        const flipGain = audioContext.createGain();
        flipGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        flipGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        flipSource.connect(flipFilter);
        flipFilter.connect(flipGain);
        flipGain.connect(audioContext.destination);
        
        flipSource.start(audioContext.currentTime);
        flipSource.stop(audioContext.currentTime + 0.15);
        
        // Add sharp flip snap at the end
        const flipSnapOsc = audioContext.createOscillator();
        const flipSnapGain = audioContext.createGain();
        
        flipSnapOsc.type = 'triangle';
        flipSnapOsc.frequency.setValueAtTime(600, audioContext.currentTime + 0.08);
        flipSnapOsc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.12);
        
        flipSnapGain.gain.setValueAtTime(0.15, audioContext.currentTime + 0.08);
        flipSnapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        
        flipSnapOsc.connect(flipSnapGain);
        flipSnapGain.connect(audioContext.destination);
        
        flipSnapOsc.start(audioContext.currentTime + 0.08);
        flipSnapOsc.stop(audioContext.currentTime + 0.12);
        
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
        const loseOsc = audioContext.createOscillator();
        const loseGain = audioContext.createGain();
        
        loseOsc.type = 'sine';
        loseOsc.frequency.setValueAtTime(400, audioContext.currentTime);
        loseOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        
        loseGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        loseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        loseOsc.connect(loseGain);
        loseGain.connect(audioContext.destination);
        
        loseOsc.start(audioContext.currentTime);
        loseOsc.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'bet_placed':
        const betOsc = audioContext.createOscillator();
        const betGain = audioContext.createGain();
        
        betOsc.type = 'triangle';
        betOsc.frequency.setValueAtTime(500, audioContext.currentTime);
        
        betGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        betGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        betOsc.connect(betGain);
        betGain.connect(audioContext.destination);
        
        betOsc.start(audioContext.currentTime);
        betOsc.stop(audioContext.currentTime + 0.2);
        break;
        
      default:
        const defaultOsc = audioContext.createOscillator();
        const defaultGain = audioContext.createGain();
        
        defaultOsc.type = 'sine';
        defaultOsc.frequency.setValueAtTime(440, audioContext.currentTime);
        
        defaultGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        defaultGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        defaultOsc.connect(defaultGain);
        defaultGain.connect(audioContext.destination);
        
        defaultOsc.start(audioContext.currentTime);
        defaultOsc.stop(audioContext.currentTime + 0.2);
    }
  };

  // Game logic functions
  const createCard = () => {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    return {
      suit: suits[Math.floor(Math.random() * suits.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)]
    };
  };

  const cardsMatch = (card1, card2) => {
    return card1.rank === card2.rank;
  };

  // Helper functions
  const getWinRate = () => {
    if (gameStats.totalGames === 0) return 0;
    return Math.round((gameStats.totalWins / gameStats.totalGames) * 100);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  // Live bets generator
  const generateRandomBet = () => {
    const names = [
      'Rajesh_Kumar', 'Priya_Singh', 'Amit_Sharma', 'Sneha_Patel', 'Vikram_Rao',
      'Deepika_Joshi', 'Rahul_Gupta', 'Anita_Reddy', 'Sanjay_Mehta', 'Kavya_Nair',
      'Rohit_Bansal', 'Shreya_Agarwal', 'Arun_Pandey', 'Meera_Shah', 'Kiran_Sethi',
      'Pooja_Malhotra', 'Suresh_Iyer', 'Ritu_Chopra', 'Arjun_Pillai', 'Divya_Jain'
    ];
    
    const sides = ['andar', 'bahar'];
    const amounts = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500];
    
    const user = names[Math.floor(Math.random() * names.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const multiplier = 1.95;
    const win = Math.round(amount * multiplier);
    
    return {
      id: Date.now() + Math.random(),
      user,
      amount,
      side,
      multiplier,
      win,
      timestamp: new Date()
    };
  };

  // Auto-betting functions
  const startAutoBet = () => {
    if (currentBetCountRef.current >= autoBetConfig.numberOfBets) return;
    
    autoBetEnabledRef.current = true;
    setAutoBetStats(prev => ({ ...prev, isRunning: true }));
    baseBetAmountRef.current = betAmount;
    executeAutoBet();
  };

  const stopAutoBet = () => {
    autoBetEnabledRef.current = false;
    setIsAutoBetting(false);
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
      autoBetTimeoutRef.current = null;
    }
  };

  const executeAutoBet = useCallback(() => {
    if (!autoBetEnabledRef.current || currentBetCountRef.current >= autoBetConfig.numberOfBets) {
      stopAutoBet();
      return;
    }

    currentBetCountRef.current += 1;
    setDisplayBetCount(currentBetCountRef.current);

    // Check stop conditions before placing bet
    if (autoBetConfig.stopOnWin && autoBetStats.totalProfit >= autoBetConfig.stopWinAmount) {
      stopAutoBet();
      return;
    }
    if (autoBetConfig.stopOnLoss && autoBetStats.totalProfit <= -autoBetConfig.stopLossAmount) {
      stopAutoBet();
      return;
    }

    handleBet(true);
  }, [autoBetConfig, autoBetStats.totalProfit]);

  const processAutoBetResult = (gameResult) => {
    setTimeout(() => {
      if (!autoBetEnabledRef.current) return;

      const profit = gameResult.won ? gameResult.payout - betAmount : -betAmount;
      
      setAutoBetStats(prev => ({
        ...prev,
        currentBet: currentBetCountRef.current,
        totalBets: currentBetCountRef.current,
        wins: gameResult.won ? prev.wins + 1 : prev.wins,
        losses: !gameResult.won ? prev.losses + 1 : prev.losses,
        totalWagered: prev.totalWagered + betAmount,
        totalProfit: prev.totalProfit + profit
      }));

      // Adjust bet amount based on result
      let newBetAmount = betAmount;
      
      if (gameResult.won && autoBetConfig.increaseOnWin) {
        newBetAmount = Math.round(betAmount * (1 + autoBetConfig.increasePercent / 100));
      } else if (!gameResult.won && autoBetConfig.increaseOnLoss) {
        newBetAmount = Math.round(betAmount * (1 + autoBetConfig.increasePercent / 100));
      }

      if (gameResult.won && autoBetConfig.resetOnWin) {
        newBetAmount = baseBetAmountRef.current;
      } else if (!gameResult.won && autoBetConfig.resetOnLoss) {
        newBetAmount = baseBetAmountRef.current;
      }

      setBetAmount(Math.round(newBetAmount));

      autoBetTimeoutRef.current = setTimeout(() => {
        if (autoBetEnabledRef.current) {
          resetGame();
          setTimeout(() => {
            if (autoBetEnabledRef.current) executeAutoBet();
          }, 300);
        }
      }, 2500);
    }, 100);
  };

  const handleBet = async (isAutomatic = false) => {
    if (betAmount < 10 || betAmount > 1000) return;
    if (betAmount > (walletBalance || 0)) {
      if (isAutomatic) stopAutoBet();
      return;
    }

    setGameState('dealing');
    setIsDealing(true);
    playSound('bet_placed');

    try {
      await placeBet(betAmount, 'andar-bahar', 'Andar Bahar');
      
      // Generate joker card
      const joker = createCard();
      setJokerCard(joker);
      playSound('card_deal');

      let andarCards = [];
      let baharCards = [];
      let gameWon = false;
      let winner = null;
      let secondCard = null;

      // Deal cards alternately
      let currentSide = 'andar';
      let cardCount = 0;

      const dealCard = () => {
        if (gameWon) return;

        let newCard = createCard();
        cardCount++;

        // Limit game to maximum 12 cards total (6 per side) to keep it short
        const maxCards = 12;
        
        // Increase probability of match as cards increase (to keep games shorter)
        let isMatch = cardsMatch(joker, newCard);
        if (!isMatch && cardCount > 4) {
          // After 4 cards, increase chance of getting matching rank
          const matchChance = Math.min(0.4, (cardCount - 4) * 0.1); // 10% increase per card after 4th
          if (Math.random() < matchChance) {
            newCard = { ...newCard, rank: joker.rank }; // Force a match
            isMatch = true;
          }
        }
        
        const shouldForceEnd = cardCount >= maxCards;

        if (isMatch || shouldForceEnd) {
          gameWon = true;
          winner = currentSide;
          secondCard = newCard;
          
          if (currentSide === 'andar') {
            andarCards = [...andarCards, newCard];
          } else {
            baharCards = [...baharCards, newCard];
          }

          const won = selectedSide === winner;
          const payout = won ? betAmount * 1.95 : 0;

          const gameResult = {
            jokerCard: joker,
            secondCard: newCard,
            andarCards,
            baharCards,
            winner,
            won,
            betAmount,
            payout: Math.round(payout),
            selectedSide,
            timestamp: new Date()
          };

          setResult(gameResult);
          setGameState('result');
          setIsDealing(false);

          // Update game stats
          setGameStats(prev => {
            const newStats = {
              ...prev,
              totalGames: prev.totalGames + 1,
              totalWins: won ? prev.totalWins + 1 : prev.totalWins,
              totalLosses: !won ? prev.totalLosses + 1 : prev.totalLosses,
              totalWinAmount: prev.totalWinAmount + (won ? payout : 0),
              totalLossAmount: prev.totalLossAmount + (!won ? betAmount : 0),
              biggestWin: won ? Math.max(prev.biggestWin, payout) : prev.biggestWin
            };

            if (won) {
              newStats.currentStreak = prev.currentStreak >= 0 ? prev.currentStreak + 1 : 1;
              newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
            } else {
              newStats.currentStreak = prev.currentStreak <= 0 ? prev.currentStreak - 1 : -1;
            }

            return newStats;
          });

          setGameResults(prev => [gameResult, ...prev.slice(0, 9)]);
          playSound(won ? 'win' : 'lose');
          processGameResult(betAmount, won ? payout : 0, 'andar-bahar', 'Andar Bahar', won);

          if (isAutomatic) {
            processAutoBetResult(gameResult);
          }
          return;
        }

        if (currentSide === 'andar') {
          andarCards = [...andarCards, newCard];
          setDealingCards(prev => ({ ...prev, andar: andarCards }));
        } else {
          baharCards = [...baharCards, newCard];
          setDealingCards(prev => ({ ...prev, bahar: baharCards }));
        }

        playSound('card_flip');
        
        // Switch sides
        currentSide = currentSide === 'andar' ? 'bahar' : 'andar';

        // Continue dealing after delay
        setTimeout(dealCard, 800);
      };

      // Start dealing after joker card animation
      setTimeout(dealCard, 1000);
      
    } catch (error) {
      console.error('Error placing bet:', error);
      setGameState('betting');
      setIsDealing(false);
      if (isAutomatic) stopAutoBet();
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setJokerCard(null);
    setDealingCards({ andar: [], bahar: [] });
    setResult(null);
    setIsDealing(false);
  };

  const clearStats = () => {
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

  // Generate live bets
  useEffect(() => {
    const generateLiveBet = () => {
      setLiveBets(prev => [generateRandomBet(), ...prev.slice(0, 7)]);
    };

    const interval = setInterval(generateLiveBet, 3000 + Math.random() * 4000);
    generateLiveBet(); // Initial bet
    
    return () => clearInterval(interval);
  }, []);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current);
      }
    };
  }, []);
    
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
          <div style={{ fontSize: '3rem' }}>🂡</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Andar Bahar
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0, marginBottom: '1rem' }}>
          Classic Indian card game. Predict which side the joker card will appear!
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
              Auto Bet
            </button>
          </div>

          {/* Bet Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.8rem', 
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              Bet Amount
              </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.8rem',
              marginBottom: '1rem'
            }}>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.min(1000, Math.max(10, parseInt(e.target.value) || 10)))}
                min="10"
                max="1000"
                disabled={gameState !== 'betting' || autoBetStats.isRunning}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              />
            </div>
            
            {/* Quick Bet Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                  disabled={gameState !== 'betting' || autoBetStats.isRunning}
                    style={{ 
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: betAmount === amount ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                    background: betAmount === amount ? 'rgba(0, 255, 136, 0.1)' : 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: gameState !== 'betting' || autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                    opacity: gameState !== 'betting' || autoBetStats.isRunning ? 0.6 : 1
                    }}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

          {/* Side Selection */}
            <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
                display: 'block',
              marginBottom: '0.8rem', 
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
              }}>
              Choose Side
              </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                onClick={() => setSelectedSide('andar')}
                disabled={gameState !== 'betting' || autoBetStats.isRunning}
                  style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: selectedSide === 'andar' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  background: selectedSide === 'andar' ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: gameState !== 'betting' || autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                  opacity: gameState !== 'betting' || autoBetStats.isRunning ? 0.6 : 1
                }}
              >
                ANDAR
              </button>
              <button
                onClick={() => setSelectedSide('bahar')}
                disabled={gameState !== 'betting' || autoBetStats.isRunning}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '12px',
                  border: selectedSide === 'bahar' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  background: selectedSide === 'bahar' ? 'rgba(59, 130, 246, 0.2)' : 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: gameState !== 'betting' || autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: gameState !== 'betting' || autoBetStats.isRunning ? 0.6 : 1
                }}
              >
                BAHAR
                </button>
            </div>
          </div>

          {/* Auto Bet Configuration */}
          {isAutoBetting && (
            <div style={{
              background: 'rgba(0, 173, 181, 0.1)',
              border: '1px solid var(--accent-green)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--accent-green)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                🤖 Auto Bet Settings
              </h4>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Number of Bets: {autoBetConfig.numberOfBets}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={autoBetConfig.numberOfBets}
                    onChange={(e) => setAutoBetConfig(prev => ({ ...prev, numberOfBets: parseInt(e.target.value) }))}
                    disabled={autoBetStats.isRunning}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={autoBetConfig.stopOnWin}
                      onChange={(e) => setAutoBetConfig(prev => ({ ...prev, stopOnWin: e.target.checked }))}
                      disabled={autoBetStats.isRunning}
                    />
                    Stop on Win: ₹{autoBetConfig.stopWinAmount}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={autoBetConfig.stopOnLoss}
                      onChange={(e) => setAutoBetConfig(prev => ({ ...prev, stopOnLoss: e.target.checked }))}
                      disabled={autoBetStats.isRunning}
                    />
                    Stop on Loss: ₹{autoBetConfig.stopLossAmount}
                  </label>
                </div>
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

          {/* Main Bet Button */}
          {gameState === 'betting' ? (
            <button
              onClick={() => isAutoBetting ? startAutoBet() : handleBet()}
              disabled={isDealing || autoBetStats.isRunning}
              style={{ 
                width: '100%',
                padding: '1.2rem',
                background: isAutoBetting 
                  ? 'linear-gradient(135deg, var(--accent-green), #22c55e)' 
                  : 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
                border: 'none',
                borderRadius: '12px',
                color: isAutoBetting ? '#000' : '#000',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: isDealing || autoBetStats.isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isDealing || autoBetStats.isRunning ? 0.6 : 1,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              {isAutoBetting ? '🤖 START AUTO BET' : '🎯 PLACE BET'}
            </button>
          ) : (
            <button
              onClick={resetGame}
              style={{ 
                width: '100%',
                padding: '1.2rem',
                background: 'linear-gradient(135deg, var(--accent-green), #22c55e)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              🔄 NEW ROUND
            </button>
          )}
        </div>

        {/* Game Area */}
        <div className="game-area" style={{ minHeight: '400px' }}>
            <h3 style={{ 
            color: 'var(--primary-gold)',
            fontSize: '1.2rem',
            marginBottom: '1.5rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center',
            justifyContent: 'center'
          }}>
            🂡 Game Table
            </h3>
            
          {/* Joker Card */}
          {jokerCard && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                JOKER CARD
              </div>
            <div style={{ 
                display: 'inline-block',
                background: 'linear-gradient(45deg, #fff, #f8f9fa)',
                border: '3px solid var(--primary-gold)',
                borderRadius: '12px',
                padding: '1.5rem',
                fontSize: '2rem',
                color: jokerCard.suit === '♥️' || jokerCard.suit === '♦️' ? '#e74c3c' : '#2c3e50',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
                animation: 'cardReveal 0.8s ease-out'
              }}>
                {jokerCard.rank}{jokerCard.suit}
            </div>
            
              {/* Card Counter */}
              {(dealingCards.andar.length > 0 || dealingCards.bahar.length > 0) && (
                <div style={{
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  Cards Dealt: {dealingCards.andar.length + dealingCards.bahar.length}/12
            </div>
              )}
          </div>
          )}

          {/* Playing Area */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Andar Side */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
                ANDAR
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                gap: '0.5rem',
                minHeight: '100px'
              }}>
                {dealingCards.andar.slice(-6).map((card, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(45deg, #fff, #f8f9fa)',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      padding: '0.8rem 0.5rem',
                      fontSize: '1.2rem',
                      color: card.suit === '♥️' || card.suit === '♦️' ? '#e74c3c' : '#2c3e50',
                      animation: 'cardDeal 0.5s ease-out'
                    }}
                  >
                    {card.rank}{card.suit}
                  </div>
                ))}
              </div>
            </div>

            {/* Bahar Side */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid #3b82f6',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
                BAHAR
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                gap: '0.5rem',
                minHeight: '100px'
              }}>
                {dealingCards.bahar.slice(-6).map((card, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(45deg, #fff, #f8f9fa)',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0.8rem 0.5rem',
                      fontSize: '1.2rem',
                      color: card.suit === '♥️' || card.suit === '♦️' ? '#e74c3c' : '#2c3e50',
                      animation: 'cardDeal 0.5s ease-out'
                    }}
                  >
                    {card.rank}{card.suit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game State Messages */}
          {gameState === 'betting' && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>Place Your Bet</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Choose Andar or Bahar and bet on where the matching card will appear!
              </p>
            </div>
          )}

          {gameState === 'dealing' && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
              <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>Dealing Cards...</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Looking for a card matching the Joker rank!
              </p>
        </div>
      )}

      {gameState === 'result' && result && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
          padding: '2rem',
              border: `2px solid ${result.won ? '#22c55e' : '#ef4444'}`,
              boxShadow: `0 20px 40px ${result.won ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
            <div style={{ 
                fontSize: '4rem',
                marginBottom: '1rem'
            }}>
                {result.won ? '🎉' : '😔'}
            </div>
            
              <h2 style={{
              fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '1rem',
                color: result.won ? '#22c55e' : '#ef4444'
            }}>
                {result.won ? 'YOU WON!' : 'TRY AGAIN!'}
              </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
                gap: '1rem', 
                marginBottom: '1rem',
                alignItems: 'center'
              }}>
                <div style={{
                  background: 'linear-gradient(45deg, #fff, #f8f9fa)',
                  border: '2px solid #ffd700',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '1.5rem',
                  color: result.jokerCard.suit === '♥️' || result.jokerCard.suit === '♦️' ? '#e74c3c' : '#2c3e50'
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#ffd700', marginBottom: '0.25rem' }}>JOKER</div>
                  {result.jokerCard.rank}{result.jokerCard.suit}
            </div>
                
                <div style={{ color: 'white', fontSize: '1.5rem' }}>VS</div>
            
            <div style={{ 
                  background: 'linear-gradient(45deg, #fff, #f8f9fa)',
                  border: '2px solid #3498db',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '1.5rem', 
                  color: result.secondCard.suit === '♥️' || result.secondCard.suit === '♦️' ? '#e74c3c' : '#2c3e50'
                }}>
                  <div style={{ fontSize: '0.6rem', color: '#3498db', marginBottom: '0.25rem' }}>DRAWN</div>
                  {result.secondCard.rank}{result.secondCard.suit}
                </div>
              </div>

              <div style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
                Winner: <span style={{ 
                  color: result.winner === 'andar' ? '#ef4444' : '#3b82f6',
                  fontWeight: 'bold'
                }}>
                  {result.winner?.toUpperCase()}
                </span>
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
                  Won: ₹{result.payout}
                </div>
              )}
            </div>
          )}
        </div>
            </div>
            
      {/* Bottom Sections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Statistics */}
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
            <button 
              onClick={clearStats}
              style={{
                marginLeft: 'auto',
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
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Games</div>
              <div style={{ color: 'var(--accent-green)', fontSize: '1.5rem', fontWeight: '700' }}>
                {gameStats.totalGames}
          </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Win Rate</div>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: '700' }}>
                {getWinRate()}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Won</div>
              <div style={{ color: 'var(--accent-green)', fontSize: '1.2rem', fontWeight: '700' }}>
                ₹{gameStats.totalWinAmount}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Biggest Win</div>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '700' }}>
                ₹{gameStats.biggestWin}
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
            📄 Recent Games
          </h3>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {gameResults.slice(0, 10).map((game, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8rem',
                  background: game.won ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 76, 76, 0.05)',
                  border: `1px solid ${game.won ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 76, 76, 0.2)'}`,
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ fontSize: '1.2rem' }}>
                    {game.won ? '✅' : '❌'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {game.selectedSide?.toUpperCase()} → {game.winner?.toUpperCase()}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      ₹{game.betAmount} bet
                    </div>
                  </div>
                </div>
                <div style={{ 
                  color: game.won ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {game.won ? '+' : '-'}₹{game.won ? game.payout : game.betAmount}
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
                No games played yet. Start betting to see your history!
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
                    ₹{bet.amount} on {bet.side.toUpperCase()}
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
              {formatNumber(liveBets.reduce((sum, bet) => sum + bet.win, 0) * 4.2)}
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
                🂡 Andar Bahar Rules
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
                  <li>A joker card is drawn first</li>
                  <li>Choose ANDAR (left) or BAHAR (right)</li>
                  <li>Cards are dealt alternately to both sides</li>
                  <li>First side to get a card matching the joker rank wins!</li>
                </ul>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Auto Bet:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Set number of automatic bets</li>
                  <li>Configure stop conditions for wins/losses</li>
                  <li>Track your progress with live statistics</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Winning:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Correct prediction = 1.95x your bet amount</li>
                  <li>Wrong prediction = lose your bet</li>
                  <li>Fair 50/50 odds for each side</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes cardReveal {
          0% { transform: scale(0) rotateY(180deg); opacity: 0; }
          50% { transform: scale(1.1) rotateY(90deg); }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        
        @keyframes cardDeal {
          0% { transform: translateX(-100px) rotate(-45deg); opacity: 0; }
          100% { transform: translateX(0) rotate(0deg); opacity: 1; }
        }
        
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AndarBahar; 