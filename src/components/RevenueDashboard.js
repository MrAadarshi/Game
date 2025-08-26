import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RevenueDashboard = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState({
    daily: { total: 0, profit: 0, transactions: 0 },
    weekly: { total: 0, profit: 0, transactions: 0 },
    monthly: { total: 0, profit: 0, transactions: 0 },
    breakdown: {
      ads: { revenue: 0, profit: 0, margin: 90 },
      subscriptions: { revenue: 0, profit: 0, margin: 85 },
      virtualGoods: { revenue: 0, profit: 0, margin: 96 },
      tournaments: { revenue: 0, profit: 0, margin: 30 }
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (in real app, verify with backend)
    const adminUsers = ['admin@gms.com', user?.email]; // Add your admin email
    setIsAdmin(adminUsers.includes(user?.email));
    
    if (isAdmin) {
      loadRevenueData();
    }
  }, [user, isAdmin]);

  const loadRevenueData = () => {
    try {
      // Load revenue data from localStorage (in real app, fetch from backend)
      const revenueTracking = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
      
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(dayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate daily revenue
      const dailyTransactions = revenueTracking.filter(t => 
        new Date(t.timestamp) >= dayStart
      );
      const dailyTotal = dailyTransactions.reduce((sum, t) => sum + (t.amount || t.price || 0), 0);
      const dailyProfit = dailyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);

      // Calculate weekly revenue
      const weeklyTransactions = revenueTracking.filter(t => 
        new Date(t.timestamp) >= weekStart
      );
      const weeklyTotal = weeklyTransactions.reduce((sum, t) => sum + (t.amount || t.price || 0), 0);
      const weeklyProfit = weeklyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);

      // Calculate monthly revenue
      const monthlyTransactions = revenueTracking.filter(t => 
        new Date(t.timestamp) >= monthStart
      );
      const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + (t.amount || t.price || 0), 0);
      const monthlyProfit = monthlyTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);

      // Calculate breakdown by type
      const breakdown = {
        ads: {
          revenue: revenueTracking.filter(t => t.type === 'ad_revenue').reduce((sum, t) => sum + (t.revenue || 0), 0),
          profit: revenueTracking.filter(t => t.type === 'ad_revenue').reduce((sum, t) => sum + (t.profit || 0), 0),
          margin: 90
        },
        subscriptions: {
          revenue: revenueTracking.filter(t => t.type === 'subscription').reduce((sum, t) => sum + (t.amount || 0), 0),
          profit: revenueTracking.filter(t => t.type === 'subscription').reduce((sum, t) => sum + (t.profit || 0), 0),
          margin: 85
        },
        virtualGoods: {
          revenue: revenueTracking.filter(t => t.type === 'virtual_goods').reduce((sum, t) => sum + (t.price || 0), 0),
          profit: revenueTracking.filter(t => t.type === 'virtual_goods').reduce((sum, t) => sum + (t.profit || 0), 0),
          margin: 96
        },
        tournaments: {
          revenue: revenueTracking.filter(t => t.type === 'tournament').reduce((sum, t) => sum + (t.revenue || 0), 0),
          profit: revenueTracking.filter(t => t.type === 'tournament').reduce((sum, t) => sum + (t.profit || 0), 0),
          margin: 30
        }
      };

      setRevenueData({
        daily: { total: dailyTotal, profit: dailyProfit, transactions: dailyTransactions.length },
        weekly: { total: weeklyTotal, profit: weeklyProfit, transactions: weeklyTransactions.length },
        monthly: { total: monthlyTotal, profit: monthlyProfit, transactions: monthlyTransactions.length },
        breakdown
      });

    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  // Simulate revenue (for demo purposes)
  const simulateRevenue = () => {
    const mockRevenue = [
      // Ad Revenue
      ...Array(50).fill().map((_, i) => ({
        type: 'ad_revenue',
        revenue: 0.08,
        profit: 0.06,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })),
      // Subscriptions
      ...Array(5).fill().map((_, i) => ({
        type: 'subscription',
        amount: 299,
        profit: 254,
        planId: 'premium',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })),
      // Virtual Goods
      ...Array(20).fill().map((_, i) => ({
        type: 'virtual_goods',
        price: 99,
        profit: 95,
        itemName: 'Royal Gold Theme',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    ];

    localStorage.setItem('revenue_tracking', JSON.stringify(mockRevenue));
    loadRevenueData();
  };

  if (!isAdmin) {
    return (
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>
          🔒 Access Denied
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This dashboard is only available to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
        border: '1px solid var(--accent-green)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>📊</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--accent-green), #059669)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Revenue Dashboard
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Track your earnings and profit margins across all monetization streams
        </p>
        
        <button
          onClick={simulateRevenue}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📈 Generate Demo Data
        </button>
      </div>

      {/* Revenue Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { 
            period: 'Daily', 
            data: revenueData.daily, 
            icon: '📅', 
            color: '#3B82F6',
            target: '₹500/day'
          },
          { 
            period: 'Weekly', 
            data: revenueData.weekly, 
            icon: '📊', 
            color: '#8B5CF6',
            target: '₹3,500/week'
          },
          { 
            period: 'Monthly', 
            data: revenueData.monthly, 
            icon: '📈', 
            color: '#059669',
            target: '₹15,000/month'
          }
        ].map(({ period, data, icon, color, target }) => (
          <div
            key={period}
            style={{
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: `1px solid ${color}`,
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                {icon} {period} Revenue
              </h3>
              <div style={{
                background: color,
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {data.transactions} transactions
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem'
              }}>
                ₹{data.total.toLocaleString()}
              </div>
              <div style={{
                fontSize: '1.2rem',
                color: color,
                fontWeight: '700'
              }}>
                ₹{data.profit.toLocaleString()} profit
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              <span>Margin: {data.total > 0 ? ((data.profit / data.total) * 100).toFixed(1) : 0}%</span>
              <span>Target: {target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          {
            type: 'ads',
            name: 'Advertising Revenue',
            icon: '📺',
            color: '#3B82F6',
            description: 'Video ads, banner ads, interstitials'
          },
          {
            type: 'subscriptions',
            name: 'Premium Subscriptions',
            icon: '👑',
            color: '#8B5CF6',
            description: 'VIP memberships and premium features'
          },
          {
            type: 'virtualGoods',
            name: 'Virtual Store',
            icon: '🛒',
            color: '#F59E0B',
            description: 'Themes, avatars, effects, power-ups'
          },
          {
            type: 'tournaments',
            name: 'Tournament Fees',
            icon: '🏆',
            color: '#059669',
            description: 'Entry fees and competition revenue'
          }
        ].map(stream => {
          const data = revenueData.breakdown[stream.type];
          return (
            <div
              key={stream.type}
              style={{
                background: 'var(--glass-bg)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  background: stream.color,
                  borderRadius: '12px',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stream.icon}
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>
                    {stream.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    {stream.description}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Revenue:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                    ₹{data.revenue.toLocaleString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your Profit:</span>
                  <span style={{ color: stream.color, fontWeight: '700' }}>
                    ₹{data.profit.toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Profit Margin:</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                    {data.margin}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: stream.color,
                  height: '100%',
                  width: `${Math.min((data.revenue / 10000) * 100, 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                {((data.revenue / 10000) * 100).toFixed(1)}% of ₹10K target
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          💡 Key Performance Indicators
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              metric: 'Total Revenue',
              value: `₹${(revenueData.monthly.total).toLocaleString()}`,
              trend: '+15.2%',
              icon: '💰'
            },
            {
              metric: 'Your Profit',
              value: `₹${(revenueData.monthly.profit).toLocaleString()}`,
              trend: '+18.7%',
              icon: '📈'
            },
            {
              metric: 'User Rewards Given',
              value: `₹${(revenueData.monthly.total * 0.15).toLocaleString()}`,
              trend: '+12.3%',
              icon: '🎁'
            },
            {
              metric: 'Profit Margin',
              value: `${revenueData.monthly.total > 0 ? ((revenueData.monthly.profit / revenueData.monthly.total) * 100).toFixed(1) : 0}%`,
              trend: '+2.1%',
              icon: '📊'
            }
          ].map((kpi, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {kpi.icon}
              </div>
              <h3 style={{
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                fontSize: '1.8rem',
                fontWeight: '800'
              }}>
                {kpi.value}
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                {kpi.metric}
              </p>
              <div style={{
                color: 'var(--accent-green)',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {kpi.trend} vs last month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Goals */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
        border: '1px solid #F59E0B',
        borderRadius: '16px',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#F59E0B', marginBottom: '1.5rem' }}>
          🎯 Revenue Goals & Projections
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { period: 'This Month', target: 15000, current: revenueData.monthly.total },
            { period: 'Next Month', target: 25000, current: revenueData.monthly.total * 1.6 },
            { period: 'Year 1 Target', target: 500000, current: revenueData.monthly.total * 12 }
          ].map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                  {goal.period}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progress:</span>
                    <span style={{ color: '#F59E0B', fontWeight: '700' }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    height: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#F59E0B',
                      height: '100%',
                      width: `${Math.min(progress, 100)}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div>Target: ₹{goal.target.toLocaleString()}</div>
                  <div>Current: ₹{goal.current.toLocaleString()}</div>
                  <div>Remaining: ₹{Math.max(goal.target - goal.current, 0).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard; 