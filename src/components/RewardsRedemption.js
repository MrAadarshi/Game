import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const RewardsRedemption = () => {
  const { user } = useAuth();
  const { coins, updateVirtualBalance } = useVirtualCurrency();
  const [selectedCategory, setSelectedCategory] = useState('gift-cards');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemHistory, setRedeemHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const rewardCategories = {
    'gift-cards': {
      name: '🎁 Gift Cards',
      description: 'Redeem for popular gift cards',
      items: [
        {
          id: 'amazon-500',
          name: 'Amazon Gift Card',
          value: '₹500',
          cost: 1200000,
          description: 'Amazon.in Gift Card worth ₹500',
          icon: '🛒',
          estimatedDelivery: '24 hours',
          popular: true
        },
        {
          id: 'flipkart-500',
          name: 'Flipkart Gift Card',
          value: '₹500',
          cost: 1200000,
          description: 'Flipkart Gift Card worth ₹500',
          icon: '🛍️',
          estimatedDelivery: '24 hours'
        },
        {
          id: 'amazon-1000',
          name: 'Amazon Gift Card',
          value: '₹1000',
          cost: 2400000,
          description: 'Amazon.in Gift Card worth ₹1000',
          icon: '🛒',
          estimatedDelivery: '24 hours',
          discount: '4% OFF'
        },
        {
          id: 'google-play-500',
          name: 'Google Play Card',
          value: '₹500',
          cost: 1200000,
          description: 'Google Play Store Credit ₹500',
          icon: '🎮',
          estimatedDelivery: '12 hours'
        }
      ]
    },
    'mobile-recharge': {
      name: '📱 Mobile Recharge',
      description: 'Instant mobile recharge',
      items: [
        {
          id: 'recharge-299',
          name: 'Mobile Recharge',
          value: '₹299',
          cost: 720000,
          description: 'Instant mobile recharge ₹299',
          icon: '📞',
          estimatedDelivery: 'Instant',
          popular: true
        },
        {
          id: 'recharge-499',
          name: 'Mobile Recharge',
          value: '₹499',
          cost: 1200000,
          description: 'Instant mobile recharge ₹499',
          icon: '📞',
          estimatedDelivery: 'Instant',
          discount: '4% OFF'
        },
        {
          id: 'recharge-799',
          name: 'Mobile Recharge',
          value: '₹799',
          cost: 1920000,
          description: 'Instant mobile recharge ₹799',
          icon: '📞',
          estimatedDelivery: 'Instant',
          discount: '5% OFF'
        }
      ]
    },
    'gaming': {
      name: '🎮 Gaming Rewards',
      description: 'Gaming accessories and credits',
      items: [
        {
          id: 'steam-500',
          name: 'Steam Wallet Code',
          value: '₹500',
          cost: 1200000,
          description: 'Steam Wallet Code ₹500',
          icon: '🎮',
          estimatedDelivery: '24 hours'
        },
        {
          id: 'pubg-uc',
          name: 'PUBG UC',
          value: '1800 UC',
          cost: 1200000,
          description: 'PUBG Mobile Unknown Cash',
          icon: '🔫',
          estimatedDelivery: '12 hours',
          popular: true
        },
        {
          id: 'free-fire-diamonds',
          name: 'Free Fire Diamonds',
          value: '2180 Diamonds',
          cost: 1120000,
          description: 'Free Fire Diamonds Pack',
          icon: '💎',
          estimatedDelivery: '12 hours'
        }
      ]
    },
    'merchandise': {
      name: '👕 Merchandise',
      description: 'Physical branded items',
      items: [
        {
          id: 'gms-tshirt',
          name: 'GMS Gaming T-Shirt',
          value: 'Premium Quality',
          cost: 160000,
          description: 'Official GMS Gaming branded T-shirt',
          icon: '👕',
          estimatedDelivery: '7-10 days',
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'gaming-mousepad',
          name: 'Gaming Mouse Pad',
          value: 'Pro Gaming',
          cost: 96000,
          description: 'Professional gaming mouse pad',
          icon: '🖱️',
          estimatedDelivery: '5-7 days'
        },
        {
          id: 'gaming-mug',
          name: 'GMS Gaming Mug',
          value: 'Ceramic 350ml',
          cost: 64000,
          description: 'Official GMS Gaming ceramic mug',
          icon: '☕',
          estimatedDelivery: '5-7 days',
          popular: true
        }
      ]
    },
    'premium': {
      name: '⭐ Premium Benefits',
      description: 'Platform premium features',
      items: [
        {
          id: 'vip-1month',
          name: 'VIP Membership',
          value: '1 Month',
          cost: 20000,
          description: '1 Month VIP membership with all benefits',
          icon: '👑',
          estimatedDelivery: 'Instant',
          popular: true
        },
        {
          id: 'ad-free-week',
          name: 'Ad-Free Gaming',
          value: '1 Week',
          cost: 8000,
          description: '1 Week completely ad-free gaming',
          icon: '🚫',
          estimatedDelivery: 'Instant'
        },
        {
          id: 'coin-multiplier',
          name: 'Win Multiplier',
          value: '2x for 3 days',
          cost: 12000,
          description: '2x winning multiplier for 3 days',
          icon: '⚡',
          estimatedDelivery: 'Instant'
        }
      ]
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || coins < selectedReward.cost) return;
    
    setLoading(true);
    try {
      // Deduct coins
      await updateVirtualBalance(-selectedReward.cost, 0, `Redeemed ${selectedReward.name}`);
      
      // Add to redemption history
      const redemption = {
        id: Date.now(),
        reward: selectedReward,
        redeemedAt: new Date(),
        status: 'Processing',
        trackingId: `GMS${Date.now().toString().slice(-6)}`
      };
      
      setRedeemHistory(prev => [redemption, ...prev]);
      
      // In real implementation, this would:
      // 1. Send request to fulfillment service
      // 2. Generate gift card codes
      // 3. Send confirmation email
      // 4. Update user's redemption history in database
      
      setShowRedeemModal(false);
      setSelectedReward(null);
      
      // Show success message
      alert(`🎉 Redemption Successful!\n\nTrack your reward: ${redemption.trackingId}\nEstimated delivery: ${selectedReward.estimatedDelivery}`);
      
    } catch (error) {
      console.error('Redemption error:', error);
      alert('Redemption failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--text-primary)',
          margin: '0 0 1rem 0',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          🎁 Rewards Redemption Center
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          margin: '0 0 1.5rem 0',
          fontSize: '1.1rem'
        }}>
          Exchange your virtual coins for amazing real-world rewards!
        </p>
        
        {/* Current Balance */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 235, 59, 0.1))',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'inline-block'
        }}>
          <div style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: '600' }}>
            Your Balance: 🪙{coins?.toLocaleString() || '0'} Coins
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        padding: '0.5rem'
      }}>
        {Object.entries(rewardCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              background: selectedCategory === key ? 
                'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                'var(--glass-bg)',
              color: selectedCategory === key ? '#000' : 'var(--text-primary)',
              border: selectedCategory === key ? 'none' : '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {rewardCategories[selectedCategory].items.map((reward) => (
          <div
            key={reward.id}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {/* Popular Badge */}
            {reward.popular && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                🔥 POPULAR
              </div>
            )}

            {/* Discount Badge */}
            {reward.discount && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                {reward.discount}
              </div>
            )}

            {/* Reward Icon */}
            <div style={{
              fontSize: '3rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              {reward.icon}
            </div>

            {/* Reward Info */}
            <h3 style={{
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              fontSize: '1.2rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {reward.name}
            </h3>

            <div style={{
              color: 'var(--primary-gold)',
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '0.5rem'
            }}>
              {reward.value}
            </div>

            <p style={{
              color: 'var(--text-secondary)',
              margin: '0 0 1rem 0',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {reward.description}
            </p>

            {/* Cost */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Cost
              </div>
              <div style={{
                color: '#FFD700',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                🪙{reward.cost.toLocaleString()} Coins
              </div>
            </div>

            {/* Delivery Time */}
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              📦 Delivery: {reward.estimatedDelivery}
            </div>

            {/* Redeem Button */}
            <button
              onClick={() => handleRedeemClick(reward)}
              disabled={coins < reward.cost}
              style={{
                width: '100%',
                background: coins >= reward.cost ? 
                  'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))' : 
                  'var(--glass-bg)',
                color: coins >= reward.cost ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: coins >= reward.cost ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
            >
              {coins >= reward.cost ? '🎁 Redeem Now' : '❌ Not Enough Coins'}
            </button>
          </div>
        ))}
      </div>

      {/* Redemption History */}
      {redeemHistory.length > 0 && (
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            color: 'var(--text-primary)',
            margin: '0 0 1.5rem 0',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            📋 Redemption History
          </h2>
          
          {redeemHistory.map((redemption) => (
            <div
              key={redemption.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {redemption.reward.icon} {redemption.reward.name}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Track: {redemption.trackingId} • {redemption.redeemedAt.toLocaleDateString()}
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 193, 7, 0.2)',
                color: '#FFD700',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {redemption.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && selectedReward && (
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
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {selectedReward.icon}
            </div>
            
            <h3 style={{
              color: 'var(--text-primary)',
              margin: '0 0 1rem 0',
              fontSize: '1.3rem'
            }}>
              Confirm Redemption
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              margin: '0 0 1.5rem 0'
            }}>
              Redeem <strong>{selectedReward.name}</strong> for{' '}
              <strong style={{ color: '#FFD700' }}>
                🪙{selectedReward.cost.toLocaleString()} coins
              </strong>?
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowRedeemModal(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={confirmRedeem}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#000',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Processing...' : '✅ Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsRedemption; 