import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const PremiumSubscription = () => {
  const { user } = useAuth();
  const { coins, updateVirtualBalance } = useVirtualCurrency();
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Subscription Plans with profit calculations
  const subscriptionPlans = {
    basic: {
      id: 'basic',
      name: 'Basic VIP',
      price: 99, // ₹99/month
      originalPrice: 149,
      features: [
        '2x Daily Bonus (1000 coins)',
        '50% Fewer Ads',
        'Priority Customer Support',
        'Exclusive Basic Themes',
        'Weekly Bonus: 200 extra coins'
      ],
      benefits: {
        coinMultiplier: 2,
        adReduction: 0.5,
        weeklyBonus: 200,
        exclusiveGames: false
      },
      popular: false,
      color: '#3B82F6'
    },
    premium: {
      id: 'premium',
      name: 'Premium VIP',
      price: 299, // ₹299/month
      originalPrice: 499,
      features: [
        '5x Daily Bonus (2500 coins)',
        '80% Fewer Ads',
        'Exclusive Premium Games',
        'Custom Avatars & Themes',
        'Weekly Gem Bonus (50 gems)',
        'Priority Support'
      ],
      benefits: {
        coinMultiplier: 5,
        adReduction: 0.8,
        weeklyBonus: 500,
        weeklyGems: 50,
        exclusiveGames: true
      },
      popular: true,
      color: '#8B5CF6'
    },
    elite: {
      id: 'elite',
      name: 'Elite VIP',
      price: 499, // ₹499/month
      originalPrice: 799,
      features: [
        '10x Daily Bonus (5000 coins)',
        '100% Ad-Free Experience',
        'All Exclusive Content',
        'VIP-Only Tournaments',
        'Monthly Gem Bonus (200 gems)',
        'Early Access to New Games',
        'Personal Account Manager'
      ],
      benefits: {
        coinMultiplier: 10,
        adReduction: 1.0,
        weeklyBonus: 1000,
        monthlyGems: 200,
        exclusiveGames: true,
        vipTournaments: true
      },
      popular: false,
      color: '#F59E0B'
    }
  };

  // Check current subscription status
  useEffect(() => {
    loadSubscriptionStatus();
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      // In real implementation, fetch from Firebase
      const mockSubscription = localStorage.getItem(`subscription_${user?.uid}`);
      if (mockSubscription) {
        setUserSubscription(JSON.parse(mockSubscription));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  // Process payment (integrate with Razorpay/Stripe)
  const processPayment = async (plan) => {
    return new Promise((resolve) => {
      // Simulate payment processing
      setTimeout(() => {
        // 95% success rate simulation
        const success = Math.random() > 0.05;
        resolve({
          success,
          transactionId: success ? `txn_${Date.now()}` : null,
          amount: plan.price
        });
      }, 2000);
    });
  };

  // Handle subscription purchase
  const handleSubscribe = async (planId) => {
    const plan = subscriptionPlans[planId];
    setLoading(true);
    setMessage('Processing payment...');

    try {
      // Process payment
      const paymentResult = await processPayment(plan);
      
      if (paymentResult.success) {
        // Create subscription
        const subscription = {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          benefits: plan.benefits,
          transactionId: paymentResult.transactionId,
          status: 'active'
        };

        // Save subscription (in real app, save to Firebase)
        localStorage.setItem(`subscription_${user.uid}`, JSON.stringify(subscription));
        setUserSubscription(subscription);

        // Give immediate bonus coins
        const bonusCoins = plan.benefits.coinMultiplier * 500;
        await updateVirtualBalance(bonusCoins, 0, `${plan.name} subscription bonus`);

        // Track revenue (for analytics)
        trackRevenue({
          type: 'subscription',
          amount: plan.price,
          planId: plan.id,
          userId: user.uid,
          profit: plan.price * 0.85 // 85% profit after payment fees
        });

        setMessage(`🎉 Welcome to ${plan.name}! You received ${bonusCoins} bonus coins!`);
        
        // Auto-clear message
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('❌ Payment failed. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('❌ Something went wrong. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Track revenue for analytics
  const trackRevenue = (revenueData) => {
    const existingRevenue = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
    existingRevenue.push({
      ...revenueData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('revenue_tracking', JSON.stringify(existingRevenue));
    
    console.log('💰 Revenue tracked:', revenueData);
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    try {
      // In real implementation, call API to cancel
      setUserSubscription(null);
      localStorage.removeItem(`subscription_${user.uid}`);
      setMessage('Subscription cancelled successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setMessage('❌ Failed to cancel subscription.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
        border: '1px solid #8B5CF6',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>👑</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #8B5CF6, #F59E0B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Premium VIP Plans
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Unlock exclusive features, bonus coins, and ad-free gaming experience!
        </p>
      </div>

      {/* Current Subscription Status */}
      {userSubscription && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
          border: '1px solid var(--accent-green)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: 'var(--accent-green)', margin: '0 0 1rem 0' }}>
            ✅ Active Subscription: {userSubscription.planName}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong>Plan:</strong> {userSubscription.planName}
              </p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong>Price:</strong> ₹{userSubscription.price}/month
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong>Expires:</strong> {new Date(userSubscription.endDate).toLocaleDateString()}
              </p>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <strong>Status:</strong> <span style={{ color: 'var(--accent-green)' }}>Active</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCancelSubscription}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--accent-red)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel Subscription
          </button>
        </div>
      )}

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

      {/* Subscription Plans */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {Object.values(subscriptionPlans).map(plan => (
          <div
            key={plan.id}
            style={{
              background: 'var(--glass-bg)',
              borderRadius: '20px',
              padding: '2rem',
              border: plan.popular ? `3px solid ${plan.color}` : '1px solid var(--border-color)',
              position: 'relative',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: plan.color,
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}>
                🔥 MOST POPULAR
              </div>
            )}

            {/* Plan Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                color: plan.color,
                fontSize: '1.8rem',
                fontWeight: '800',
                margin: '0 0 0.5rem 0'
              }}>
                {plan.name}
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: '900',
                  color: 'var(--text-primary)'
                }}>
                  ₹{plan.price}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  /month
                </span>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-red)',
                padding: '0.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                textDecoration: 'line-through'
              }}>
                Regular Price: ₹{plan.originalPrice}
              </div>
            </div>

            {/* Features List */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                ✨ Includes:
              </h3>
              
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0',
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem'
                    }}
                  >
                    <span style={{ color: plan.color, fontSize: '1.2rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || userSubscription?.planId === plan.id}
              style={{
                width: '100%',
                padding: '1rem',
                background: userSubscription?.planId === plan.id 
                  ? 'var(--glass-bg)' 
                  : `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                color: userSubscription?.planId === plan.id ? 'var(--text-secondary)' : '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: userSubscription?.planId === plan.id ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (userSubscription?.planId !== plan.id && !loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 8px 25px ${plan.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                '⏳ Processing...'
              ) : userSubscription?.planId === plan.id ? (
                '✅ Current Plan'
              ) : (
                `🚀 Subscribe Now - ₹${plan.price}/month`
              )}
            </button>

            {/* Savings Badge */}
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: 'var(--accent-green)',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              💰 Save ₹{plan.originalPrice - plan.price} per month!
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Comparison */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
          📊 Plan Comparison
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { feature: 'Daily Bonus Multiplier', basic: '2x', premium: '5x', elite: '10x' },
            { feature: 'Ad Reduction', basic: '50%', premium: '80%', elite: '100%' },
            { feature: 'Weekly Bonus Coins', basic: '200', premium: '500', elite: '1000' },
            { feature: 'Exclusive Games', basic: '❌', premium: '✅', elite: '✅' },
            { feature: 'Custom Themes', basic: 'Basic', premium: 'Premium', elite: 'All' },
            { feature: 'Support Priority', basic: 'Normal', premium: 'High', elite: 'VIP' }
          ].map((comparison, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                {comparison.feature}
              </h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div><strong>Basic:</strong> {comparison.basic}</div>
                <div><strong>Premium:</strong> {comparison.premium}</div>
                <div><strong>Elite:</strong> {comparison.elite}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
        border: '1px solid var(--accent-green)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'var(--accent-green)', margin: '0 0 1rem 0' }}>
          🛡️ 7-Day Money Back Guarantee
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Try any VIP plan risk-free! If you're not completely satisfied within 7 days, 
          we'll refund your money - no questions asked.
        </p>
      </div>
    </div>
  );
};

export default PremiumSubscription; 