import React, { useState } from 'react';
import { useRewards } from '../context/RewardsContext';
import { useAuth } from '../context/AuthContext';

const Rewards = () => {
  const { user } = useAuth();
  const {
    achievements,
    unlockedAchievements,
    dailyChallenges,
    referralStats,
    getReferralTierBenefits,
    shareWin
  } = useRewards();
  
  const [activeTab, setActiveTab] = useState('challenges');
  const [showShareModal, setShowShareModal] = useState(false);

  const getProgressPercentage = (challenge) => {
    if (challenge.requirement.count) {
      return Math.min((challenge.progress / challenge.requirement.count) * 100, 100);
    }
    if (challenge.requirement.amount) {
      return Math.min((challenge.progress / challenge.requirement.amount) * 100, 100);
    }
    return 0;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralStats.code);
    alert('Referral code copied to clipboard!');
  };

  const shareReferralCode = () => {
    const shareText = `🎮 Join me on GMS Gaming and get ₹100 bonus! Use my referral code: ${referralStats.code}\n\n🎁 What you get:\n• ₹100 welcome bonus\n• Daily rewards\n• VIP benefits\n\nJoin now: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join GMS Gaming!',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Referral message copied to clipboard!');
    }
  };

  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  };

  return (
    <div className="container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: 'var(--primary-gold)',
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            fontWeight: '900'
          }}>
            🎁 Rewards Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Complete challenges, unlock achievements, and earn rewards!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {[
            { id: 'challenges', label: '📋 Daily Challenges', icon: '🎯' },
            { id: 'achievements', label: '🏆 Achievements', icon: '🎖️' },
            { id: 'referrals', label: '👥 Referrals', icon: '💰' },
            { id: 'social', label: '📱 Social', icon: '🔗' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.8rem 1.5rem',
                background: activeTab === tab.id ? 
                  'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                  'var(--glass-bg)',
                color: activeTab === tab.id ? '#000' : 'var(--text-primary)',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary-gold)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Daily Challenges Tab */}
        {activeTab === 'challenges' && (
          <div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              🎯 Today's Challenges
            </h2>
            <div style={{
              display: 'grid',
              gap: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {dailyChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  style={{
                    background: challenge.completed ? 
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))' :
                      'var(--glass-bg)',
                    border: `1px solid ${challenge.completed ? 'var(--accent-green)' : 'var(--border-color)'}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {challenge.completed && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'var(--accent-green)',
                      color: '#000',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      ✅ COMPLETED
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>{challenge.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {challenge.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {challenge.description}
                      </p>
                    </div>
                    <div style={{
                      background: 'var(--primary-gold)',
                      color: '#000',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}>
                      ₹{challenge.reward}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>Progress</span>
                      <span>
                        {challenge.progress}/{challenge.requirement.count || challenge.requirement.amount}
                      </span>
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: challenge.completed ? 'var(--accent-green)' : 'var(--primary-gold)',
                        height: '100%',
                        width: `${getProgressPercentage(challenge)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              🏆 Achievements
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {achievements.map(achievement => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    style={{
                      background: isUnlocked ? 
                        'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))' :
                        'var(--glass-bg)',
                      border: `1px solid ${isUnlocked ? 'var(--primary-gold)' : 'var(--border-color)'}`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      opacity: isUnlocked ? 1 : 0.6,
                      transform: isUnlocked ? 'scale(1)' : 'scale(0.95)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isUnlocked && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--primary-gold)',
                        color: '#000',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        ✓
                      </div>
                    )}
                    
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {achievement.icon}
                    </div>
                    <h3 style={{
                      color: isUnlocked ? 'var(--primary-gold)' : 'var(--text-secondary)',
                      marginBottom: '0.5rem'
                    }}>
                      {achievement.title}
                    </h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      marginBottom: '1rem'
                    }}>
                      {achievement.description}
                    </p>
                    <div style={{
                      background: isUnlocked ? 'var(--primary-gold)' : 'var(--glass-bg)',
                      color: isUnlocked ? '#000' : 'var(--text-secondary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      ₹{achievement.reward}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              👥 Referral Program
            </h2>
            
            {/* Referral Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
                  ₹{referralStats.totalEarnings}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Total Earnings
                </p>
              </div>
              
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
                  {referralStats.totalReferrals}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Friends Referred
                </p>
              </div>
              
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
                <h3 style={{ 
                  color: tierColors[referralStats.tier], 
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize'
                }}>
                  {referralStats.tier} Tier
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Current Status
                </p>
              </div>
            </div>

            {/* Referral Code Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
              border: '1px solid var(--primary-gold)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                🎁 Your Referral Code
              </h3>
              <div style={{
                background: 'var(--glass-bg)',
                border: '2px solid var(--primary-gold)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1.5rem',
                fontWeight: '900',
                color: 'var(--primary-gold)',
                marginBottom: '1rem',
                letterSpacing: '2px'
              }}>
                {referralStats.code}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={copyReferralCode}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'var(--primary-gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={shareReferralCode}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'var(--accent-green)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📱 Share Code
                </button>
              </div>
            </div>

            {/* Tier Benefits */}
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                🏆 Tier Benefits
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {Object.entries({
                  bronze: { refs: '0-1', bonus: '₹100' },
                  silver: { refs: '2-4', bonus: '₹150' },
                  gold: { refs: '5-9', bonus: '₹200' },
                  platinum: { refs: '10+', bonus: '₹300' }
                }).map(([tier, data]) => (
                  <div
                    key={tier}
                    style={{
                      padding: '1rem',
                      background: referralStats.tier === tier ? 
                        `linear-gradient(135deg, ${tierColors[tier]}20, ${tierColors[tier]}10)` :
                        'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${referralStats.tier === tier ? tierColors[tier] : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <h4 style={{ 
                      color: tierColors[tier], 
                      marginBottom: '0.5rem',
                      textTransform: 'capitalize'
                    }}>
                      {tier}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      {data.refs} referrals
                    </p>
                    <div style={{
                      background: tierColors[tier],
                      color: '#000',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {data.bonus} per referral
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              📱 Social Features
            </h2>
            
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Share Your Wins!
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Share your big wins on social media and earn bonus rewards!
              </p>
              
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                📱 Share Win
              </button>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                💡 Earn ₹75 for each win you share on social media!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
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
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
              📱 Share Your Win
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Enter your recent win amount to generate a share message:
            </p>
            
            <input
              type="number"
              placeholder="Win amount (₹)"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem'
              }}
              id="shareAmount"
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amount = document.getElementById('shareAmount').value || 100;
                  shareWin('Casino Games', amount);
                  setShowShareModal(false);
                }}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--primary-gold)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📱 Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards; 