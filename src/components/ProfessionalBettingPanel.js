import React, { useState, useEffect, useRef } from 'react';

const ProfessionalBettingPanel = ({
  betAmount,
  setBetAmount,
  onBet,
  gameState,
  gameResults = [],
  isLoading = false,
  minBet = 10,
  maxBet = 1000,
  gameType = 'game'
}) => {
  const [autoBetEnabled, setAutoBetEnabled] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState(10);
  const [currentAutoBetCount, setCurrentAutoBetCount] = useState(0);
  const [lastBetAmount, setLastBetAmount] = useState(betAmount);
  const [betHistory, setBetHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const chartRef = useRef(null);

  const quickBetAmounts = [10, 25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    // Store bet history in localStorage
    const stored = localStorage.getItem(`${gameType}_bet_history`);
    if (stored) {
      setBetHistory(JSON.parse(stored));
    }
  }, [gameType]);

  useEffect(() => {
    // Save bet history to localStorage
    if (betHistory.length > 0) {
      localStorage.setItem(`${gameType}_bet_history`, JSON.stringify(betHistory.slice(-50))); // Keep last 50 bets
    }
  }, [betHistory, gameType]);

  useEffect(() => {
    // Auto bet logic
    if (autoBetEnabled && gameState === 'betting' && currentAutoBetCount < autoBetCount) {
      const timer = setTimeout(() => {
        handleBet();
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (currentAutoBetCount >= autoBetCount) {
      setAutoBetEnabled(false);
      setCurrentAutoBetCount(0);
    }
  }, [autoBetEnabled, gameState, currentAutoBetCount, autoBetCount]);

  const handleBet = () => {
    if (betAmount < minBet || betAmount > maxBet) {
      alert(`Bet amount must be between ₹${minBet} and ₹${maxBet}!`);
      return;
    }

    setLastBetAmount(betAmount);
    
    const betRecord = {
      id: Date.now(),
      amount: betAmount,
      timestamp: new Date(),
      type: autoBetEnabled ? 'auto' : 'manual'
    };
    
    setBetHistory(prev => [...prev, betRecord]);
    
    if (autoBetEnabled) {
      setCurrentAutoBetCount(prev => prev + 1);
    }
    
    onBet();
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount >= minBet && amount <= maxBet) {
      setBetAmount(amount);
      setCustomAmount('');
    } else {
      alert(`Amount must be between ₹${minBet} and ₹${maxBet}`);
    }
  };

  const getStatistics = () => {
    const recent = betHistory.slice(-20);
    const totalBets = recent.length;
    const totalAmount = recent.reduce((sum, bet) => sum + bet.amount, 0);
    const avgBet = totalBets > 0 ? totalAmount / totalBets : 0;
    
    // Simulate win/loss data (in real implementation, this would come from game results)
    const wins = Math.floor(totalBets * 0.45); // 45% win rate simulation
    const losses = totalBets - wins;
    const winRate = totalBets > 0 ? (wins / totalBets * 100) : 0;
    
    return { totalBets, totalAmount, avgBet, wins, losses, winRate };
  };

  const stats = getStatistics();

  const WinLossGraph = () => {
    const recent = betHistory.slice(-10);
    const maxAmount = Math.max(...recent.map(bet => bet.amount), 100);
    
    return (
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <h5 style={{ 
          color: 'var(--primary-gold)', 
          marginBottom: '1rem',
          fontSize: '1rem',
          fontWeight: '700'
        }}>
          📊 Recent Betting Pattern
        </h5>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          gap: '0.3rem',
          height: '80px',
          padding: '0.5rem 0'
        }}>
          {recent.map((bet, index) => {
            const height = (bet.amount / maxAmount) * 60;
            const isWin = index % 2 === 0; // Simulate win/loss pattern
            
            return (
              <div key={bet.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.2rem'
                }}>
                  ₹{bet.amount}
                </div>
                <div style={{
                  width: '100%',
                  height: `${height}px`,
                  background: isWin 
                    ? 'linear-gradient(to top, var(--accent-green), rgba(0, 255, 136, 0.5))'
                    : 'linear-gradient(to top, var(--accent-red), rgba(255, 68, 68, 0.5))',
                  borderRadius: '2px',
                  animation: 'fadeInUp 0.5s ease-out',
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                    animation: 'shimmer 2s ease-in-out infinite'
                  }} />
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: isWin ? 'var(--accent-green)' : 'var(--accent-red)',
                  marginTop: '0.2rem'
                }}>
                  {isWin ? 'W' : 'L'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      backdropFilter: 'blur(15px)',
      boxShadow: 'var(--shadow-dark)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          color: 'var(--primary-gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💰 Professional Betting Panel
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            className={showStats ? 'primary-btn' : 'secondary-btn'}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              minWidth: 'auto'
            }}
          >
            📊 Stats
          </button>
          
          <button
            onClick={() => setShowGraph(!showGraph)}
            className={showGraph ? 'primary-btn' : 'secondary-btn'}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              minWidth: 'auto'
            }}
          >
            📈 Graph
          </button>
        </div>
      </div>

      {/* Main Betting Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Bet Amount Section */}
        <div>
          <label className="form-label" style={{ marginBottom: '1rem' }}>
            💳 Bet Amount (₹{minBet} - ₹{maxBet})
          </label>
          
          {/* Current Bet Display */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
            border: '3px solid var(--primary-gold)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#000',
            fontWeight: '800',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
              animation: 'shimmer 3s ease-in-out infinite'
            }} />
            
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
              Current Bet
            </div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              ₹{betAmount.toLocaleString()}
            </div>
            {lastBetAmount !== betAmount && (
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Last: ₹{lastBetAmount}
              </div>
            )}
          </div>

          {/* Quick Bet Amounts */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem' }}>
              ⚡ Quick Select
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
              gap: '0.5rem'
            }}>
              {quickBetAmounts.map(amount => (
                <button
                  key={amount}
                  className={`bet-btn ${betAmount === amount ? 'active' : ''}`}
                  onClick={() => setBetAmount(amount)}
                  style={{
                    aspectRatio: '1.2',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    padding: '0.5rem'
                  }}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem' }}>
              🎯 Custom Amount
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={minBet}
                max={maxBet}
                style={{
                  flex: 1,
                  fontSize: '0.9rem'
                }}
              />
              <button
                onClick={handleCustomAmountSubmit}
                className="secondary-btn"
                disabled={!customAmount}
                style={{
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  opacity: !customAmount ? 0.6 : 1
                }}
              >
                Set
              </button>
            </div>
          </div>

          {/* Bet Amount Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setBetAmount(Math.max(minBet, betAmount - 10))}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.6rem' }}
            >
              -10
            </button>
            <button
              onClick={() => setBetAmount(Math.max(minBet, Math.floor(betAmount / 2)))}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.6rem' }}
            >
              ½
            </button>
            <button
              onClick={() => setBetAmount(Math.min(maxBet, betAmount * 2))}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.6rem' }}
            >
              2x
            </button>
            <button
              onClick={() => setBetAmount(Math.min(maxBet, betAmount + 10))}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.6rem' }}
            >
              +10
            </button>
          </div>
        </div>

        {/* Auto Bet & Controls Section */}
        <div>
          <label className="form-label" style={{ marginBottom: '1rem' }}>
            🤖 Auto Bet Controls
          </label>
          
          {/* Auto Bet Toggle */}
          <div style={{
            background: autoBetEnabled ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))' : 'var(--glass-bg)',
            border: `1px solid ${autoBetEnabled ? 'var(--accent-green)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                Auto Bet Mode
              </span>
              <button
                onClick={() => {
                  setAutoBetEnabled(!autoBetEnabled);
                  setCurrentAutoBetCount(0);
                }}
                style={{
                  background: autoBetEnabled ? 'var(--accent-green)' : 'var(--border-color)',
                  border: 'none',
                  borderRadius: '20px',
                  width: '50px',
                  height: '25px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2.5px',
                  left: autoBetEnabled ? '27.5px' : '2.5px',
                  transition: 'all 0.3s ease'
                }} />
              </button>
            </div>
            
            {autoBetEnabled && (
              <div>
                <label style={{ 
                  display: 'block', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}>
                  Number of Auto Bets: {autoBetCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={autoBetCount}
                  onChange={(e) => setAutoBetCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                />
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--accent-green)'
                }}>
                  Progress: {currentAutoBetCount}/{autoBetCount}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.8rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setBetAmount(lastBetAmount)}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.8rem' }}
            >
              🔄 Last Amount
            </button>
            
            <button
              onClick={() => setBetAmount(Math.min(maxBet, betAmount * 2))}
              className="secondary-btn"
              style={{ fontSize: '0.9rem', padding: '0.8rem' }}
            >
              📈 Double Bet
            </button>
          </div>

          {/* Bet History Quick Stats */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <h5 style={{ 
              color: 'var(--primary-gold)', 
              marginBottom: '0.8rem',
              fontSize: '1rem'
            }}>
              📋 Quick Stats
            </h5>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.8rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Total Bets</div>
                <div style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                  {stats.totalBets}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Avg Bet</div>
                <div style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                  ₹{Math.round(stats.avgBet)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Win Rate</div>
                <div style={{ color: stats.winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '700' }}>
                  {stats.winRate.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Sessions</div>
                <div style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                  {Math.ceil(stats.totalBets / 10)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bet Button */}
      <button
        onClick={handleBet}
        disabled={isLoading || gameState !== 'betting'}
        className="primary-btn"
        style={{
          fontSize: '1.2rem',
          fontWeight: '800',
          padding: '1.2rem 2rem',
          marginBottom: '1rem',
          opacity: (isLoading || gameState !== 'betting') ? 0.6 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #000',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Processing...
          </div>
        ) : autoBetEnabled ? (
          `🤖 Auto Bet (${currentAutoBetCount}/${autoBetCount})`
        ) : (
          `🎲 Place Bet - ₹${betAmount.toLocaleString()}`
        )}
        
        {/* Button Shimmer Effect */}
        {!isLoading && gameState === 'betting' && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }} />
        )}
      </button>

      {/* Extended Statistics */}
      {showStats && (
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1rem'
        }}>
          <h5 style={{ 
            color: 'var(--primary-gold)', 
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            📊 Detailed Statistics
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', fontWeight: '800' }}>
                {stats.totalBets}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Bets</div>
            </div>
            
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div style={{ color: 'var(--accent-green)', fontSize: '1.8rem', fontWeight: '800' }}>
                ₹{stats.totalAmount.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Wagered</div>
            </div>
            
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', fontWeight: '800' }}>
                ₹{Math.round(stats.avgBet)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Average Bet</div>
            </div>
            
            <div className="stat-card" style={{ padding: '1rem' }}>
              <div style={{ 
                color: stats.winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-red)', 
                fontSize: '1.8rem', 
                fontWeight: '800' 
              }}>
                {stats.winRate.toFixed(1)}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Win Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Win/Loss Graph */}
      {showGraph && <WinLossGraph />}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalBettingPanel; 