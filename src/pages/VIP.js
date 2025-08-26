import React, { useState } from 'react';
import { useVIP } from '../context/VIPContext';
import { useAuth } from '../context/AuthContext';

const VIP = () => {
  const { vipTiers, getVIPStats, claimMonthlyBonus } = useVIP();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(null);
  
  const vipStats = getVIPStats();

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount?.toLocaleString() || '0'}`;
  };

  const handleClaimBonus = () => {
    claimMonthlyBonus();
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${vipStats.currentTier?.color}20, ${vipStats.currentTier?.color}10)`,
        border: `2px solid ${vipStats.currentTier?.color}`,
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${vipStats.currentTier?.color}10 0%, transparent 70%)`,
          animation: 'rotate 20s linear infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {vipStats.currentTier?.icon}
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: vipStats.currentTier?.color,
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {vipStats.currentTier?.name} Member
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {vipStats.currentTier?.description}
          </p>
          
          {/* Progress to Next Tier */}
          {vipStats.progressToNext.pointsNeeded > 0 && (
            <div style={{
              background: 'var(--glass-bg)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                  Progress to {vipStats.progressToNext.nextTier}
                </span>
                <span style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                  {vipStats.progressToNext.pointsNeeded} points needed
                </span>
              </div>
              <div style={{
                background: 'var(--border-color)',
                borderRadius: '10px',
                height: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  background: `linear-gradient(90deg, ${vipStats.currentTier?.color}, ${vipStats.currentTier?.color}80)`,
                  height: '100%',
                  width: `${vipStats.progressToNext.progress}%`,
                  transition: 'width 0.3s ease',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Tier Benefits & Monthly Bonus */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Current Benefits */}
        <div className="game-area">
          <h3 style={{
            color: 'var(--primary-gold)',
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {vipStats.currentTier?.icon} Your Benefits
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.8rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cashback Rate</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                {(vipStats.benefits.cashbackRate * 100).toFixed(1)}%
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.8rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Bonus Multiplier</span>
              <span style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                {vipStats.benefits.dailyBonusMultiplier}x
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.8rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Withdrawal Limit</span>
              <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>
                {formatCurrency(vipStats.benefits.withdrawalLimit)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.8rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Support Priority</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {vipStats.benefits.supportPriority}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.8rem',
              background: 'var(--glass-bg)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tournament Access</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {vipStats.benefits.tournamentAccess.join(', ')}
              </span>
            </div>
            
            {vipStats.benefits.personalManager && (
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                borderRadius: '8px',
                border: '1px solid var(--primary-gold)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                <div style={{ color: 'var(--primary-gold)', fontWeight: '700' }}>
                  Personal VIP Manager
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Dedicated support available 24/7
                </div>
              </div>
            )}
            
            {vipStats.benefits.exclusiveGames && (
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.1), rgba(0, 173, 181, 0.05))',
                borderRadius: '8px',
                border: '1px solid var(--accent-color)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎮</div>
                <div style={{ color: 'var(--accent-color)', fontWeight: '700' }}>
                  Exclusive Games Access
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  VIP-only games with higher limits
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Bonus */}
        <div className="game-area">
          <h3 style={{
            color: 'var(--primary-gold)',
            fontSize: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎁 Monthly VIP Bonus
          </h3>
          
          {vipStats.monthlyBonus > 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                color: 'var(--accent-green)',
                fontWeight: '900',
                marginBottom: '1rem'
              }}>
                ₹{vipStats.monthlyBonus.toLocaleString()}
              </div>
              
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                As a {vipStats.currentTier?.name} member, you're eligible for a monthly bonus.
                This bonus is available once per calendar month.
              </p>
              
              {vipStats.canClaimBonus ? (
                <button
                  onClick={handleClaimBonus}
                  className="primary-btn"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  Claim Monthly Bonus 🎁
                </button>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Monthly bonus already claimed
                  </div>
                  <div style={{ color: 'var(--primary-gold)', fontSize: '0.9rem' }}>
                    Come back next month for your next bonus!
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>🎁</div>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                No Monthly Bonus
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Upgrade to Silver tier or higher to receive monthly VIP bonuses!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* VIP Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="game-area" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h4 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
            Current Points
          </h4>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-green)' }}>
            {vipStats.currentPoints.toLocaleString()}
          </div>
        </div>
        
        <div className="game-area" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
          <h4 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
            Lifetime Points
          </h4>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-gold)' }}>
            {vipStats.lifetimePoints.toLocaleString()}
          </div>
        </div>
        
        <div className="game-area" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <h4 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
            Points Rate
          </h4>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            1 point per ₹10 wagered
          </div>
        </div>
      </div>

      {/* All VIP Tiers */}
      <div className="game-area">
        <h3 style={{
          color: 'var(--primary-gold)',
          fontSize: '1.8rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          VIP Tier Comparison
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {vipTiers.map((tier, index) => (
            <div
              key={tier.name}
              className="game-area"
              style={{
                border: tier.name === vipStats.currentTier?.name ? 
                  `2px solid ${tier.color}` : '1px solid var(--border-color)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onClick={() => setSelectedTier(selectedTier?.name === tier.name ? null : tier)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = `0 10px 30px ${tier.color}30`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {tier.name === vipStats.currentTier?.name && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: tier.color,
                  color: '#000',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  CURRENT
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {tier.icon}
                </div>
                <h4 style={{
                  color: tier.color,
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  {tier.name}
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  {tier.description}
                </p>
                <div style={{
                  background: 'var(--glass-bg)',
                  borderRadius: '8px',
                  padding: '0.8rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    Points Required
                  </div>
                  <div style={{ color: tier.color, fontWeight: '700' }}>
                    {tier.minPoints.toLocaleString()}
                    {tier.maxPoints !== Infinity && ` - ${tier.maxPoints.toLocaleString()}`}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cashback</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                    {(tier.benefits.cashbackRate * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Bonus</span>
                  <span style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                    {tier.benefits.monthlyBonus > 0 ? `₹${tier.benefits.monthlyBonus}` : 'None'}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Bonus</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                    {tier.benefits.dailyBonusMultiplier}x
                  </span>
                </div>
              </div>
              
              {selectedTier?.name === tier.name && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: 'var(--primary-gold)', fontWeight: '600', marginBottom: '0.8rem' }}>
                    Additional Benefits:
                  </div>
                  <ul style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '0.4rem' }}>
                      • Withdrawal limit: {formatCurrency(tier.benefits.withdrawalLimit)}
                    </li>
                    <li style={{ marginBottom: '0.4rem' }}>
                      • Support: {tier.benefits.supportPriority}
                    </li>
                    <li style={{ marginBottom: '0.4rem' }}>
                      • Tournaments: {tier.benefits.tournamentAccess.join(', ')}
                    </li>
                    {tier.benefits.personalManager && (
                      <li style={{ marginBottom: '0.4rem' }}>
                        • Personal VIP Manager
                      </li>
                    )}
                    {tier.benefits.exclusiveGames && (
                      <li style={{ marginBottom: '0.4rem' }}>
                        • Exclusive VIP Games
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VIP; 