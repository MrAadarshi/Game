import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRewards } from '../../context/RewardsContext';

const DragonTiger = () => {
  const { user, walletBalance, placeBet } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  const [betAmount, setBetAmount] = useState(50);
  const [selectedBet, setSelectedBet] = useState(null);
  const [gameState, setGameState] = useState('betting'); // betting, dealing, revealed, finished
  const [countdown, setCountdown] = useState(20);
  const [dragonCard, setDragonCard] = useState(null);
  const [tigerCard, setTigerCard] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameId, setGameId] = useState(1);
  const [isDealing, setIsDealing] = useState(false);
  const [playerBets, setPlayerBets] = useState([]);
  
  // Auto Bet States
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [autoBetConfig, setAutoBetConfig] = useState({
    numberOfBets: 5,
    selectedBet: 'dragon',
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50
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

  // Game Controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showAutoBetConfig, setShowAutoBetConfig] = useState(false);
  
  const countdownInterval = useRef(null);
  const dealTimeout = useRef(null);
  const autoBetTimeoutRef = useRef(null);
  const currentBetCountRef = useRef(0);

  // Card values and suits
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const getCardValue = (rank) => {
    if (rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(rank)) return [11, 12, 13][['J', 'Q', 'K'].indexOf(rank)] + 10;
    return parseInt(rank);
  };

  const generateCard = () => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    return { suit, rank, value: getCardValue(rank) };
  };

  // Bet options with multipliers
  const betOptions = {
    dragon: { name: 'Dragon', multiplier: 1.96, color: '#EF4444', icon: '🐉' },
    tiger: { name: 'Tiger', multiplier: 1.96, color: '#F59E0B', icon: '🐅' },
    tie: { name: 'Tie', multiplier: 8.0, color: '#8B5CF6', icon: '🤝' }
  };

  // Auto Bet Functions
  const startAutoBet = () => {
    if (gameState !== 'betting' || !user || betAmount > walletBalance) return;
    
    setIsAutoBetting(true);
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
    
    currentBetCountRef.current = 0;
  };

  const stopAutoBet = () => {
    setIsAutoBetting(false);
    setAutoBetStats(prev => ({ ...prev, isRunning: false }));
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
  };

  const executeAutoBet = () => {
    if (!isAutoBetting || currentBetCountRef.current >= autoBetConfig.numberOfBets) {
      stopAutoBet();
      return;
    }

    if (gameState === 'betting' && placeBet(betAmount, 0, 'dragon_tiger')) {
      currentBetCountRef.current += 1;
      setAutoBetStats(prev => ({
        ...prev,
        currentBet: currentBetCountRef.current,
        totalBets: prev.totalBets + 1,
        totalWagered: prev.totalWagered + betAmount
      }));
      
      // Place the configured auto bet
      const newBet = {
        type: autoBetConfig.selectedBet,
        amount: betAmount,
        multiplier: betOptions[autoBetConfig.selectedBet].multiplier
      };
      
      setPlayerBets(prev => [...prev, newBet]);
      setSelectedBet(autoBetConfig.selectedBet);
      
      updateChallengeProgress('games_played');
      playSound('bet');
    }
  };

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let frequency, duration, waveType;

    switch (type) {
      case 'bet':
        frequency = 800;
        duration = 0.2;
        waveType = 'sine';
        break;
      case 'deal':
        frequency = 600;
        duration = 0.3;
        waveType = 'triangle';
        break;
      case 'reveal':
        frequency = 1000;
        duration = 0.5;
        waveType = 'sine';
        break;
      case 'win':
        frequency = 1200;
        duration = 0.8;
        waveType = 'sine';
        break;
      case 'lose':
        frequency = 300;
        duration = 0.6;
        waveType = 'sawtooth';
        break;
      default:
        frequency = 500;
        duration = 0.2;
        waveType = 'sine';
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // Start new game
  const startNewGame = () => {
    setGameState('betting');
    setCountdown(20);
    setSelectedBet(null);
    setDragonCard(null);
    setTigerCard(null);
    setGameResult(null);
    setIsDealing(false);
    setPlayerBets([]);
    
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          startDealing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start dealing phase
  const startDealing = () => {
    setGameState('dealing');
    setIsDealing(true);
    
    playSound('deal');
    
    // Deal cards with animation delay
    dealTimeout.current = setTimeout(() => {
      const dragon = generateCard();
      const tiger = generateCard();
      
      setDragonCard(dragon);
      setTigerCard(tiger);
      
      setTimeout(() => {
        revealResult(dragon, tiger);
      }, 1000);
    }, 2000);
  };

  // Reveal result
  const revealResult = (dragon, tiger) => {
    setGameState('revealed');
    setIsDealing(false);
    
    let result;
    if (dragon.value > tiger.value) {
      result = 'dragon';
    } else if (tiger.value > dragon.value) {
      result = 'tiger';
    } else {
      result = 'tie';
    }
    
    setGameResult(result);
    playSound('reveal');
    
    // Check for wins
    checkPlayerWins(result);
    
    // Add to history
    setGameHistory(prev => [
      { gameId, dragon, tiger, result },
      ...prev.slice(0, 9)
    ]);
    
    // Start next game after 5 seconds
    setTimeout(() => {
      setGameId(prev => prev + 1);
      setGameState('finished');
      setTimeout(startNewGame, 2000);
    }, 3000);
  };

  // Place bet
  const handleBet = (betType) => {
    if (gameState !== 'betting' || !user || betAmount > walletBalance) return;
    
    if (placeBet(betAmount, 0, 'dragon_tiger')) {
      const newBet = {
        type: betType,
        amount: betAmount,
        multiplier: betOptions[betType].multiplier
      };
      
      setPlayerBets(prev => [...prev, newBet]);
      setSelectedBet(betType);
      
      playSound('bet');
      updateChallengeProgress('games_played');
    }
  };

  // Check wins
  const checkPlayerWins = (result) => {
    let totalWinnings = 0;
    
    playerBets.forEach(bet => {
      if (bet.type === result) {
        const winAmount = bet.amount * bet.multiplier;
        totalWinnings += winAmount;
        
        // Add winnings to wallet
        placeBet(0, winAmount - bet.amount, 'dragon_tiger');
        
        // Update challenges
        updateChallengeProgress('games_won');
        updateChallengeProgress('earnings', winAmount - bet.amount);
        
        // Check achievements
        checkAchievement('first_win', { wins: 1 });
        if (winAmount >= 1000) {
          checkAchievement('big_winner', { amount: winAmount });
        }
      }
    });
    
    if (totalWinnings > 0) {
      playSound('win');
    } else if (playerBets.length > 0) {
      playSound('lose');
    }
  };

  // Initialize game
  useEffect(() => {
    startNewGame();
    
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      if (dealTimeout.current) clearTimeout(dealTimeout.current);
    };
  }, []);

  const quickBets = [10, 25, 50, 100, 250, 500];

  return (
    <div className="container animate-fadeInUp" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--primary-gold)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          fontWeight: '900'
        }}>
          🐉🐅 Dragon Tiger
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Classic card battle - Dragon vs Tiger!
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
            onClick={() => setShowAutoBetConfig(!showAutoBetConfig)}
            style={{
              background: isAutoBetting ? 'var(--primary-gold)' : 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              color: isAutoBetting ? '#000' : 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🤖 Auto Bet
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Game Area */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          {/* Game Status */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Game #{gameId}
              </h2>
              
              {gameState === 'betting' && (
                <div>
                  <div style={{
                    fontSize: '2rem',
                    color: countdown <= 5 ? 'var(--accent-red)' : 'var(--primary-gold)',
                    fontWeight: '900',
                    marginBottom: '0.5rem'
                  }}>
                    {countdown}s
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Place your bets!
                  </p>
                </div>
              )}
              
              {gameState === 'dealing' && (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🃏</div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Dealing cards...
                  </p>
                </div>
              )}
              
              {(gameState === 'revealed' || gameState === 'finished') && (
                <div>
                  <div style={{
                    fontSize: '2rem',
                    color: betOptions[gameResult]?.color,
                    marginBottom: '0.5rem'
                  }}>
                    {betOptions[gameResult]?.icon}
                  </div>
                  <p style={{ color: betOptions[gameResult]?.color, fontSize: '1.1rem' }}>
                    {betOptions[gameResult]?.name.toUpperCase()} WINS!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card Display Area */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '2rem',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            {/* Dragon Card */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: betOptions.dragon.color, 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                🐉 Dragon
              </h3>
              <div style={{
                width: '120px',
                height: '180px',
                background: dragonCard ? 
                  'linear-gradient(135deg, #fff, #f8f9fa)' : 
                  'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
                borderRadius: '12px',
                border: dragonCard ? '2px solid #000' : '2px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                position: 'relative',
                transform: gameResult === 'dragon' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: gameResult === 'dragon' ? 
                  `0 0 20px ${betOptions.dragon.color}` : 
                  'none'
              }}>
                {dragonCard ? (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '1rem',
                      color: dragonCard.suit === '♥️' || dragonCard.suit === '♦️' ? '#EF4444' : '#000',
                      fontWeight: '700'
                    }}>
                      {dragonCard.rank}
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      color: dragonCard.suit === '♥️' || dragonCard.suit === '♦️' ? '#EF4444' : '#000'
                    }}>
                      {dragonCard.suit}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      fontSize: '1rem',
                      color: dragonCard.suit === '♥️' || dragonCard.suit === '♦️' ? '#EF4444' : '#000',
                      fontWeight: '700',
                      transform: 'rotate(180deg)'
                    }}>
                      {dragonCard.rank}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: '2rem',
                    color: 'var(--text-secondary)',
                    animation: isDealing ? 'pulse 1s infinite' : 'none'
                  }}>
                    🃏
                  </div>
                )}
              </div>
              {dragonCard && (
                <div style={{
                  marginTop: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  Value: {dragonCard.value}
                </div>
              )}
            </div>

            {/* VS Indicator */}
            <div style={{
              textAlign: 'center',
              fontSize: '2rem',
              color: 'var(--primary-gold)',
              fontWeight: '900'
            }}>
              VS
            </div>

            {/* Tiger Card */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: betOptions.tiger.color, 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                🐅 Tiger
              </h3>
              <div style={{
                width: '120px',
                height: '180px',
                background: tigerCard ? 
                  'linear-gradient(135deg, #fff, #f8f9fa)' : 
                  'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
                borderRadius: '12px',
                border: tigerCard ? '2px solid #000' : '2px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                position: 'relative',
                transform: gameResult === 'tiger' ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: gameResult === 'tiger' ? 
                  `0 0 20px ${betOptions.tiger.color}` : 
                  'none'
              }}>
                {tigerCard ? (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      fontSize: '1rem',
                      color: tigerCard.suit === '♥️' || tigerCard.suit === '♦️' ? '#EF4444' : '#000',
                      fontWeight: '700'
                    }}>
                      {tigerCard.rank}
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      color: tigerCard.suit === '♥️' || tigerCard.suit === '♦️' ? '#EF4444' : '#000'
                    }}>
                      {tigerCard.suit}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      fontSize: '1rem',
                      color: tigerCard.suit === '♥️' || tigerCard.suit === '♦️' ? '#EF4444' : '#000',
                      fontWeight: '700',
                      transform: 'rotate(180deg)'
                    }}>
                      {tigerCard.rank}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: '2rem',
                    color: 'var(--text-secondary)',
                    animation: isDealing ? 'pulse 1s infinite' : 'none'
                  }}>
                    🃏
                  </div>
                )}
              </div>
              {tigerCard && (
                <div style={{
                  marginTop: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  Value: {tigerCard.value}
                </div>
              )}
            </div>
          </div>

          {/* Betting Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}>
            {Object.entries(betOptions).map(([betType, info]) => {
              const isSelected = selectedBet === betType;
              const playerBet = playerBets.find(bet => bet.type === betType);
              
              return (
                <button
                  key={betType}
                  onClick={() => handleBet(betType)}
                  disabled={gameState !== 'betting' || !user || betAmount > walletBalance}
                  style={{
                    padding: '2rem 1rem',
                    background: isSelected ? 
                      `linear-gradient(135deg, ${info.color}, ${info.color}CC)` :
                      `${info.color}20`,
                    border: `2px solid ${info.color}`,
                    borderRadius: '16px',
                    color: isSelected ? '#fff' : info.color,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: (gameState === 'betting' && user && betAmount <= walletBalance) ? 'pointer' : 'not-allowed',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: (gameState !== 'betting') ? 0.6 : 1
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {info.icon}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {info.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {info.multiplier}x payout
                  </div>
                  {playerBet && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.3rem 0.6rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      Bet: ₹{playerBet.amount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Betting Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {gameState === 'betting' && !autoBetStats.isRunning && playerBets.length === 0 && (
              <button
                onClick={startAutoBet}
                disabled={!user || betAmount > walletBalance}
                style={{
                  padding: '1rem 2rem',
                  background: (user && betAmount <= walletBalance) ? 
                    'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                    'var(--glass-bg)',
                  color: (user && betAmount <= walletBalance) ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: (user && betAmount <= walletBalance) ? 'pointer' : 'not-allowed'
                }}
              >
                🤖 Start Auto Bet ({autoBetConfig.numberOfBets}x)
              </button>
            )}
            
            {autoBetStats.isRunning && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: 'var(--primary-gold)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  🔄 Auto Betting ({autoBetStats.currentBet}/{autoBetConfig.numberOfBets})
                </div>
                <button
                  onClick={stopAutoBet}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ Stop Auto Bet
                </button>
              </div>
            )}

            {playerBets.length > 0 && !autoBetStats.isRunning && gameState === 'betting' && (
              <button
                onClick={() => {
                  setPlayerBets([]);
                  setSelectedBet(null);
                  playSound('button');
                }}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--accent-red), #DC2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ❌ Clear Bets
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Betting Panel */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              💰 Betting Panel
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={walletBalance}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {quickBets.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  style={{
                    padding: '0.5rem',
                    background: betAmount === amount ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: betAmount === amount ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Game History */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📊 Recent Results
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {gameHistory.map((game, index) => (
                <div
                  key={game.gameId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: `${betOptions[game.result].color}20`,
                    border: `1px solid ${betOptions[game.result].color}`,
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: betOptions[game.result].color }}>
                      {betOptions[game.result].icon}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      #{game.gameId}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    D:{game.dragon.value} vs T:{game.tiger.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Rules */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📖 Game Rules
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.8rem' }}>
                🐉 <span style={{ color: betOptions.dragon.color }}>Dragon</span>: Higher card wins (1.96x)
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                🐅 <span style={{ color: betOptions.tiger.color }}>Tiger</span>: Higher card wins (1.96x)
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                🤝 <span style={{ color: betOptions.tie.color }}>Tie</span>: Same value cards (8x)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                💡 A=1, 2-10=face value, J=11, Q=12, K=13
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragonTiger; 