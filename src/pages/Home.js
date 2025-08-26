import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVIP } from '../context/VIPContext';
import { useNotifications } from '../context/NotificationContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import ComplianceNotice from '../components/ComplianceNotice';

const Home = () => {
  const navigate = useNavigate();
  const { user, walletBalance, userStats } = useAuth();
  const { getVIPStats } = useVIP();
  const { getUnreadCount } = useNotifications();
  const { coins, dailyBonus } = useVirtualCurrency();
  const [liveStats, setLiveStats] = useState({
    playersOnline: 12847,
    totalCoinsEarned: 5420000,
    gamesPlayedToday: 89562,
    activePlayers: 3247
  });
  const [showComplianceNotice, setShowComplianceNotice] = useState(false);

  // Show compliance notice to users on first visit
  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('hasSeenComplianceNotice');
    if (!hasSeenNotice) {
      setShowComplianceNotice(true);
    }
  }, []);

  const handleCloseNotice = () => {
    setShowComplianceNotice(false);
    localStorage.setItem('hasSeenComplianceNotice', 'true');
  };

  // Handle game navigation
  const handleGameClick = (gameId) => {
    const gameRoutes = {
      'math-challenge': '/games/math-challenge',
      'reaction-time': '/games/reaction-time',
      'word-puzzle': '/games/word-puzzle',
      'memory-match': '/games/memory-match',
      'pattern-recognition': '/games/pattern-recognition',
      'trivia-quest': '/games/trivia-quest'
    };
    
    if (gameRoutes[gameId]) {
      navigate(gameRoutes[gameId]);
    } else {
      console.warn(`No route found for game: ${gameId}`);
    }
  };

  const vipStats = getVIPStats();
  const unreadNotifications = getUnreadCount();

  // Update live stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        playersOnline: prev.playersOnline + Math.floor(Math.random() * 20) - 10,
        totalCoinsEarned: prev.totalCoinsEarned + Math.floor(Math.random() * 5000),
        gamesPlayedToday: prev.gamesPlayedToday + Math.floor(Math.random() * 50),
        activePlayers: Math.max(2000, prev.activePlayers + Math.floor(Math.random() * 100) - 50)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num?.toLocaleString() || '0';
  };

  // Coin Arena Games
  const coinArenaGames = [
    {
      id: 'memory-match',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Test your memory skills',
      reward: '10-50 coins',
      difficulty: 'Easy',
      category: 'Brain',
      estimated_time: '2 min'
    },
    {
      id: 'math-challenge',
      name: 'Math Challenge',
      icon: '🧮',
      description: 'Solve math problems quickly',
      reward: '15-75 coins',
      difficulty: 'Medium',
      category: 'Brain',
      estimated_time: '3 min'
    },
    {
      id: 'word-puzzle',
      name: 'Word Puzzle',
      icon: '📝',
      description: 'Find hidden words',
      reward: '20-100 coins',
      difficulty: 'Medium',
      category: 'Language',
      estimated_time: '4 min'
    },
    {
      id: 'pattern-recognition',
      name: 'Pattern Master',
      icon: '🔍',
      description: 'Identify patterns quickly',
      reward: '25-125 coins',
      difficulty: 'Hard',
      category: 'Logic',
      estimated_time: '5 min'
    },
    {
      id: 'reaction-time',
      name: 'Lightning Reflexes',
      icon: '⚡',
      description: 'Test your reaction speed',
      reward: '30-150 coins',
      difficulty: 'Hard',
      category: 'Skill',
      estimated_time: '3 min'
    },
    {
      id: 'trivia-quest',
      name: 'Trivia Quest',
      icon: '❓',
      description: 'Answer knowledge questions',
      reward: '40-200 coins',
      difficulty: 'Varied',
      category: 'Knowledge',
      estimated_time: '6 min'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#00FF88';
      case 'Medium': return '#FFB400';
      case 'Hard': return '#FF4C4C';
      case 'Varied': return '#8B5CF6';
      default: return '#00FF88';
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Compliance Notice Modal */}
      {showComplianceNotice && (
        <ComplianceNotice onClose={handleCloseNotice} />
      )}

      {/* Compact Legal Compliance Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(34, 197, 94, 0.08))',
        border: '1px solid #3B82F6',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1rem' }}>🏛️</span>
        <span style={{
          color: '#3B82F6',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          Educational Skill-Based Gaming Platform
        </span>
        <span style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.85rem'
        }}>
          - Virtual Currency Only
        </span>
      </div>

      {user && (
        <>
          {/* Compact Monetization Features */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: 'var(--text-primary)',
              margin: '0 0 0.75rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              💰 Earn More & Unlock Premium Features
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem'
            }}>
              {/* Premium VIP */}
              <Link
                to="/premium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👑</div>
                <div style={{ color: '#8B5CF6', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Premium VIP
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  ₹99/month
                </div>
              </Link>

              {/* Virtual Store */}
              <Link
                to="/store"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🛒</div>
                <div style={{ color: '#F59E0B', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Virtual Store
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  From ₹29
                </div>
              </Link>

              {/* Tournaments */}
              <Link
                to="/tournaments"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))',
                  border: '1px solid #EC4899',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏆</div>
                <div style={{ color: '#EC4899', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Tournaments
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  Entry 🪙100
                </div>
              </Link>

              {/* Inventory */}
              <Link
                to="/inventory"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
                  border: '1px solid var(--accent-green)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎒</div>
                <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  My Inventory
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  Items & Themes
                </div>
              </Link>
            </div>
          </div>

          {/* Compact Teen Engagement Hub */}
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: 'var(--text-primary)',
              margin: '0 0 0.75rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🌟 Connect, Learn & Have Fun Together!
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem'
            }}>
              {/* Shorts */}
              <Link
                to="/shorts"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.1))',
                  border: '1px solid #4ADE80',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎬</div>
                <div style={{ color: '#22C55E', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Shorts Player
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  Watch & Learn
                </div>
              </Link>

              {/* Social Hub */}
              <Link
                to="/social"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.1))',
                  border: '1px solid #FB923C',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(251, 146, 60, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🌟</div>
                <div style={{ color: '#F97316', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Social Hub
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  Connect & Share
                </div>
              </Link>

              {/* Entertainment */}
              <Link
                to="/entertainment"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1))',
                  border: '1px solid #A855F7',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '80px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎭</div>
                <div style={{ color: '#A855F7', fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' }}>
                  Entertainment
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem' }}>
                  Fun Content
                </div>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Coin Arena Game Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(139, 92, 246, 0.8))',
        padding: '3rem 2rem',
        margin: '2rem 0',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 20px 50px rgba(168, 85, 247, 0.3)'
      }}>
        {/* Enhanced Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 215, 0, 0.15)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '80px',
          height: '80px',
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Main Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '2rem'
            }}>
            <div style={{ fontSize: '4rem' }}>🏟️</div>
              <div>
              <h1 style={{
                  color: '#fff',
                fontSize: '3rem',
                  fontWeight: '900',
                  margin: 0,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
                }}>
                Coin Arena Games
              </h1>
                <p style={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '1.3rem',
                margin: '0.8rem 0 0 0',
                  fontWeight: '500'
                }}>
                🧠 Skill-Based Games → Earn Real Coins → Convert to Money!
              </p>
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                marginTop: '0.5rem',
                fontWeight: '600'
              }}>
                💰 1000 coins = ₹10 | 🎯 No Gambling | 🧠 Pure Skill
              </div>
              </div>
            </div>

          {/* Enhanced Features Grid */}
            <div style={{
              display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
            }}>
              <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '16px',
                textAlign: 'center',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🧠</div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Brain Training
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Memory, Logic & Problem Solving
              </div>
              </div>
              
              <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '16px',
                textAlign: 'center',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>⚡</div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Skill Challenges
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Reaction Time & Coordination
              </div>
              </div>
              
              <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem',
              borderRadius: '16px',
                textAlign: 'center',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎓</div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Educational Fun
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Learn While You Earn
            </div>
            </div>
          </div>

          {/* Main CTA */}
          <Link to="/coin-games" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                padding: '1.8rem 3rem',
                borderRadius: '20px',
                  border: 'none',
                fontSize: '1.5rem',
                fontWeight: '900',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                boxShadow: '0 15px 30px rgba(255, 215, 0, 0.5)',
                  textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '2rem'
                }}
                onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 40px rgba(255, 215, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 15px 30px rgba(255, 215, 0, 0.5)';
                }}
              >
              🏟️ Enter Coin Arena
              </button>
            </Link>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto'
            }}>
              <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '1rem',
              borderRadius: '12px',
                textAlign: 'center'
              }}>
              <div style={{ color: '#FFD700', fontSize: '1.8rem', fontWeight: '800' }}>6+</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>Skill Games</div>
              </div>
              
              <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '1rem',
              borderRadius: '12px',
                textAlign: 'center'
              }}>
              <div style={{ color: '#00FF88', fontSize: '1.8rem', fontWeight: '800' }}>₹10</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>Per 1K Coins</div>
      </div>

      <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
        padding: '1rem',
              borderRadius: '12px',
          textAlign: 'center'
        }}>
              <div style={{ color: '#FF6B6B', fontSize: '1.8rem', fontWeight: '800' }}>24/7</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>Available</div>
          </div>
          
      <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '1rem',
        borderRadius: '12px',
              textAlign: 'center'
      }}>
              <div style={{ color: '#8B5CF6', fontSize: '1.8rem', fontWeight: '800' }}>100%</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>Skill Based</div>
          </div>
        </div>
        </div>
      </div>

      {/* Coin Arena Games Preview Grid */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
          color: 'var(--primary-gold)',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '800'
        }}>
          🎮 Available Games
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {coinArenaGames.map((game, index) => (
            <div
            key={game.id}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                e.target.style.borderColor = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--border-color)';
              }}
              onClick={() => handleGameClick(game.id)}
            >
              {/* Game Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    {game.icon}
                  </div>
                  <div>
                    <h3 style={{
                      color: 'var(--text-primary)',
                    fontSize: '1.3rem',
                      fontWeight: '700',
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {game.name}
                    </h3>
                    <div style={{
                      color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginTop: '0.3rem'
                    }}>
                      {game.description}
                  </div>
                </div>
              </div>

              {/* Game Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Reward Range
                  </div>
                  <div style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                    🪙 {game.reward}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Est. Time
                  </div>
                  <div style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                    ⏱️ {game.estimated_time}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  background: getDifficultyColor(game.difficulty),
                  color: '#000',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {game.difficulty}
                </div>
                
                <div style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#8B5CF6',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {game.category}
                </div>
              </div>

              {/* Play Button Overlay */}
                  <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = 1;
                  }}>
                    <div style={{
                  background: 'rgba(255, 215, 0, 0.9)',
                  color: '#000',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '1rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                }}>
                  ▶️ Play Now
                  </div>
                </div>
              </div>
          ))}
            </div>

        {/* View All Games Button */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/coin-games" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, var(--accent-color), #0094A6)',
              color: '#fff',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 20px rgba(0, 173, 181, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}>
              🎮 View All Games & Start Playing
            </button>
          </Link>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          color: 'var(--text-primary)',
          fontSize: '1.2rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          📊 Live Coin Arena Stats
          </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              🟢 Active Players
            </div>
            <div style={{
              color: 'var(--accent-green)',
              fontSize: '1.8rem',
              fontWeight: '800'
          }}>
              {formatNumber(liveStats.activePlayers)}
            </div>
        </div>

          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              🪙 Coins Earned Today
            </div>
            <div style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', fontWeight: '800' }}>
              {formatNumber(liveStats.totalCoinsEarned)}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              🎮 Games Played Today
            </div>
            <div style={{ color: 'var(--accent-color)', fontSize: '1.8rem', fontWeight: '800' }}>
              {formatNumber(liveStats.gamesPlayedToday)}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              👥 Total Players Online
            </div>
            <div style={{ color: 'var(--accent-red)', fontSize: '1.8rem', fontWeight: '800' }}>
              {formatNumber(liveStats.playersOnline)}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Benefits Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Educational Gaming
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
            Develop cognitive skills through fun brain training games that challenge memory, logic, and problem-solving abilities.
          </p>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '8px',
            padding: '0.8rem',
            color: 'var(--accent-green)',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            ✅ Learn While You Earn
          </div>
        </div>

        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Earn Real Money
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
            Convert your earned coins directly to real money. 1000 coins = ₹10. The more you play and improve, the more you earn!
          </p>
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid var(--primary-gold)',
            borderRadius: '8px',
            padding: '0.8rem',
            color: 'var(--primary-gold)',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            💎 Skill = Money
          </div>
        </div>

        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontSize: '1.3rem' }}>
            Compete & Win
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
            Join tournaments, climb leaderboards, and compete with players worldwide for amazing prizes and recognition.
          </p>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8B5CF6',
            borderRadius: '8px',
            padding: '0.8rem',
            color: '#8B5CF6',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            🎯 Pure Skill Competition
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'var(--primary-gold)', marginBottom: '2rem', fontSize: '1.5rem' }}>
          🌟 Why Choose Our Coin Arena?
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎓</div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Educational</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              100% skill-based games that improve cognitive abilities and mental agility
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>⚡</div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Instant</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Real-time coin rewards and instant withdrawals to your account
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🛡️</div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Safe</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              No gambling, no chance - pure skill-based earning platform
            </p>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📱</div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Accessible</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Play anywhere, anytime on any device with smooth performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 