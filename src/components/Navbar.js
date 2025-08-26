import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useVIP } from '../context/VIPContext';
import { useInventory } from '../context/InventoryContext';
import GlobalSoundToggle from './GlobalSoundToggle';
import { adminService } from '../services/adminService';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { coins } = useVirtualCurrency();
  const { getVIPStats } = useVIP();
  const { getCurrentAvatar } = useInventory();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const navigate = useNavigate();
  
  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);

  const vipStats = getVIPStats();
  const currentAvatar = getCurrentAvatar();

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          console.log('🔍 Navbar: Checking admin status for:', user.email);
          const adminStatus = await adminService.isAdmin(user.email);
          console.log('🔍 Navbar: Admin status result:', adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Navbar: Admin check error:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAdminCheckComplete(true);
    };

    checkAdminStatus();
  }, [user?.email]);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside user menu
      if (showUserMenu && 
          userMenuRef.current && 
          !userMenuRef.current.contains(event.target) &&
          userButtonRef.current && 
          !userButtonRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      
      // Check if click is outside social menu
      if (showSocialMenu && !event.target.closest('[data-social-menu]')) {
        setShowSocialMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowSocialMenu(false);
      }
    };

    if (showUserMenu || showSocialMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showUserMenu, showSocialMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatBalance = (balance) => {
    if (balance >= 10000000) {
      return `🪙${(balance / 10000000).toFixed(1)}Cr`;
    } else if (balance >= 100000) {
      return `🪙${(balance / 100000).toFixed(1)}L`;
    } else if (balance >= 1000) {
      return `🪙${(balance / 1000).toFixed(1)}K`;
    }
    return `🪙${balance?.toLocaleString() || '0'}`;
  };

  const getUserInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const getUserDisplayIcon = () => {
    // If user has an active avatar, show that
    if (currentAvatar) {
      return currentAvatar.image;
    }
    // Otherwise show user initials
    return getUserInitials(user?.email);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Logo Section */}
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          fontSize: '1.8rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          🎰
        </div>
        <div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GMS Gaming
          </div>
        </div>
        <span style={{
          background: 'var(--accent-green)',
          color: '#000',
          fontSize: '0.6rem',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          Online
        </span>
      </Link>

      {/* Center Navigation - Social Dropdown */}
      {user && (
        <div 
          data-social-menu
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => setShowSocialMenu(!showSocialMenu)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            🎮 Games & More
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
              {showSocialMenu ? '▲' : '▼'}
            </span>
          </button>

          {/* Social Dropdown Menu */}
          {showSocialMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '10px',
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1rem',
              minWidth: '280px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              zIndex: 1001
            }}>
              {/* Quick Games Section */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  color: 'var(--primary-gold)', 
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  🎯 Quick Games
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem'
                }}>
                  <Link to="/coin-games" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  >
                    🎲 Coin Games
                  </Link>
                  <Link to="/tournaments" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  >
                    🏆 Tournaments
                  </Link>
                </div>
              </div>

              {/* Store & VIP Section */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ 
                  color: '#8B5CF6', 
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  🛒 Store & VIP
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem'
                }}>
                  <Link to="/store" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(139, 92, 246, 0.1)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                  >
                    🛒 Store
                  </Link>
                  <Link to="/premium" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(245, 158, 11, 0.1)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(245, 158, 11, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                  }}
                  >
                    👑 VIP
                  </Link>
                </div>
              </div>

              {/* Social Features */}
              <div>
                <h4 style={{ 
                  color: '#22C55E', 
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  🌟 Community
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem'
                }}>
                  <Link to="/shorts" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(34, 197, 94, 0.1)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                  }}
                  >
                    🎬 Shorts
                  </Link>
                  <Link to="/leaderboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(34, 197, 94, 0.1)'
                  }}
                  onClick={() => setShowSocialMenu(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                  }}
                  >
                    🏆 Rankings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {user ? (
          <>
            {/* Balance & VIP Status - Minimal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '6px 10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* VIP Badge - Minimal */}
              {vipStats.isVIP && (
                <span style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: '700'
                }}>
                  👑VIP{vipStats.level}
                </span>
              )}

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.2)'
              }} />

              {/* Coin Balance - Link to Withdrawal Page */}
              <Link to="/withdrawal" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#FFD700',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
              >
                {formatBalance(coins)}
              </Link>
            </div>

            {/* Controls Group */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Sound Toggle - Minimal */}
              <GlobalSoundToggle />

              {/* Admin Button - Minimal */}
              {adminCheckComplete && isAdmin && (
                <Link to="/admin" style={{
                  background: 'rgba(255, 107, 107, 0.2)',
                  color: '#ff6b6b',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 107, 107, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 0.2)';
                }}
                >
                  ⚙️
                </Link>
              )}

              {/* Notification Bell - Already minimal */}
              <NotificationBell />

              {/* User Profile - With Avatar Support */}
              <button
                ref={userButtonRef}
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  color: 'var(--text-primary)',
                  fontSize: currentAvatar ? '1rem' : '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                title={currentAvatar ? `${currentAvatar.name} - Click to manage` : 'User Profile'}
              >
               {getUserDisplayIcon()}
             </button>
            </div>

             {showUserMenu && (
               <div 
                 ref={userMenuRef}
                 style={{
                 position: 'absolute',
                 top: '100%',
                 right: '0',
                 marginTop: '15px',
                 background: 'rgba(0, 0, 0, 0.95)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 borderRadius: '12px',
                 padding: '1rem',
                 minWidth: '200px',
                 boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                 zIndex: 1001
               }}>
                 {/* Active Avatar Display */}
                 {currentAvatar && (
                   <div style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     padding: '0.5rem',
                     borderRadius: '8px',
                     marginBottom: '0.5rem',
                     background: 'rgba(34, 197, 94, 0.1)',
                     border: '1px solid rgba(34, 197, 94, 0.3)'
                   }}>
                     <span style={{ fontSize: '1.2rem' }}>{currentAvatar.image}</span>
                     <div>
                       <div style={{ 
                         color: 'var(--text-primary)', 
                         fontSize: '0.8rem', 
                         fontWeight: '600' 
                       }}>
                         {currentAvatar.name}
                       </div>
                       <div style={{ 
                         color: '#22C55E', 
                         fontSize: '0.7rem' 
                       }}>
                         Currently Active
                       </div>
                     </div>
                   </div>
                 )}

                 <Link 
                   to="/dashboard"
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     padding: '0.5rem',
                     borderRadius: '8px',
                     textDecoration: 'none',
                     color: 'var(--text-primary)',
                     marginBottom: '0.5rem',
                     transition: 'all 0.3s ease',
                     fontSize: '0.9rem'
                   }}
                   onClick={() => setShowUserMenu(false)}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'transparent';
                   }}
                 >
                   📊 Dashboard
                 </Link>

                 <Link 
                   to="/inventory"
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     padding: '0.5rem',
                     borderRadius: '8px',
                     textDecoration: 'none',
                     color: 'var(--text-primary)',
                     marginBottom: '0.5rem',
                     transition: 'all 0.3s ease',
                     fontSize: '0.9rem'
                   }}
                   onClick={() => setShowUserMenu(false)}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'transparent';
                   }}
                 >
                   🎒 Inventory
                 </Link>
                 
                 <button 
                   onClick={handleLogout}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     width: '100%',
                     padding: '0.5rem',
                     borderRadius: '8px',
                     border: 'none',
                     background: 'transparent',
                     color: '#ff6b6b',
                     cursor: 'pointer',
                     fontSize: '0.9rem'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = 'rgba(255, 107, 107, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'transparent';
                   }}
                 >
                   🚪 Logout
               </button>
             </div>
           )}
          </>
        ) : (
          /* Guest User Buttons */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Link to="/login" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            >
              Login
            </Link>
            <Link to="/register" style={{
              background: 'var(--accent-gradient)',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 