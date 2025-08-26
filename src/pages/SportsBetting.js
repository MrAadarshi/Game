import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';

const SportsBetting = () => {
  const { user, walletBalance, placeBet } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [betAmount, setBetAmount] = useState(50);
  const [activeBets, setActiveBets] = useState([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  
  // Mock sports data
  const [sportsData, setSportsData] = useState({
    cricket: [
      {
        id: 'ipl_1',
        tournament: 'IPL 2024',
        teams: ['Mumbai Indians', 'Chennai Super Kings'],
        status: 'live',
        time: 'Live - 12.3 overs',
        odds: {
          'Mumbai Indians': 1.85,
          'Chennai Super Kings': 1.95,
          'draw': 15.5
        },
        markets: ['Match Winner', 'Top Batsman', 'Total Runs', 'Next Wicket']
      },
      {
        id: 'ipl_2',
        tournament: 'IPL 2024',
        teams: ['Royal Challengers Bangalore', 'Delhi Capitals'],
        status: 'upcoming',
        time: 'Today 7:30 PM',
        odds: {
          'Royal Challengers Bangalore': 2.1,
          'Delhi Capitals': 1.75,
          'draw': 18.0
        },
        markets: ['Match Winner', 'Toss Winner', 'Highest Opening Partnership']
      },
      {
        id: 'world_cup',
        tournament: 'T20 World Cup',
        teams: ['India', 'Australia'],
        status: 'upcoming',
        time: 'Tomorrow 2:00 PM',
        odds: {
          'India': 1.65,
          'Australia': 2.25,
          'draw': 20.0
        },
        markets: ['Match Winner', 'Player of the Match', 'Total Sixes']
      }
    ],
    football: [
      {
        id: 'epl_1',
        tournament: 'Premier League',
        teams: ['Manchester City', 'Liverpool'],
        status: 'live',
        time: '67\' - Second Half',
        odds: {
          'Manchester City': 2.1,
          'Liverpool': 3.2,
          'draw': 3.5
        },
        markets: ['Full Time Result', 'Both Teams to Score', 'Total Goals', 'Next Goal']
      },
      {
        id: 'laliga_1',
        tournament: 'La Liga',
        teams: ['Real Madrid', 'Barcelona'],
        status: 'upcoming',
        time: 'Sunday 9:00 PM',
        odds: {
          'Real Madrid': 2.5,
          'Barcelona': 2.8,
          'draw': 3.1
        },
        markets: ['Full Time Result', 'First Goal Scorer', 'Half Time/Full Time']
      }
    ],
    kabaddi: [
      {
        id: 'pkl_1',
        tournament: 'Pro Kabaddi League',
        teams: ['Patna Pirates', 'U Mumba'],
        status: 'live',
        time: '2nd Half - 8:45 left',
        odds: {
          'Patna Pirates': 1.9,
          'U Mumba': 1.9,
          'draw': 25.0
        },
        markets: ['Match Winner', 'Total Points', 'Highest Scoring Half']
      }
    ]
  });

  // Live odds updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSportsData(prev => ({
        ...prev,
        [selectedSport]: prev[selectedSport].map(match => ({
          ...match,
          odds: Object.fromEntries(
            Object.entries(match.odds).map(([team, odds]) => [
              team,
              Math.max(1.1, odds + (Math.random() - 0.5) * 0.1)
            ])
          )
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSport]);

  const sports = [
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'kabaddi', name: 'Kabaddi', icon: '🤼' }
  ];

  const betTypes = [
    { id: 'single', name: 'Single Bet', description: 'Bet on one outcome' },
    { id: 'accumulator', name: 'Accumulator', description: 'Combine multiple bets' },
    { id: 'system', name: 'System Bet', description: 'Multiple combinations' }
  ];

  const placeSportsBet = (matchId, team, odds, betType = 'match_winner') => {
    if (!user || betAmount > walletBalance) return;

    const bet = {
      id: Date.now(),
      matchId,
      team,
      odds,
      amount: betAmount,
      betType,
      potentialWin: betAmount * odds,
      timestamp: new Date(),
      status: 'pending'
    };

    if (placeBet(betAmount, 0, 'sports_betting')) {
      setSelectedBets(prev => [...prev, bet]);
      updateChallengeProgress('games_played');
      
      // Show bet slip
      setShowBetSlip(true);
    }
  };

  const confirmBets = () => {
    setActiveBets(prev => [...prev, ...selectedBets]);
    setSelectedBets([]);
    setShowBetSlip(false);
    
    // Check achievements
    checkAchievement('first_win', { wins: 1 });
    if (selectedBets.some(bet => bet.amount >= 500)) {
      checkAchievement('high_roller', { amount: 500 });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'var(--accent-green)';
      case 'upcoming': return 'var(--primary-gold)';
      case 'finished': return 'var(--text-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live': return '🔴';
      case 'upcoming': return '⏰';
      case 'finished': return '✅';
      default: return '📅';
    }
  };

  const quickBets = [10, 25, 50, 100, 250, 500];

  return (
    <div className="container animate-fadeInUp" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--primary-gold)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          fontWeight: '900'
        }}>
          🏆 Sports Betting
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Bet on live and upcoming sports matches with competitive odds!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Sport Selection */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                style={{
                  padding: '1rem 2rem',
                  background: selectedSport === sport.id ? 
                    'linear-gradient(135deg, var(--accent-green), #00CC70)' : 
                    'var(--glass-bg)',
                  color: selectedSport === sport.id ? '#000' : 'var(--text-primary)',
                  border: `1px solid ${selectedSport === sport.id ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {sport.icon} {sport.name}
              </button>
            ))}
          </div>

          {/* Live Matches Section */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🔴 Live Matches
            </h2>

            {sportsData[selectedSport]
              .filter(match => match.status === 'live')
              .map(match => (
                <div
                  key={match.id}
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid var(--accent-green)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{
                        color: 'var(--accent-green)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        {getStatusIcon(match.status)} {match.tournament} - {match.time}
                      </div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {match.teams[0]} vs {match.teams[1]}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      color: 'var(--accent-green)',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      LIVE
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                  }}>
                    {Object.entries(match.odds).map(([team, odds]) => (
                      <button
                        key={team}
                        onClick={() => placeSportsBet(match.id, team, odds)}
                        style={{
                          padding: '1rem',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'var(--accent-green)';
                          e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'var(--border-color)';
                          e.target.style.background = 'var(--glass-bg)';
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {team}
                        </div>
                        <div style={{
                          color: 'var(--accent-green)',
                          fontSize: '1.1rem',
                          fontWeight: '700'
                        }}>
                          {odds.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Upcoming Matches */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⏰ Upcoming Matches
            </h2>

            {sportsData[selectedSport]
              .filter(match => match.status === 'upcoming')
              .map(match => (
                <div
                  key={match.id}
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid var(--primary-gold)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{
                        color: 'var(--primary-gold)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        {getStatusIcon(match.status)} {match.tournament} - {match.time}
                      </div>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {match.teams[0]} vs {match.teams[1]}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                  }}>
                    {Object.entries(match.odds).map(([team, odds]) => (
                      <button
                        key={team}
                        onClick={() => placeSportsBet(match.id, team, odds)}
                        style={{
                          padding: '1rem',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'var(--primary-gold)';
                          e.target.style.background = 'rgba(255, 215, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'var(--border-color)';
                          e.target.style.background = 'var(--glass-bg)';
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          {team}
                        </div>
                        <div style={{
                          color: 'var(--primary-gold)',
                          fontSize: '1.1rem',
                          fontWeight: '700'
                        }}>
                          {odds.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Bet Slip */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              🎫 Bet Slip
              {selectedBets.length > 0 && (
                <span style={{
                  background: 'var(--accent-green)',
                  color: '#000',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {selectedBets.length}
                </span>
              )}
            </h3>

            {selectedBets.length > 0 ? (
              <div>
                {selectedBets.map((bet, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {bet.team}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>Odds: {bet.odds.toFixed(2)}</span>
                      <span>Stake: ₹{bet.amount}</span>
                    </div>
                    <div style={{
                      color: 'var(--accent-green)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginTop: '0.5rem'
                    }}>
                      Potential Win: ₹{bet.potentialWin.toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={confirmBets}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Place Bets (₹{selectedBets.reduce((sum, bet) => sum + bet.amount, 0)})
                </button>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                padding: '2rem 0'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p>Select odds to add bets to your slip</p>
              </div>
            )}
          </div>

          {/* Betting Controls */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              💰 Bet Amount
            </h3>
            
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
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />

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

          {/* Active Bets */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📊 Active Bets
            </h3>
            
            {activeBets.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {activeBets.map((bet, index) => (
                  <div
                    key={bet.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '0.8rem',
                      marginBottom: '0.5rem',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {bet.team}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.3rem'
                    }}>
                      <span>₹{bet.amount}</span>
                      <span style={{ color: 'var(--primary-gold)' }}>
                        {bet.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                padding: '1rem 0'
              }}>
                No active bets
              </div>
            )}
          </div>

          {/* Sports Info */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              ℹ️ How to Bet
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.8rem' }}>
                1. Select a sport and match
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                2. Choose your betting amount
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                3. Click on odds to add to bet slip
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                4. Confirm your bets
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                💡 Higher odds = Higher risk & reward
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBetting; 