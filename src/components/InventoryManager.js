import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

const InventoryManager = () => {
  const {
    inventory,
    activeItems,
    applyItem,
    removeItem,
    isItemActive,
    getItemsByCategory,
    getCurrentTheme,
    getCurrentAvatar,
    getCurrentEffect,
    getActivePowerups
  } = useInventory();

  const [selectedCategory, setSelectedCategory] = useState('themes');
  const [message, setMessage] = useState('');

  const categories = [
    { id: 'themes', name: 'Themes', icon: '🎨' },
    { id: 'avatars', name: 'Avatars', icon: '👤' },
    { id: 'effects', name: 'Effects', icon: '✨' },
    { id: 'powerups', name: 'Power-ups', icon: '⚡' }
  ];

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };

  const currentItems = getItemsByCategory(selectedCategory);
  const activePowerups = getActivePowerups();

  const handleApplyItem = (item) => {
    try {
      if (item.type === 'powerup') {
        // Check if powerup is already active
        if (isItemActive(item.id, 'powerup')) {
          setMessage('⚠️ This power-up is already active!');
          setTimeout(() => setMessage(''), 3000);
          return;
        }
      }

      applyItem(item);
      setMessage(`✅ Applied ${item.name}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error applying item:', error);
      setMessage('❌ Failed to apply item. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveItem = (itemType, itemId = null) => {
    try {
      removeItem(itemType, itemId);
      setMessage(`❌ Removed ${itemType}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing item:', error);
      setMessage('❌ Failed to remove item. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (inventory.length === 0) {
    return (
      <div className="container animate-fadeInUp">
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎒</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Empty Inventory
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Visit the Virtual Store to purchase themes, avatars, effects, and power-ups!
          </p>
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: '3rem' }}>🎒</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #8B5CF6, #F59E0B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            My Inventory
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          Manage and apply your purchased items • {inventory.length} items owned
        </p>
      </div>

      {/* Currently Active Items */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚡ Currently Active
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Active Theme */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              🎨 Theme
            </div>
            {getCurrentTheme() ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {getCurrentTheme().image}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                  {getCurrentTheme().name}
                </div>
                <button
                  onClick={() => handleRemoveItem('theme')}
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Default theme active
              </div>
            )}
          </div>

          {/* Active Avatar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              👤 Avatar
            </div>
            {getCurrentAvatar() ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {getCurrentAvatar().image}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                  {getCurrentAvatar().name}
                </div>
                <button
                  onClick={() => handleRemoveItem('avatar')}
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No avatar selected
              </div>
            )}
          </div>

          {/* Active Effect */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              ✨ Effect
            </div>
            {getCurrentEffect() ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  {getCurrentEffect().image}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                  {getCurrentEffect().name}
                </div>
                <button
                  onClick={() => handleRemoveItem('effect')}
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No effect selected
              </div>
            )}
          </div>

          {/* Active Power-ups */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              ⚡ Power-ups ({activePowerups.length})
            </div>
            {activePowerups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activePowerups.map(powerup => (
                  <div key={powerup.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    padding: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {powerup.image} {powerup.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>
                        {powerup.timeRemainingFormatted} left
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('powerup', powerup.id)}
                      style={{
                        background: 'var(--accent-red)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No active power-ups
              </div>
            )}
          </div>
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
        {categories.map(category => {
          const categoryCount = getItemsByCategory(category.id).length;
          
          return (
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
                  {categoryCount} owned
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {currentItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {currentItems.map(item => {
            const isActive = isItemActive(item.id, item.type);

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--glass-bg)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: `2px solid ${isActive ? '#22C55E' : rarityColors[item.rarity]}`,
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Active Badge */}
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

                {/* Item Image */}
                <div style={{
                  fontSize: '3rem',
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
                    fontSize: '1.1rem',
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

                  {/* Purchase Date */}
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    marginBottom: '1rem'
                  }}>
                    Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Apply/Remove Button */}
                <div style={{ textAlign: 'center' }}>
                  {isActive ? (
                    <button
                      onClick={() => handleRemoveItem(item.type, item.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--accent-red)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ❌ Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyItem(item)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ✅ Apply
                    </button>
                  )}

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
      ) : (
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {categories.find(cat => cat.id === selectedCategory)?.icon}
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No {categories.find(cat => cat.id === selectedCategory)?.name} Owned
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Visit the Virtual Store to purchase {categories.find(cat => cat.id === selectedCategory)?.name.toLowerCase()}!
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryManager; 