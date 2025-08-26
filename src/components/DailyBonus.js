import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DailyBonus = () => {
  const { dailyBonus, claimDailyBonus, checkDailyBonus, getDailyBonusRewards } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

  useEffect(() => {
    checkDailyBonus();
    
    // Check daily bonus status every minute to detect new day
    const interval = setInterval(() => {
      console.log('🎁 Periodic check for new day...');
      checkDailyBonus();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto show modal if bonus can be claimed and not already claimed today
    if (dailyBonus.canClaim && !claimedToday) {
      setShowModal(true);
    }
  }, [dailyBonus.canClaim, claimedToday]);

  // Reset claimedToday when dailyBonus.canClaim becomes true (new day)
  useEffect(() => {
    if (dailyBonus.canClaim && claimedToday) {
      console.log('🎁 New day detected - resetting claimed status');
      setClaimedToday(false);
    }
  }, [dailyBonus.canClaim, claimedToday]);

  const handleClaimBonus = () => {
    console.log('🎁 DailyBonus: handleClaimBonus called');
    
    const amount = claimDailyBonus();
    setBonusAmount(amount);
    setClaimedToday(true);
    
    console.log('🎁 DailyBonus: Bonus claimed, amount:', amount);
    console.log('🎁 DailyBonus: claimedToday set to true, gift box should be hidden');
    
    // Keep modal open to show celebration
    setTimeout(() => {
      setShowModal(false);
      console.log('🎁 DailyBonus: Modal closed after celebration');
    }, 3000);
  };

  const rewards = getDailyBonusRewards();

  // Responsive styles
  const getResponsiveStyles = () => {
    const isSmallScreen = window.innerWidth <= 480;
    const isMediumScreen = window.innerWidth <= 768;
    
    return {
      modalPadding: isSmallScreen ? '1rem' : isMediumScreen ? '1.5rem' : '2rem',
      titleSize: isSmallScreen ? '1.4rem' : isMediumScreen ? '1.6rem' : '1.8rem',
      iconSize: isSmallScreen ? '2rem' : '3rem',
      celebrationIconSize: isSmallScreen ? '3rem' : '4rem',
      celebrationTitleSize: isSmallScreen ? '1.6rem' : '2rem',
      gridColumns: isSmallScreen ? 'repeat(4, 1fr)' : isMediumScreen ? 'repeat(5, 1fr)' : 'repeat(7, 1fr)',
      gridGap: isSmallScreen ? '0.3rem' : '0.5rem',
      rewardPadding: isSmallScreen ? '0.5rem 0.3rem' : '0.8rem 0.5rem',
      rewardFontSize: isSmallScreen ? '0.7rem' : '0.8rem',
      maxHeight: isSmallScreen ? '85vh' : '90vh'
    };
  };

  const styles = getResponsiveStyles();

  // Only show gift box if bonus can be claimed AND not already claimed today
  if (!showModal && dailyBonus.canClaim && !claimedToday) {
    return (
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
          border: '2px solid var(--primary-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          animation: 'pulse 2s infinite'
        }}
        title="Claim your daily bonus!"
      >
        🎁
      </button>
    );
  }

  // Don't render anything if bonus can't be claimed or already claimed
  if (!showModal) {
    return null;
  }

  return (
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
        padding: styles.modalPadding,
        border: '2px solid var(--primary-gold)',
        maxWidth: '500px',
        width: '100%',
        maxHeight: styles.maxHeight,
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {!claimedToday ? (
          <>
            <div style={{ fontSize: styles.iconSize, marginBottom: '1rem' }}>🎁</div>
            <h2 style={{
              color: 'var(--primary-gold)',
              fontSize: styles.titleSize,
              marginBottom: '1rem',
              fontWeight: '900',
              lineHeight: 1.2
            }}>
              Daily Login Bonus
            </h2>
            
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem',
              lineHeight: 1.4
            }}>
              Welcome back! Claim your daily reward and build your streak!
            </p>

            {/* Streak Info */}
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: window.innerWidth <= 480 ? '0.8rem' : '1rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem' 
                  }}>
                    Current Streak
                  </div>
                  <div style={{ 
                    color: 'var(--accent-green)', 
                    fontSize: window.innerWidth <= 480 ? '1.3rem' : '1.5rem', 
                    fontWeight: '700' 
                  }}>
                    {dailyBonus.currentStreak} days
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem' 
                  }}>
                    Total Claimed
                  </div>
                  <div style={{ 
                    color: 'var(--primary-gold)', 
                    fontSize: window.innerWidth <= 480 ? '1.3rem' : '1.5rem', 
                    fontWeight: '700' 
                  }}>
                    ₹{dailyBonus.totalClaimed}
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Calendar - Responsive Grid */}
            <div style={{
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: styles.gridColumns,
                gap: styles.gridGap,
                overflowX: window.innerWidth <= 480 ? 'auto' : 'visible',
                paddingBottom: window.innerWidth <= 480 ? '0.5rem' : '0'
              }}>
                {rewards.map((reward, index) => {
                  const isToday = index === dailyBonus.currentStreak;
                  const isClaimed = index < dailyBonus.currentStreak;
                  
                  return (
                    <div
                      key={reward.day}
                      style={{
                        background: isToday ? 'var(--primary-gold)' : 
                                   isClaimed ? 'var(--accent-green)' : 'var(--glass-bg)',
                        borderRadius: '8px',
                        padding: styles.rewardPadding,
                        border: isToday ? '2px solid var(--secondary-gold)' : '1px solid var(--border-color)',
                        color: isToday || isClaimed ? '#000' : 'var(--text-primary)',
                        fontSize: styles.rewardFontSize,
                        fontWeight: '600',
                        minWidth: window.innerWidth <= 480 ? '60px' : 'auto',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ 
                        fontSize: window.innerWidth <= 480 ? '1rem' : '1.2rem', 
                        marginBottom: '0.2rem' 
                      }}>
                        {reward.icon}
                      </div>
                      <div style={{ 
                        fontSize: window.innerWidth <= 480 ? '0.65rem' : '0.75rem' 
                      }}>
                        Day {reward.day}
                      </div>
                      <div style={{ 
                        fontSize: window.innerWidth <= 480 ? '0.65rem' : '0.75rem',
                        fontWeight: '700'
                      }}>
                        ₹{reward.amount}
                      </div>
                      {isClaimed && (
                        <div style={{ 
                          fontSize: window.innerWidth <= 480 ? '0.7rem' : '0.8rem', 
                          marginTop: '0.1rem' 
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Scroll indicator for mobile */}
              {window.innerWidth <= 480 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem'
                }}>
                  ← Scroll to see all rewards →
                </div>
              )}
            </div>

            {/* Claim Button */}
            {dailyBonus.canClaim && (
              <button
                onClick={handleClaimBonus}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: window.innerWidth <= 480 ? '0.8rem 1.5rem' : '1rem 2rem',
                  color: '#000',
                  fontSize: window.innerWidth <= 480 ? '1rem' : '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
                }}
              >
                Claim Today's Bonus 🎁
              </button>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: window.innerWidth <= 480 ? '0.6rem 1.2rem' : '0.8rem 1.5rem',
                color: 'var(--text-secondary)',
                fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            {/* Celebration View */}
            <div style={{ 
              fontSize: styles.celebrationIconSize, 
              marginBottom: '1rem', 
              animation: 'bounce 1s infinite' 
            }}>
              🎉
            </div>
            <h2 style={{
              color: 'var(--accent-green)',
              fontSize: styles.celebrationTitleSize,
              marginBottom: '1rem',
              fontWeight: '900',
              lineHeight: 1.2
            }}>
              Bonus Claimed!
            </h2>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: window.innerWidth <= 480 ? '1rem' : '1.2rem',
              marginBottom: '1rem',
              lineHeight: 1.3
            }}>
              You received <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                ₹{bonusAmount}
              </span>!
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem',
              lineHeight: 1.4
            }}>
              Come back tomorrow to continue your streak!
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: window.innerWidth <= 480 ? '0.8rem' : '1rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ 
                color: 'var(--primary-gold)', 
                fontWeight: '600',
                fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem'
              }}>
                Streak: {dailyBonus.currentStreak} days 🔥
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyBonus; 