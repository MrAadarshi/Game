import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const MonetizationSystem = () => {
  const { user } = useAuth();
  const { coins, gems, updateVirtualBalance } = useVirtualCurrency();
  
  const [userSubscription, setUserSubscription] = useState(null);
  const [adRevenueToday, setAdRevenueToday] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Revenue tracking (for admin dashboard)
  const [revenueStats, setRevenueStats] = useState({
    dailyAdRevenue: 0,
    monthlySubscriptions: 0,
    virtualGoodsRevenue: 0,
    userRewards: 0,
    netProfit: 0
  });

  // Ad Integration System
  const AdRewardSystem = {
    // Integrate with Google AdMob, Facebook Audience Network, etc.
    showRewardedAd: async () => {
      try {
        // Simulate ad showing
        const adRevenue = Math.random() * 0.1; // $0.05-$0.10 per ad
        const userReward = 10; // 10 coins to user (10% of $0.0005 ad revenue)
        
        // Update user coins
        await updateVirtualBalance(userReward, 0, 'Watched advertisement');
        
        // Track revenue (backend would handle this)
        setAdRevenueToday(prev => prev + adRevenue);
        setRevenueStats(prev => ({
          ...prev,
          dailyAdRevenue: prev.dailyAdRevenue + adRevenue,
          userRewards: prev.userRewards + (adRevenue * 0.1), // 10% to user
          netProfit: prev.netProfit + (adRevenue * 0.9) // 90% profit
        }));

        return { success: true, reward: userReward, revenue: adRevenue };
      } catch (error) {
        console.error('Ad failed to load:', error);
        return { success: false };
      }
    },

    showBannerAd: (placement) => {
      // Revenue: $1-5 per 1000 impressions
      const impressionRevenue = 0.003; // $0.003 per impression
      setAdRevenueToday(prev => prev + impressionRevenue);
      return impressionRevenue;
    }
  };

  // Premium Subscription System
  const SubscriptionPlans = {
    basic: {
      id: 'basic',
      name: 'Basic VIP',
      price: 99, // ₹99/month
      features: [
        '2x Daily Bonus (1000 coins)',
        '50% Fewer Ads',
        'Priority Customer Support',
        'Exclusive Basic Themes'
      ],
      coinMultiplier: 2,
      adReduction: 0.5
    },
    premium: {
      id: 'premium',
      name: 'Premium VIP',
      price: 299, // ₹299/month
      features: [
        '5x Daily Bonus (2500 coins)',
        '80% Fewer Ads',
        'Exclusive Premium Games',
        'Custom Avatars & Themes',
        'Weekly Gem Bonus (50 gems)'
      ],
      coinMultiplier: 5,
      adReduction: 0.8,
      popular: true
    },
    vip: {
      id: 'vip',
      name: 'VIP Elite',
      price: 499, // ₹499/month
      features: [
        '10x Daily Bonus (5000 coins)',
        '100% Ad-Free Experience',
        'All Exclusive Content',
        'Premium Support',
        'Monthly Gem Bonus (200 gems)',
        'Early Access to New Games'
      ],
      coinMultiplier: 10,
      adReduction: 1.0
    }
  };

  // Virtual Goods Store
  const VirtualStore = {
    themes: [
      { id: 'neon', name: 'Neon Glow Theme', price: 49, type: 'theme' },
      { id: 'royal', name: 'Royal Gold Theme', price: 99, type: 'theme' },
      { id: 'cyberpunk', name: 'Cyberpunk Theme', price: 149, type: 'theme' }
    ],
    avatars: [
      { id: 'crown', name: 'Golden Crown Avatar', price: 79, type: 'avatar' },
      { id: 'diamond', name: 'Diamond Ring Avatar', price: 129, type: 'avatar' }
    ],
    effects: [
      { id: 'fireworks', name: 'Win Fireworks Effect', price: 39, type: 'effect' },
      { id: 'coins_rain', name: 'Coin Rain Effect', price: 69, type: 'effect' }
    ]
  };

  // Purchase handler for subscriptions
  const handleSubscriptionPurchase = async (planId) => {
    const plan = SubscriptionPlans[planId];
    
    try {
      // Integrate with payment gateway (Razorpay, Stripe, etc.)
      const paymentResult = await processPayment({
        amount: plan.price,
        currency: 'INR',
        description: `${plan.name} Subscription`,
        userId: user.uid
      });

      if (paymentResult.success) {
        // Activate subscription
        setUserSubscription({
          plan: planId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          features: plan.features
        });

        // Track revenue
        setRevenueStats(prev => ({
          ...prev,
          monthlySubscriptions: prev.monthlySubscriptions + plan.price,
          netProfit: prev.netProfit + (plan.price * 0.85) // 85% profit after payment fees
        }));

        // Give user immediate benefits
        const bonusCoins = plan.coinMultiplier * 500;
        await updateVirtualBalance(bonusCoins, 0, `${plan.name} subscription bonus`);

        return { success: true };
      }
    } catch (error) {
      console.error('Subscription purchase failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Virtual goods purchase handler
  const handleVirtualPurchase = async (item) => {
    try {
      const paymentResult = await processPayment({
        amount: item.price,
        currency: 'INR',
        description: item.name,
        userId: user.uid
      });

      if (paymentResult.success) {
        // Track revenue
        setRevenueStats(prev => ({
          ...prev,
          virtualGoodsRevenue: prev.virtualGoodsRevenue + item.price,
          netProfit: prev.netProfit + (item.price * 0.95) // 95% profit (digital goods)
        }));

        // Activate item for user
        // This would save to user profile in real implementation
        console.log(`${item.name} purchased for user ${user.uid}`);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Virtual purchase failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Mock payment processor
  const processPayment = async (paymentData) => {
    // Integrate with actual payment gateway
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionId: `txn_${Date.now()}` });
      }, 2000);
    });
  };

  // Revenue sharing with users (10-20% as you mentioned)
  const UserRewardProgram = {
    dailyRevenue: adRevenueToday,
    userShare: 0.15, // 15% back to users
    
    calculateDailyRewards: () => {
      const totalReward = adRevenueToday * 0.15;
      const activeUsers = 1000; // Get from database
      return totalReward / activeUsers;
    },

    distributeRewards: async () => {
      const rewardPerUser = UserRewardProgram.calculateDailyRewards();
      const coinReward = Math.floor(rewardPerUser * 100); // Convert to coins
      
      // Give bonus coins to active users
      if (coinReward > 0) {
        await updateVirtualBalance(coinReward, 0, 'Daily revenue sharing bonus');
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>
        💰 Platform Monetization Dashboard
      </h1>

      {/* Revenue Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {Object.entries(revenueStats).map(([key, value]) => (
          <div key={key} style={{
            background: 'var(--glass-bg)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--primary-gold)', margin: '0 0 0.5rem 0' }}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', margin: 0 }}>
              {typeof value === 'number' ? 
                (key.includes('Revenue') || key.includes('Profit') ? 
                  `₹${value.toFixed(2)}` : value.toLocaleString()
                ) : value
              }
            </p>
          </div>
        ))}
      </div>

      {/* Monetization Methods */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Ad Revenue Section */}
        <div style={{
          background: 'var(--glass-bg)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            📺 Advertising Revenue
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Primary revenue source: 90-95% profit margin
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Revenue per ad view: $0.05-$0.10</strong><br/>
                              <strong>User reward: 10 coins (≈$0.00005)</strong><br/>
            <strong>Your profit: 90-95%</strong>
          </div>

          <button
            onClick={AdRewardSystem.showRewardedAd}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🎬 Show Test Ad
          </button>
        </div>

        {/* Subscription Revenue */}
        <div style={{
          background: 'var(--glass-bg)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            💎 Premium Subscriptions
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            High-value users: 85% profit margin
          </p>

          {Object.values(SubscriptionPlans).map(plan => (
            <div key={plan.id} style={{
              border: plan.popular ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--primary-gold)',
                  color: '#000',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  POPULAR
                </div>
              )}
              
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                {plan.name} - ₹{plan.price}/month
              </h3>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                margin: '0 0 1rem 0',
                paddingLeft: '1rem'
              }}>
                {plan.features.slice(0, 2).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscriptionPurchase(plan.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: plan.popular ? 'var(--primary-gold)' : 'var(--accent-green)',
                  color: plan.popular ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Purchase Plan
              </button>
            </div>
          ))}
        </div>

        {/* Virtual Goods Revenue */}
        <div style={{
          background: 'var(--glass-bg)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🎨 Virtual Goods Store
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Digital products: 95-98% profit margin
          </p>

          {[...VirtualStore.themes, ...VirtualStore.avatars, ...VirtualStore.effects]
            .slice(0, 4).map(item => (
            <div key={item.id} style={{
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                {item.name}
              </h4>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                ₹{item.price} • {item.type}
              </p>
              
              <button
                onClick={() => handleVirtualPurchase(item)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#8B5CF6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Purchase ₹{item.price}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Sharing Info */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid var(--accent-green)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>
          🤝 User Revenue Sharing Program
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0' }}>
          <strong>Daily Revenue:</strong> ₹{adRevenueToday.toFixed(2)} • 
          <strong> User Share (15%):</strong> ₹{(adRevenueToday * 0.15).toFixed(2)} • 
          <strong> Your Profit (85%):</strong> ₹{(adRevenueToday * 0.85).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default MonetizationSystem; 