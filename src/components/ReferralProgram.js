import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ReferralProgram = () => {
  const { referralData, shareReferralCode, getReferralStats } = useAuth();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    recentReferrals: []
  });

  useEffect(() => {
    setReferralStats(getReferralStats());
  }, [referralData, getReferralStats]);

  const handleShare = async (method) => {
    try {
      await shareReferralCode(method);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.15), rgba(0, 173, 181, 0.05))',
        border: '1px solid var(--accent-color)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '900',
          color: 'var(--primary-gold)',
          marginBottom: '0.5rem'
        }}>
          Referral Program
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Invite friends and earn ₹50 for each successful referral!
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="game-area">
          <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Total Referrals
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-green)', textAlign: 'center' }}>
            {referralStats.totalReferrals}
          </div>
        </div>

        <div className="game-area">
          <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Total Earnings
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-green)', textAlign: 'center' }}>
            ₹{referralStats.totalEarnings}
          </div>
        </div>

        <div className="game-area">
          <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>⏳</div>
          <h3 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Pending Rewards
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-gold)', textAlign: 'center' }}>
            ₹{referralStats.pendingRewards}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Referral Code & Sharing */}
        <div className="game-area">
          <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Your Referral Code
          </h3>
          
          <div style={{
            background: 'var(--glass-bg)',
            border: '2px solid var(--primary-gold)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'var(--primary-gold)',
              letterSpacing: '2px',
              marginBottom: '0.5rem'
            }}>
              {referralData.referralCode}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Share this code with friends to earn rewards
            </p>
          </div>

          {/* Share Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => handleShare('copy')}
              style={{
                background: 'var(--primary-gold)',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                color: '#000',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              Copy Link
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              style={{
                background: '#25D366',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              WhatsApp
            </button>

            <button
              onClick={() => handleShare('telegram')}
              style={{
                background: '#0088cc',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>✈️</span>
              Telegram
            </button>
          </div>

          {/* How it Works */}
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
              How it Works
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  1
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  Share your referral code with friends
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  2
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  They sign up using your code
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  3
                </div>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  Both of you get ₹50 bonus!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="game-area">
          <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Recent Referrals
          </h3>
          
          {referralStats.recentReferrals.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {referralStats.recentReferrals.map((referral, index) => (
                <div
                  key={index}
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
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.3rem' }}>
                      {referral.email.replace(/(.{3}).*@/, '$1***@')}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(referral.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: 'var(--accent-green)',
                      fontWeight: '700',
                      fontSize: '1rem',
                      marginBottom: '0.3rem'
                    }}>
                      +₹{referral.reward}
                    </div>
                    <div style={{
                      background: referral.status === 'completed' ? 'var(--accent-green)' : 'var(--primary-gold)',
                      color: '#000',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {referral.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h4 style={{ marginBottom: '0.5rem' }}>No referrals yet</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Start sharing your referral code to see your referred friends here!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="game-area" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Terms & Conditions
        </h3>
        <ul style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          paddingLeft: '1.5rem'
        }}>
          <li>Both referrer and referee receive ₹50 bonus when the referee signs up</li>
          <li>Referral bonus is credited instantly upon successful registration</li>
          <li>You cannot use your own referral code</li>
          <li>Maximum 10 referrals per day to prevent abuse</li>
          <li>Referral rewards can be used for betting immediately</li>
          <li>GMS Gaming reserves the right to modify referral terms at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralProgram; 