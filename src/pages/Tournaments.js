import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationHelper } from '../utils/notificationHelper';

const Tournaments = () => {
  const { user, walletBalance } = useAuth();
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [userTournaments, setUserTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = () => {
    // Mock tournament data - replace with real API calls
    const mockActiveTournaments = [
      {
        id: 'weekly_jackpot',
        name: 'Weekly Jackpot Championship',
        game: 'All Games',
        type: 'leaderboard',
        entryFee: 100,
        prizePool: 50000,
        maxParticipants: 1000,
        currentParticipants: 347,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
        status: 'active',
        description: 'Compete in all games to earn points. Top 50 players win prizes!',
        prizes: [
          { position: '1st', reward: '₹15,000' },
          { position: '2nd', reward: '₹10,000' },
          { position: '3rd', reward: '₹7,500' },
          { position: '4th-10th', reward: '₹2,000 each' },
          { position: '11th-50th', reward: '₹500 each' }
        ],
        leaderboard: [
          { rank: 1, player: 'CryptoKing', points: 2850, winnings: '₹12,450' },
          { rank: 2, player: 'LuckyPlayer99', points: 2720, winnings: '₹8,920' },
          { rank: 3, player: 'GamingPro', points: 2650, winnings: '₹7,800' },
          { rank: 4, player: 'You', points: 1890, winnings: '₹3,450' },
          { rank: 5, player: 'HighRoller', points: 1820, winnings: '₹4,200' }
        ]
      },

      {
        id: 'slot_sprint',
        name: 'Slot Machine Sprint',
        game: 'Slot Machine',
        type: 'time_based',
        entryFee: 25,
        prizePool: 8000,
        maxParticipants: 200,
        currentParticipants: 156,
        startTime: new Date(Date.now() + 30 * 60 * 1000), // Starts in 30 minutes
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 1.5 hour duration
        status: 'starting_soon',
        description: '1-hour sprint! Most wins in slot machine takes the prize.',
        prizes: [
          { position: '1st', reward: '₹4,000' },
          { position: '2nd', reward: '₹2,400' },
          { position: '3rd', reward: '₹1,200' },
          { position: '4th-10th', reward: '₹200 each' }
        ]
      }
    ];

    const mockPastTournaments = [
      {
        id: 'dice_championship',
        name: 'Dice Roll Championship',
        game: 'Dice Roll',
        type: 'leaderboard',
        entryFee: 75,
        prizePool: 20000,
        participants: 267,
        winner: 'DiceMaster',
        winningAmount: '₹8,000',
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
        userRank: 12,
        userWinnings: '₹750'
      },
      {
        id: 'color_prediction_cup',
        name: 'Color Prediction Cup',
        game: 'Color Prediction',
        type: 'elimination',
        entryFee: 30,
        prizePool: 12000,
        participants: 400,
        winner: 'ColorKing',
        winningAmount: '₹6,000',
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        userRank: null,
        userWinnings: '₹0'
      }
    ];

    setActiveTournaments(mockActiveTournaments);
    setPastTournaments(mockPastTournaments);
    
    // Mock user's registered tournaments
          setUserTournaments(['weekly_jackpot']);
  };

  const joinTournament = async (tournament) => {
    if (walletBalance < tournament.entryFee) {
      notificationHelper.showErrorNotification(`Insufficient balance! Need ₹${tournament.entryFee} to join this tournament.`);
      return;
    }

    try {
      // Simulate joining tournament
      console.log('Joining tournament:', tournament.name);
      
      // Add to user tournaments
      setUserTournaments(prev => [...prev, tournament.id]);
      
      // Update tournament participants
      setActiveTournaments(prev => 
        prev.map(t => 
          t.id === tournament.id 
            ? { ...t, currentParticipants: t.currentParticipants + 1 }
            : t
        )
      );

      notificationHelper.showSuccessNotification(`Successfully joined ${tournament.name}! Good luck!`);
    } catch (error) {
      notificationHelper.showErrorNotification('Failed to join tournament. Please try again.');
    }
  };

  const leaveTournament = async (tournament) => {
    try {
      // Simulate leaving tournament
      console.log('Leaving tournament:', tournament.name);
      
      // Remove from user tournaments
      setUserTournaments(prev => prev.filter(id => id !== tournament.id));
      
      // Update tournament participants
      setActiveTournaments(prev => 
        prev.map(t => 
          t.id === tournament.id 
            ? { ...t, currentParticipants: t.currentParticipants - 1 }
            : t
        )
      );

      notificationHelper.showInAppNotification('Left Tournament', `You've left ${tournament.name}. Entry fee refunded.`, 'info');
    } catch (error) {
      notificationHelper.showErrorNotification('Failed to leave tournament. Please try again.');
    }
  };

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--accent-green)';
      case 'registration': return 'var(--primary-gold)';
      case 'starting_soon': return 'var(--accent-color)';
      case 'completed': return 'var(--text-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  const getStatusText = (tournament) => {
    switch (tournament.status) {
      case 'active': return 'Live Now';
      case 'registration': return 'Registration Open';
      case 'starting_soon': return 'Starting Soon';
      case 'completed': return 'Completed';
      default: return tournament.status;
    }
  };

  const TournamentCard = ({ tournament, isPast = false }) => (
    <div className="game-area" style={{
      border: userTournaments.includes(tournament.id) ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {userTournaments.includes(tournament.id) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'var(--accent-green)',
          color: '#000',
          padding: '0.3rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: '700'
        }}>
          JOINED
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.8rem'
        }}>
          <h3 style={{
            color: 'var(--primary-gold)',
            fontSize: '1.1rem',
            fontWeight: '700',
            margin: 0,
            flex: 1
          }}>
            {tournament.name}
          </h3>
          <div style={{
            background: getStatusColor(tournament.status),
            color: tournament.status === 'completed' ? 'var(--text-primary)' : '#000',
            padding: '0.3rem 0.8rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: '700',
            marginLeft: '1rem'
          }}>
            {getStatusText(tournament)}
          </div>
        </div>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>
          {tournament.description}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Game</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{tournament.game}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Entry Fee</div>
            <div style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>₹{tournament.entryFee}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Prize Pool</div>
            <div style={{ color: 'var(--accent-green)', fontWeight: '700' }}>₹{tournament.prizePool.toLocaleString()}</div>
          </div>
          {!isPast && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Time Left</div>
              <div style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{formatTimeLeft(tournament.endTime)}</div>
            </div>
          )}
        </div>

        {!isPast && (
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            padding: '0.8rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Participants
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                {tournament.currentParticipants}/{tournament.maxParticipants}
              </span>
            </div>
            <div style={{
              background: 'var(--border-color)',
              borderRadius: '4px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'var(--accent-green)',
                height: '100%',
                width: `${(tournament.currentParticipants / tournament.maxParticipants) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {isPast && tournament.userRank && (
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            padding: '0.8rem',
            marginBottom: '1rem'
          }}>
            <div style={{ color: 'var(--primary-gold)', fontWeight: '600', marginBottom: '0.3rem' }}>
              Your Result
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rank: #{tournament.userRank}</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                {tournament.userWinnings}
              </span>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap'
        }}>
          {!isPast && !userTournaments.includes(tournament.id) && tournament.status === 'registration' && (
            <button
              onClick={() => joinTournament(tournament)}
              className="primary-btn"
              style={{ flex: 1, minWidth: '120px' }}
            >
              Join Tournament
            </button>
          )}
          
          {!isPast && userTournaments.includes(tournament.id) && tournament.status === 'registration' && (
            <button
              onClick={() => leaveTournament(tournament)}
              className="secondary-btn"
              style={{ flex: 1, minWidth: '120px' }}
            >
              Leave Tournament
            </button>
          )}

          <button
            onClick={() => setSelectedTournament(tournament)}
            className="secondary-btn"
            style={{ flex: 1, minWidth: '120px' }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.05))',
        border: '1px solid var(--primary-gold)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '900',
          color: 'var(--primary-gold)',
          marginBottom: '0.5rem'
        }}>
          Tournaments & Competitions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Compete with players worldwide for massive prize pools!
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'active', label: '🔥 Active Tournaments', count: activeTournaments.length },
          { id: 'past', label: '📜 Past Tournaments', count: pastTournaments.length },
          { id: 'my', label: '👤 My Tournaments', count: userTournaments.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'primary-btn' : 'secondary-btn'}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '0.95rem',
              minWidth: '160px',
              position: 'relative'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--accent-red)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tournaments */}
      {activeTab === 'active' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {activeTournaments.map(tournament => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

      {/* Past Tournaments */}
      {activeTab === 'past' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {pastTournaments.map(tournament => (
            <TournamentCard key={tournament.id} tournament={tournament} isPast={true} />
          ))}
        </div>
      )}

      {/* My Tournaments */}
      {activeTab === 'my' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {activeTournaments
            .filter(tournament => userTournaments.includes(tournament.id))
            .map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          {pastTournaments
            .filter(tournament => tournament.userRank)
            .map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} isPast={true} />
            ))}
        </div>
      )}

      {/* Tournament Detail Modal */}
      {selectedTournament && (
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
          zIndex: 2000,
          backdropFilter: 'blur(10px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '20px',
            padding: '2rem',
            border: '2px solid var(--primary-gold)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                color: 'var(--primary-gold)',
                fontSize: '1.5rem',
                fontWeight: '900',
                margin: 0
              }}>
                {selectedTournament.name}
              </h2>
              <button
                onClick={() => setSelectedTournament(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Prize Structure */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
                Prize Structure
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTournament.prizes.map((prize, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.8rem',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {prize.position}
                    </span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                      {prize.reward}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            {selectedTournament.leaderboard && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
                  Current Leaderboard
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedTournament.leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.8rem',
                        background: entry.player === 'You' ? 'rgba(255, 215, 0, 0.1)' : 'var(--glass-bg)',
                        borderRadius: '8px',
                        border: entry.player === 'You' ? '1px solid var(--primary-gold)' : '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: entry.rank <= 3 ? 'var(--primary-gold)' : 'var(--glass-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: entry.rank <= 3 ? '#000' : 'var(--text-primary)'
                        }}>
                          {entry.rank}
                        </div>
                        <div>
                          <div style={{ 
                            color: 'var(--text-primary)', 
                            fontWeight: entry.player === 'You' ? '700' : '400'
                          }}>
                            {entry.player}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {entry.points} points
                          </div>
                        </div>
                      </div>
                      <div style={{
                        color: 'var(--accent-green)',
                        fontWeight: '700'
                      }}>
                        {entry.winnings}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedTournament(null)}
              className="primary-btn"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments; 