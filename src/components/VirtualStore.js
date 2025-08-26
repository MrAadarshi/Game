import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import { useInventory } from '../context/InventoryContext';

const VirtualStore = () => {
  const { user } = useAuth();
  const { coins, gems, updateVirtualBalance } = useVirtualCurrency();
  const { 
    inventory, 
    addToInventory, 
    applyItem, 
    isItemOwned, 
    isItemActive, 
    loadInventory 
  } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState('themes');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load inventory when component mounts
  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user, loadInventory]);

  // Virtual Store Catalog with profit calculations
  const storeItems = {
    themes: [
      {
        id: 'neon_glow',
        name: 'Neon Glow Theme',
        description: 'Futuristic neon colors with glowing effects',
        price: 49,
        type: 'theme',
        rarity: 'common',
        image: '🌈',
        profit: 47, // 96% profit (₹47 out of ₹49)
        popular: false
      },
      {
        id: 'royal_gold',
        name: 'Royal Gold Theme',
        description: 'Luxury golden theme with royal elements',
        price: 99,
        type: 'theme',
        rarity: 'rare',
        image: '👑',
        profit: 95, // 96% profit
        popular: true
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk 2077 Theme',
        description: 'Dark cyberpunk theme with neon accents',
        price: 149,
        type: 'theme',
        rarity: 'epic',
        image: '🤖',
        profit: 142, // 95% profit
        popular: false
      },
      {
        id: 'space_odyssey',
        name: 'Space Odyssey Theme',
        description: 'Cosmic theme with stars and galaxies',
        price: 199,
        type: 'theme',
        rarity: 'legendary',
        image: '🚀',
        profit: 189, // 95% profit
        popular: false
      }
    ],
    avatars: [
      {
        id: 'crown_avatar',
        name: 'Golden Crown Avatar',
        description: 'Show your VIP status with a golden crown',
        price: 79,
        type: 'avatar',
        rarity: 'rare',
        image: '👑',
        profit: 76, // 96% profit
        popular: true
      },
      {
        id: 'diamond_ring',
        name: 'Diamond Ring Avatar',
        description: 'Sparkling diamond ring for winners',
        price: 129,
        type: 'avatar',
        rarity: 'epic',
        image: '💎',
        profit: 123, // 95% profit
        popular: false
      },
      {
        id: 'fire_mask',
        name: 'Fire Mask Avatar',
        description: 'Blazing fire mask for hot streaks',
        price: 89,
        type: 'avatar',
        rarity: 'rare',
        image: '🔥',
        profit: 85, // 96% profit
        popular: false
      }
    ],
    effects: [
      {
        id: 'fireworks',
        name: 'Victory Fireworks',
        description: 'Celebrate wins with spectacular fireworks',
        price: 39,
        type: 'effect',
        rarity: 'common',
        image: '🎆',
        profit: 37, // 95% profit
        popular: true
      },
      {
        id: 'coin_rain',
        name: 'Golden Coin Rain',
        description: 'Coins rain down when you win big',
        price: 69,
        type: 'effect',
        rarity: 'rare',
        image: '🪙',
        profit: 66, // 96% profit
        popular: true
      },
      {
        id: 'lightning',
        name: 'Lightning Strike',
        description: 'Epic lightning effects for massive wins',
        price: 99,
        type: 'effect',
        rarity: 'epic',
        image: '⚡',
        profit: 94, // 95% profit
        popular: false
      }
    ],
    powerups: [
      {
        id: 'luck_boost',
        name: '2x Luck Boost (24h)',
        description: 'Double your luck for 24 hours',
        price: 29,
        type: 'powerup',
        rarity: 'common',
        image: '🍀',
        profit: 28, // 97% profit
        duration: 24,
        popular: true
      },
      {
        id: 'coin_magnet',
        name: 'Coin Magnet (1 week)',
        description: '20% bonus coins from all sources for 1 week',
        price: 59,
        type: 'powerup',
        rarity: 'rare',
        image: '🧲',
        profit: 56, // 95% profit
        duration: 168,
        popular: true
      }
    ]
  };

  const categories = [
    { id: 'themes', name: 'Themes', icon: '🎨', count: storeItems.themes.length },
    { id: 'avatars', name: 'Avatars', icon: '👤', count: storeItems.avatars.length },
    { id: 'effects', name: 'Effects', icon: '✨', count: storeItems.effects.length },
    { id: 'powerups', name: 'Power-ups', icon: '⚡', count: storeItems.powerups.length }
  ];

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };

  // Handle item purchase
  const handlePurchase = async (item) => {
    if (isItemOwned(item.id)) {
      setMessage('❌ You already own this item!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (item.price > coins) {
      setMessage('❌ Insufficient coins! Earn more coins to purchase this item.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('Processing purchase...');

    try {
      // Simulate purchase processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Deduct coins
      await updateVirtualBalance(-item.price, 0, `Purchased ${item.name}`);

      // Add to inventory using InventoryContext
      const purchaseData = addToInventory(item);

      // Track revenue
      trackStoreRevenue({
        type: 'virtual_goods',
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        profit: item.profit,
        category: item.type,
        userId: user.uid,
        profitMargin: ((item.profit / item.price) * 100).toFixed(1)
      });

      setMessage(`🎉 Successfully purchased ${item.name}! Check your inventory to apply it!`);
      setTimeout(() => setMessage(''), 5000);

    } catch (error) {
      console.error('Purchase error:', error);
      setMessage('❌ Purchase failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle item application
  const handleApplyItem = async (item) => {
    try {
      setLoading(true);
      setMessage('Applying item...');

      // Use InventoryContext to apply the item
      applyItem(item);

      setMessage(`✅ Applied ${item.name}! Your changes are now active.`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Apply error:', error);
      setMessage('❌ Failed to apply item. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Track revenue for analytics
  const trackStoreRevenue = (revenueData) => {
    const existingRevenue = JSON.parse(localStorage.getItem('revenue_tracking') || '[]');
    existingRevenue.push({
      ...revenueData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('revenue_tracking', JSON.stringify(existingRevenue));
    
    console.log('💰 Store Revenue tracked:', revenueData);
    console.log(`📈 Profit: ₹${revenueData.profit} (${revenueData.profitMargin}% margin)`);
  };

  const currentItems = storeItems[selectedCategory] || [];

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
          <div style={{ fontSize: '3rem' }}>🛒</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #8B5CF6, #F59E0B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Virtual Store
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Customize your gaming experience with exclusive themes, avatars, and effects!
        </p>
      </div>

      {/* Quick Access to Inventory */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🎒</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600', marginLeft: '0.5rem' }}>
            You own {inventory.length} items
          </span>
        </div>
        <a 
          href="/inventory" 
          style={{
            color: 'var(--accent-color)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          → Manage your inventory and apply items
        </a>
      </div>

      {/* User Balance */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🪙</div>
          <div style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: '800' }}>
            {coins.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Coins</div>
        </div>
        
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
          <div style={{ color: '#8B5CF6', fontSize: '1.5rem', fontWeight: '800' }}>
            {gems.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gems</div>
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

      {/* Category Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        padding: '0.5rem 0'
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              background: selectedCategory === category.id 
                ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' 
                : 'var(--glass-bg)',
              color: selectedCategory === category.id ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
            <div>
              <div>{category.name}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {category.count} items
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {currentItems.map(item => {
          const isOwned = isItemOwned(item.id);
          const isActive = isItemActive(item.id, item.type);
          const canAfford = item.price <= coins;

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--glass-bg)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: `2px solid ${isActive ? '#22C55E' : isOwned ? '#F59E0B' : rarityColors[item.rarity]}`,
                position: 'relative',
                opacity: 1,
                transform: item.popular ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Status Badges */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  background: '#22C55E',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  ✅ ACTIVE
                </div>
              )}

              {!isActive && isOwned && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  background: '#F59E0B',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  📦 OWNED
                </div>
              )}

              {/* Popular Badge */}
              {item.popular && !isOwned && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '10px',
                  background: '#EF4444',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  🔥 POPULAR
                </div>
              )}

              {/* Item Image */}
              <div style={{
                fontSize: '4rem',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                {item.image}
              </div>

              {/* Item Info */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {item.name}
                </h3>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  margin: '0 0 1rem 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {item.description}
                </p>

                {/* Rarity */}
                <div style={{
                  display: 'inline-block',
                  background: rarityColors[item.rarity],
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  marginBottom: '1rem'
                }}>
                  {item.rarity}
                </div>
              </div>

              {/* Price and Actions */}
              <div style={{ textAlign: 'center' }}>
                {!isOwned && (
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--primary-gold)',
                    marginBottom: '1rem'
                  }}>
                    🪙 {item.price.toLocaleString()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!isOwned ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={loading || !canAfford}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: canAfford 
                          ? 'linear-gradient(135deg, var(--accent-green), #00CC70)'
                          : 'var(--glass-bg)',
                        color: canAfford ? '#000' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: canAfford && !loading ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        '⏳ Processing...'
                      ) : !canAfford ? (
                        '💰 Need More Coins'
                      ) : (
                        `🛒 Purchase`
                      )}
                    </button>
                  ) : (
                    <>
                      {!isActive && (
                        <button
                          onClick={() => handleApplyItem(item)}
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {loading ? '⏳ Applying...' : '✨ Apply Now'}
                        </button>
                      )}
                      
                      {isActive && (
                        <div style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#22C55E',
                          border: '1px solid #22C55E',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          textAlign: 'center'
                        }}>
                          ✅ Currently Active
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Duration for powerups */}
                {item.duration && (
                  <div style={{
                    marginTop: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem'
                  }}>
                    Duration: {item.duration}h
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Store Info */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))',
        border: '1px solid #3B82F6',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#3B82F6', margin: '0 0 1rem 0' }}>
          💡 Store Information
        </h3>
        <div style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.95rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          <div>
            <strong>🎨 Themes:</strong> Change your entire gaming interface
          </div>
          <div>
            <strong>👤 Avatars:</strong> Customize your profile appearance
          </div>
          <div>
            <strong>✨ Effects:</strong> Special animations for wins
          </div>
          <div>
            <strong>⚡ Power-ups:</strong> Temporary boosts and bonuses
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualStore; 