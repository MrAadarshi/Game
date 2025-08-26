import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const TournamentSystem = () => {
  const { user } = useAuth();
  const { coins, updateVirtualBalance } = useVirtualCurrency();
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [userTournaments, setUserTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Tournament Templates with revenue calculations
  const tournamentTemplates = [
    {
      id: 'daily_quick',
      name: 'Daily Quick Tournament',
      game: 'Color Prediction',
      entryFee: 100, // 100 coins
      maxParticipants: 50,
      duration: '30 minutes',
      prizePool: 3500, // 70% of total fees (50 × 100 × 0.7)
      yourProfit: 1500, // 30% of total fees (50 × 100 × 0.3)
      prizes: {
        1: 1500, // 1st place
        2: 1000, // 2nd place
        3: 600,  // 3rd place
        4: 400   // 4th-5th place (200 each)
      },
      icon: '⚡',
      type: 'quick',
      difficulty: 'easy'
    },
    {
      id: 'weekly_premium',
      name: 'Weekly Premium Challenge',
      game: 'Multiple Games',
      entryFee: 500, // 500 coins
      maxParticipants: 100,
      duration: '3 days',
      prizePool: 35000, // 70% of total fees
      yourProfit: 15000, // 30% of total fees
      prizes: {
        1: 15000,
        2: 10000,
        3: 5000,
        4: 3000,
        5: 2000
      },
      icon: '👑',
      type: 'premium',
      difficulty: 'medium',
      vipOnly: false
    },
    {
      id: 'mega_championship',
      name: 'Mega Championship',
      game: 'All Games',
      entryFee: 1000, // 1000 coins
      maxParticipants: 200,
      duration: '1 week',
      prizePool: 140000, // 70% of total fees
      yourProfit: 60000, // 30% of total fees
      prizes: {
        1: 50000,
        2: 30000,
        3: 20000,
        4: 15000,
        5: 10000,
        6: 8000,
        7: 5000,
        8: 2000
      },
      icon: '🏆',
      type: 'championship',
      difficulty: 'hard',
      vipOnly: false
    },
    {
      id: 'vip_exclusive',
      name: 'VIP Exclusive Tournament',
      game: 'Aviator',
      entryFee: 2000, // 2000 coins
      maxParticipants: 30,
      duration: '2 hours',
      prizePool: 42000, // 70% of total fees
      yourProfit: 18000, // 30% of total fees
      prizes: {
        1: 20000,
        2: 12000,
        3: 6000,
        4: 3000,
        5: 1000
      },
      icon: '💎',
      type: 'vip',
      difficulty: 'expert',
      vipOnly: true
    }
  ];

  useEffect(() => {
    generateActiveTournaments();
    loadUserTournaments();
  }, []);

  const generateActiveTournaments = () => {
    // Generate random active tournaments
    const now = new Date();
    const tournaments = tournamentTemplates.map(template => {
      const startTime = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours from now
      const endTime = new Date(startTime.getTime() + parseDuration(template.duration));
      
      return {
        ...template,
        tournamentId: `${template.id}_${Date.now()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        participants: Math.floor(Math.random() * template.maxParticipants * 0.7), // 0-70% filled
        status: startTime <= now ? 'active' : 'upcoming'
      };
    });
    
    setActiveTournaments(tournaments);
  };

  const parseDuration = (duration) => {
    const time = duration.toLowerCase();
    if (time.includes('minute')) {
      const minutes = parseInt(time.match(/\d+/)[0]);
      return minutes * 60 * 1000;
    } else if (time.includes('hour')) {
      const hours = parseInt(time.match(/\d+/)[0]);
      return hours * 60 * 60 * 1000;
    } else if (time.includes('day')) {
      const days = parseInt(time.match(/\d+/)[0]);
      return days * 24 * 60 * 60 * 1000;
    } else if (time.includes('week')) {
      const weeks = parseInt(time.match(/\d+/)[0]);
      return weeks * 7 * 24 * 60 * 60 * 1000;
    }
    return 60 * 60 * 1000; // Default 1 hour
  };

  const loadUserTournaments = () => {
    try {
      const userTournamentsData = JSON.parse(localStorage.getItem(`tournaments_${user?.uid}`) || '[]');
      setUserTournaments(userTournamentsData);
    } catch (error) {
      console.error('Error loading user tournaments:', error);
    }
  };

  const handleJoinTournament = async (tournament) => {
    if (!user) {
      setMessage('❌ Please login to join tournaments');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (tournament.entryFee > coins) {
      setMessage('❌ Insufficient coins! Earn more coins to join this tournament.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (tournament.participants >= tournament.maxParticipants) {
      setMessage('❌ Tournament is full!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (userTournaments.some(t => t.tournamentId === tournament.tournamentId)) {
      setMessage('❌ You are already registered for this tournament!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('Joining tournament...');

    try {
      // Deduct entry fee
      await updateVirtualBalance(-tournament.entryFee, 0, `Tournament entry: ${tournament.name}`);

      // Add user to tournament
      const userEntry = {
        ...tournament,
        joinDate: new Date().toISOString(),
        status: 'registered',
        position: null,
        winnings: 0
      };

      const updatedUserTournaments = [...userTournaments, userEntry];
      setUserTournaments(updatedUserTournaments);
      localStorage.setItem(`tournaments_${user.uid}`, JSON.stringify(updatedUserTournaments));

      // Update tournament participants
      const updatedTournaments = activeTournaments.map(t => 
        t.tournamentId === tournament.tournamentId 
          ? { ...t, participants: t.participants + 1 }
          : t
      );
      setActiveTournaments(updatedTournaments);

      // Track revenue
      trackTournamentRevenue({
        type: 'tournament',
        tournamentId: tournament.tournamentId,
        tournamentName: tournament.name,
        entryFee: tournament.entryFee,
        profit: tournament.entryFee * 0.3, // 30% profit
        userId: user.uid
      });

      setMessage(`🎉 Successfully joined ${tournament.name}! Good luck!`);
      setTimeout(() => setMessage(''), 5000);

    } catch (error) {
      console.error('Tournament join error:', error);
      setMessage('❌ Failed to join tournament. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const trackTournamentRevenue = (revenueData) => {
    const existingRevenue = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
    existingRevenue.push({
      ...revenueData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('revenue_tracking', JSON.stringify(existingRevenue));
    
    console.log('🏆 Tournament Revenue tracked:', revenueData);
  };

  const simulateTournamentEnd = (tournament) => {
    // Simulate tournament completion with random results
    const positions = [1, 2, 3, 4, 5];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const winnings = tournament.prizes[randomPosition] || 0;

    if (winnings > 0) {
      updateVirtualBalance(winnings, 0, `Tournament prize: ${tournament.name} - ${randomPosition} place`);
      setMessage(`🏆 Tournament ended! You finished ${randomPosition} place and won ${winnings} coins!`);
    } else {
      setMessage(`🎯 Tournament ended! Better luck next time!`);
    }

    // Update user tournament status
    const updatedUserTournaments = userTournaments.map(t => 
      t.tournamentId === tournament.tournamentId 
        ? { ...t, status: 'completed', position: randomPosition, winnings }
        : t
    );
    setUserTournaments(updatedUserTournaments);
    localStorage.setItem(`tournaments_${user.uid}`, JSON.stringify(updatedUserTournaments));

    setTimeout(() => setMessage(''), 5000);
  };

  const getTypeColor = (type) => {
    const colors = {
      quick: '#3B82F6',
      premium: '#8B5CF6',
      championship: '#F59E0B',
      vip: '#EC4899'
    };
    return colors[type] || '#6B7280';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444',
      expert: '#8B5CF6'
    };
    return colors[difficulty] || '#6B7280';
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '1px solid #F59E0B',
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
            background: 'linear-gradient(45deg, #F59E0B, #D97706)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Tournament Arena
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Compete with players worldwide and win amazing prizes!
        </p>
      </div>

      {/* User Balance */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '12px',
        padding: '1rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>Your Balance: </span>
        <span style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', fontWeight: '800' }}>
          🪙 {coins.toLocaleString()} coins
        </span>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          background: message.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${message.includes('❌') ? 'var(--accent-red)' : 'var(--accent-green)'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'center',
          color: message.includes('❌') ? 'var(--accent-red)' : 'var(--accent-green)'
        }}>
          {message}
        </div>
      )}

      {/* My Tournaments */}
      {userTournaments.length > 0 && (
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🎯 My Tournaments ({userTournaments.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {userTournaments.slice(0, 3).map(tournament => (
              <div
                key={`my_${tournament.tournamentId}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: `1px solid ${getTypeColor(tournament.type)}`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{tournament.icon}</span>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>
                    {tournament.name}
                  </h4>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div><strong>Game:</strong> {tournament.game}</div>
                  <div><strong>Entry Fee:</strong> 🪙 {tournament.entryFee}</div>
                  <div><strong>Status:</strong> <span style={{ color: getTypeColor(tournament.type) }}>{tournament.status}</span></div>
                  {tournament.position && (
                    <div><strong>Position:</strong> {tournament.position} place</div>
                  )}
                  {tournament.winnings > 0 && (
                    <div><strong>Winnings:</strong> 🪙 {tournament.winnings}</div>
                  )}
                </div>

                {tournament.status === 'registered' && (
                  <button
                    onClick={() => simulateTournamentEnd(tournament)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#F59E0B',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🎲 Simulate End (Demo)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Tournaments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {activeTournaments.map(tournament => {
          const isJoined = userTournaments.some(t => t.tournamentId === tournament.tournamentId);
          const isFull = tournament.participants >= tournament.maxParticipants;
          const canAfford = tournament.entryFee <= coins;
          
          return (
            <div
              key={tournament.tournamentId}
              style={{
                background: 'var(--glass-bg)',
                borderRadius: '20px',
                padding: '2rem',
                border: `2px solid ${getTypeColor(tournament.type)}`,
                position: 'relative'
              }}
            >
              {/* Tournament Type Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                background: getTypeColor(tournament.type),
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {tournament.type}
              </div>

              {/* VIP Only Badge */}
              {tournament.vipOnly && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#EC4899',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  VIP ONLY
                </div>
              )}

              {/* Tournament Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingTop: '1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {tournament.icon}
                </div>
                <h2 style={{
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.5rem',
                  fontWeight: '800'
                }}>
                  {tournament.name}
                </h2>
                <div style={{
                  background: getDifficultyColor(tournament.difficulty),
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  display: 'inline-block'
                }}>
                  {tournament.difficulty}
                </div>
              </div>

              {/* Tournament Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <strong>Game:</strong><br />
                    {tournament.game}
                  </div>
                  <div>
                    <strong>Duration:</strong><br />
                    {tournament.duration}
                  </div>
                  <div>
                    <strong>Entry Fee:</strong><br />
                    🪙 {tournament.entryFee.toLocaleString()}
                  </div>
                  <div>
                    <strong>Participants:</strong><br />
                    {tournament.participants}/{tournament.maxParticipants}
                  </div>
                </div>
              </div>

              {/* Prize Pool */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid #F59E0B',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#F59E0B', margin: '0 0 0.5rem 0', textAlign: 'center' }}>
                  💰 Prize Pool: 🪙 {tournament.prizePool.toLocaleString()}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  {Object.entries(tournament.prizes).map(([position, prize]) => (
                    <div key={position} style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#F59E0B' }}>
                        {position === '1' ? '🥇' : position === '2' ? '🥈' : position === '3' ? '🥉' : `${position}th`}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        🪙 {prize.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participants Progress */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Participants: {tournament.participants}/{tournament.maxParticipants}
                  </span>
                  <span style={{ color: getTypeColor(tournament.type), fontSize: '0.9rem', fontWeight: '600' }}>
                    {((tournament.participants / tournament.maxParticipants) * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: getTypeColor(tournament.type),
                    height: '100%',
                    width: `${(tournament.participants / tournament.maxParticipants) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoinTournament(tournament)}
                disabled={loading || isJoined || isFull || !canAfford || (tournament.vipOnly && !user?.isVIP)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: isJoined ? 'var(--accent-green)' : 
                            isFull ? 'var(--glass-bg)' :
                            !canAfford ? 'var(--glass-bg)' :
                            `linear-gradient(135deg, ${getTypeColor(tournament.type)}, ${getTypeColor(tournament.type)}dd)`,
                  color: isJoined || isFull || !canAfford ? 'var(--text-secondary)' : '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: isJoined || isFull || !canAfford || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  '⏳ Joining...'
                ) : isJoined ? (
                  '✅ Joined'
                ) : isFull ? (
                  '🚫 Tournament Full'
                ) : !canAfford ? (
                  '💰 Need More Coins'
                ) : tournament.vipOnly && !user?.isVIP ? (
                  '👑 VIP Required'
                ) : (
                  `🎯 Join Tournament - 🪙 ${tournament.entryFee}`
                )}
              </button>

              {/* Tournament Timer */}
              <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                {tournament.status === 'upcoming' ? (
                  <>🕒 Starts: {new Date(tournament.startTime).toLocaleString()}</>
                ) : (
                  <>⏰ Ends: {new Date(tournament.endTime).toLocaleString()}</>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tournament Rules */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          📋 Tournament Rules & Information
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              title: '🎮 How to Play',
              rules: [
                'Join tournament before it starts',
                'Play the specified game(s)',
                'Compete for highest score/best performance',
                'Winners determined by ranking'
              ]
            },
            {
              title: '🏆 Prize Distribution',
              rules: [
                '70% of entry fees go to prize pool',
                'Top performers win biggest prizes',
                'Prizes distributed automatically',
                'Multiple tournaments daily'
              ]
            },
            {
              title: '⚡ Tournament Types',
              rules: [
                'Quick: 30 min, low entry fee',
                'Premium: Multi-day, bigger prizes',
                'Championship: Weekly mega events',
                'VIP: Exclusive high-stakes tournaments'
              ]
            }
          ].map((section, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                {section.title}
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                {section.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} style={{ marginBottom: '0.5rem' }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentSystem; 