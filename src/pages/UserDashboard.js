import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, walletBalance, achievements: authAchievements, userStats: authUserStats } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    winStreak: 0,
    favoriteGame: '',
    totalWagered: 0,
    totalWon: 0,
    gamesPlayed: 0,
    level: 1,
    xp: 0,
    nextLevelXP: 1000
  });
  const [achievements, setAchievements] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Use real data from auth context
    const realUserStats = {
      ...authUserStats,
      totalLosses: authUserStats.totalBets - authUserStats.totalWins,
      level: Math.floor(authUserStats.totalBets / 10) + 1,
      xp: (authUserStats.totalBets % 10) * 100,
      nextLevelXP: 1000
    };
    setUserStats(realUserStats);

    // Use real achievements from auth context
    setAchievements(authAchievements.map(achievement => ({
      ...achievement,
      reward: `₹${achievement.reward}`
    })));

    setRecentGames([
      { id: 1, game: 'Card Match', result: 'win', amount: 500, multiplier: 2.5, time: '2 minutes ago' },
  
      { id: 3, game: 'Dice Roll', result: 'win', amount: 750, multiplier: 3.2, time: '1 hour ago' },
      { id: 4, game: 'Flip Coin', result: 'win', amount: 300, multiplier: 2.0, time: '2 hours ago' },
      { id: 5, game: 'Roulette', result: 'loss', amount: 400, multiplier: 0, time: '3 hours ago' }
    ]);

    setFriends([
      { id: 1, name: 'Raj Patel', level: 12, status: 'online', lastSeen: 'Online now' },
      { id: 2, name: 'Priya Sharma', level: 8, status: 'offline', lastSeen: '2 hours ago' },
      { id: 3, name: 'Vikram Singh', level: 15, status: 'playing', lastSeen: 'Playing Dice Roll' }
    ]);

    setNotifications([
      { id: 1, type: 'achievement', message: 'You unlocked the "Hot Streak" achievement!', time: '5 minutes ago', read: false },
      { id: 2, type: 'bonus', message: 'Daily login bonus: ₹50 added to your account', time: '1 hour ago', read: false },
      { id: 3, type: 'friend', message: 'Raj Patel sent you a friend request', time: '2 hours ago', read: true },
      { id: 4, type: 'promotion', message: 'Weekend Special: 50% bonus on deposits!', time: '1 day ago', read: true }
    ]);

    setLeaderboard([
      { rank: 1, name: 'ProGamer123', wins: 892, winnings: '₹2.5L' },
      { rank: 2, name: 'LuckyPlayer', wins: 756, winnings: '₹1.8L' },
      { rank: 3, name: 'You', wins: 128, winnings: '₹52K' },
      { rank: 4, name: 'CardMaster', wins: 445, winnings: '₹95K' },
      { rank: 5, name: 'DiceKing', wins: 389, winnings: '₹78K' }
    ]);
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount?.toLocaleString() || '0'}`;
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'achievement': return '🏆';
      case 'bonus': return '💰';
      case 'friend': return '👥';
      case 'promotion': return '🎁';
      default: return '📢';
    }
  };

  const getXPProgress = () => {
    const currentLevelXP = (userStats.level - 1) * 1000;
    const progress = ((userStats.xp - currentLevelXP) / (userStats.nextLevelXP - currentLevelXP)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '900',
          color: 'var(--primary-gold)',
          marginBottom: '0.5rem'
        }}>
          Welcome back, {user?.email?.split('@')[0] || 'Player'}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Level {userStats.level} Player • {formatCurrency(walletBalance)} Balance
        </p>
        
        {/* XP Progress Bar */}
        <div style={{ margin: '1rem auto', maxWidth: '400px' }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '0.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, var(--primary-gold), var(--secondary-gold))',
              height: '20px',
              borderRadius: '15px',
              width: `${getXPProgress()}%`,
              transition: 'width 0.3s ease',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#000',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}>
                {userStats.xp}/{userStats.nextLevelXP} XP
              </div>
            </div>
          </div>
        </div>
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
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'achievements', label: '🏆 Achievements', icon: '🏆' },
          { id: 'friends', label: '👥 Friends', icon: '👥' },
          { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
          { id: 'leaderboard', label: '🥇 Leaderboard', icon: '🥇' },
          { id: 'profile', label: '⚙️ Profile', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'primary-btn' : 'secondary-btn'}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '0.95rem',
              minWidth: '140px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="game-area">
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '1rem' }}>
                Win Rate
              </h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                  {((userStats.totalWins / userStats.totalBets) * 100).toFixed(1)}%
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {userStats.totalWins} wins out of {userStats.totalBets} games
                </p>
              </div>
            </div>

            <div className="game-area">
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '1rem' }}>
                Biggest Win
              </h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                  {formatCurrency(userStats.biggestWin)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Single game maximum
                </p>
              </div>
            </div>

            <div className="game-area">
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>🔥</div>
              <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '1rem' }}>
                Win Streak
              </h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                  {userStats.winStreak}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Consecutive wins
                </p>
              </div>
            </div>

            <div className="game-area">
              <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>🎮</div>
              <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '1rem' }}>
                Favorite Game
              </h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {userStats.favoriteGame}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Most played
                </p>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="game-area">
            <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              🕒 Recent Games
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recentGames.map(game => (
                <div
                  key={game.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    marginBottom: '0.8rem'
                  }}
                >
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      {game.game}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      {game.time}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: game.result === 'win' ? 'var(--accent-green)' : 'var(--accent-red)',
                      marginBottom: '0.3rem'
                    }}>
                      {game.result === 'win' ? '+' : '-'}{formatCurrency(game.amount)}
                    </div>
                    {game.multiplier > 0 && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {game.multiplier}x multiplier
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <>
          <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
            🏆 Achievements
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className="game-area"
                style={{
                  opacity: achievement.unlocked ? 1 : 0.6,
                  border: achievement.unlocked ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {achievement.unlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'var(--accent-green)',
                    color: '#000',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    ✓ UNLOCKED
                  </div>
                )}
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {achievement.icon}
                </div>
                <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {achievement.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
                  {achievement.description}
                </p>
                
                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Progress
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                        {achievement.progress || 0}/{achievement.target}
                      </span>
                    </div>
                    <div style={{
                      background: 'var(--glass-bg)',
                      borderRadius: '10px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(90deg, var(--primary-gold), var(--secondary-gold))',
                        height: '100%',
                        width: `${Math.min(100, ((achievement.progress || 0) / achievement.target) * 100)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{
                  background: 'var(--glass-bg)',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                    Reward: {achievement.reward}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <>
          <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
            👥 Friends
          </h2>
          
          {/* Add Friend */}
          <div className="game-area" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>Add Friend</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Enter friend's username or email"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              <button className="primary-btn" style={{ padding: '0.8rem 1.5rem' }}>
                Send Request
              </button>
            </div>
          </div>

          {/* Friends List */}
          <div className="game-area">
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
              Your Friends ({friends.length})
            </h3>
            {friends.map(friend => (
              <div
                key={friend.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--primary-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#000'
                  }}>
                    {friend.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      {friend.name}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      Level {friend.level} • {friend.lastSeen}
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: friend.status === 'online' ? 'var(--accent-green)' : 
                             friend.status === 'playing' ? 'var(--primary-gold)' : 'var(--glass-bg)',
                  color: friend.status === 'online' ? '#000' : 
                         friend.status === 'playing' ? '#000' : 'var(--text-secondary)'
                }}>
                  {friend.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <>
          <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
            🔔 Notifications
          </h2>
          <div className="game-area">
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: notification.read ? 'var(--glass-bg)' : 'rgba(255, 215, 0, 0.1)',
                  border: `1px solid ${notification.read ? 'var(--border-color)' : 'var(--primary-gold)'}`,
                  borderRadius: '12px',
                  marginBottom: '0.8rem'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem 0' }}>
                    {notification.message}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent-green)'
                  }}></div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <>
          <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
            🥇 Weekly Leaderboard
          </h2>
          <div className="game-area">
            {leaderboard.map((player, index) => (
              <div
                key={player.rank}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: player.name === 'You' ? 'rgba(255, 215, 0, 0.1)' : 'var(--glass-bg)',
                  border: player.name === 'You' ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: player.rank <= 3 ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: '900',
                    color: player.rank <= 3 ? '#000' : 'var(--text-primary)'
                  }}>
                    {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : player.rank}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      {player.name}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      {player.wins} wins
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--accent-green)'
                }}>
                  {player.winnings}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
            ⚙️ Profile Settings
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Personal Information */}
            <div className="game-area">
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
                Personal Information
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your display name"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button className="primary-btn" style={{ width: '100%' }}>
                Update Profile
              </button>
            </div>

            {/* Account Settings */}
            <div className="game-area">
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
                Account Settings
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" />
                  <span style={{ color: 'var(--text-primary)' }}>Email notifications</span>
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ color: 'var(--text-primary)' }}>Push notifications</span>
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" />
                  <span style={{ color: 'var(--text-primary)' }}>Marketing communications</span>
                </label>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Daily Loss Limit
                </label>
                <input
                  type="number"
                  placeholder="₹5000"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <button className="secondary-btn" style={{ width: '100%', marginBottom: '1rem' }}>
                Change Password
              </button>
              <button className="secondary-btn" style={{ width: '100%', background: 'var(--accent-red)', color: '#fff' }}>
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        <Link to="/payment" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          💳
        </Link>
        <Link to="/" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--primary-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          textDecoration: 'none',
          color: '#000',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🎮
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard; 