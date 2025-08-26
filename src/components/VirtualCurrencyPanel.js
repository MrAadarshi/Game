import React, { useState } from 'react';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useAuth } from '../context/AuthContext';

const VirtualCurrencyPanel = () => {
  const { user } = useAuth();
  const { 
    coins, 
    gems, 
    dailyBonus, 
    claimDailyBonus, 
    watchAdForCoins, 
    purchaseGemPack,
    checkDailyBonus,
    updateVirtualBalance
  } = useVirtualCurrency();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClaimDaily = async () => {
    try {
      setLoading(true);
      const result = await claimDailyBonus();
      setMessage(`🎉 Daily bonus claimed! +${result.amount} coins! Streak: ${result.streak} days`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to claim daily bonus');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async () => {
    try {
      setLoading(true);
      setMessage('📺 Loading ad... Please wait');
      
      // Simulate real ad experience
      setTimeout(async () => {
        setMessage('📺 Watching ad... Please wait 30 seconds');
        
        setTimeout(async () => {
          // Simulate ad revenue tracking
          const adRevenue = 0.08; // $0.08 per ad
          const userReward = 10; // 10 coins to user (10% of $0.0005 ad revenue)  
          const platformProfit = adRevenue * 0.75; // 75% profit
          
          // Track revenue (for admin dashboard)
          const revenueTracking = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
          revenueTracking.push({
            type: 'ad_revenue',
            revenue: adRevenue,
            profit: platformProfit,
            userReward: userReward,
            userId: user?.uid,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('revenue_tracking', JSON.stringify(revenueTracking));
          
          // Give user coins
          await updateVirtualBalance(userReward, 0, 'Watched advertisement');
          
          console.log(`💰 Ad Revenue: $${adRevenue.toFixed(3)}, Your Profit: $${platformProfit.toFixed(3)} (75%)`);
          
          setMessage(`🎉 Ad completed! +${userReward} coins earned!`);
          setTimeout(() => setMessage(''), 3000);
          setLoading(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      setMessage('❌ Failed to load ad');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
    }
  };

  const handleGemPurchase = async (packData) => {
    try {
      setLoading(true);
      setMessage('Processing payment...');
      
      // Simulate payment processing
      setTimeout(async () => {
        // Track revenue
        const revenueTracking = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
        revenueTracking.push({
          type: 'virtual_goods',
          itemName: `${packData.type} gem pack`,
          price: parseInt(packData.price.replace('₹', '')),
          profit: packData.profit,
          profitMargin: ((packData.profit / parseInt(packData.price.replace('₹', ''))) * 100).toFixed(1),
          userId: user?.uid,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('revenue_tracking', JSON.stringify(revenueTracking));
        
        // Give user the currency
        await updateVirtualBalance(packData.coins, packData.gems, `Purchased ${packData.type} gem pack`);
        
        console.log(`💰 Gem Pack Revenue: ${packData.price}, Your Profit: ₹${packData.profit} (${((packData.profit / parseInt(packData.price.replace('₹', ''))) * 100).toFixed(1)}%)`);
        
        setMessage(`✨ ${packData.type} pack purchased! +${packData.coins} coins, +${packData.gems} gems!`);
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
      }, 2000);
    } catch (error) {
      setMessage('❌ Purchase failed');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 173, 181, 0.1) 100%)',
        border: '1px solid var(--primary-gold)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>🪙</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Virtual Currency
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Earn coins to play games! No real money required.
        </p>
      </div>

      {/* Currency Balance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
          <h3 style={{ color: 'var(--primary-gold)', margin: '0 0 0.5rem 0' }}>
            {coins.toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Gaming Coins
          </p>
        </div>

        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
          <h3 style={{ color: '#8B5CF6', margin: '0 0 0.5rem 0' }}>
            {gems.toLocaleString()}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Premium Gems
          </p>
        </div>
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

      {/* Earning Methods */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Daily Bonus */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Daily Bonus
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Claim your free coins every day!
            </p>
          </div>

          {dailyBonus?.available ? (
            <button
              onClick={handleClaimDaily}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? 'var(--glass-bg)' : 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                color: loading ? 'var(--text-secondary)' : '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Claiming...' : `🎁 Claim ${dailyBonus.amount + (dailyBonus.streak * 50)} Coins`}
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid var(--primary-gold)',
                borderRadius: '12px',
                padding: '1rem',
                color: 'var(--text-secondary)'
              }}>
                ⏰ Next bonus in: {dailyBonus?.nextBonusIn ? formatTime(dailyBonus.nextBonusIn) : 'Loading...'}
              </div>
            </div>
          )}
        </div>

        {/* Watch Ads */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Watch Ads
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  Earn 10 coins by watching a short ad
            </p>
          </div>

          <button
            onClick={handleWatchAd}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? 'var(--glass-bg)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: loading ? 'var(--text-secondary)' : '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
                                {loading ? '📺 Watching Ad...' : '📺 Watch Ad (+10 coins)'}
          </button>
        </div>

        {/* Gem Packs */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          gridColumn: 'span 2'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Premium Packs
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Special currency packs for enhanced gaming
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
                          { type: 'small', coins: 500, gems: 100, price: '₹99', popular: false, profit: 95 },
            { type: 'medium', coins: 2500, gems: 500, price: '₹299', popular: true, profit: 284 },
            { type: 'large', coins: 5000, gems: 1000, price: '₹499', popular: false, profit: 474 }
            ].map(pack => (
              <div
                key={pack.type}
                style={{
                  background: pack.popular ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))' : 'rgba(255, 255, 255, 0.05)',
                  border: pack.popular ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {pack.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#8B5CF6',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    POPULAR
                  </div>
                )}
                
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  margin: '0 0 1rem 0',
                  textTransform: 'capitalize'
                }}>
                  {pack.type} Pack
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--primary-gold)', fontSize: '1.1rem', fontWeight: '600' }}>
                    🪙 {pack.coins.toLocaleString()} Coins
                  </div>
                  <div style={{ color: '#8B5CF6', fontSize: '1.1rem', fontWeight: '600' }}>
                    💎 {pack.gems} Gems
                  </div>
                </div>

                <button
                  onClick={() => handleGemPurchase(pack)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: loading ? 'var(--glass-bg)' : (pack.popular ? '#8B5CF6' : 'var(--primary-gold)'),
                    color: loading ? 'var(--text-secondary)' : (pack.popular ? '#fff' : '#000'),
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Processing...' : `Get Pack ${pack.price}`}
                </button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3B82F6',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#3B82F6', margin: 0, fontSize: '0.9rem' }}>
              💡 <strong>Note:</strong> These are virtual currency packs for enhanced gaming experience. 
              All transactions are for virtual goods only and comply with local regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Gaming Tips */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          💡 Tips for Earning More Coins
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { icon: '🎯', title: 'Play Smart', tip: 'Start with smaller bets to preserve your coins' },
            { icon: '📅', title: 'Daily Login', tip: 'Log in every day for increasing bonus rewards' },
            { icon: '🎮', title: 'Try All Games', tip: 'Different games have different strategies' },
            { icon: '👥', title: 'Invite Friends', tip: 'Share the fun and earn referral bonuses' }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{item.title}</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualCurrencyPanel; 