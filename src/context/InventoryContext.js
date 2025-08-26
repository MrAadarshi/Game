import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [activeItems, setActiveItems] = useState({
    theme: null,
    avatar: null,
    effect: null,
    powerups: []
  });
  const [powerupTimers, setPowerupTimers] = useState({});

  // Load inventory and active items on user change
  useEffect(() => {
    if (user) {
      loadInventory();
      loadActiveItems();
      loadPowerupTimers();
    } else {
      setInventory([]);
      setActiveItems({ theme: null, avatar: null, effect: null, powerups: [] });
      setPowerupTimers({});
    }
  }, [user]);

  // Load user's inventory from localStorage
  const loadInventory = () => {
    try {
      const savedInventory = JSON.parse(localStorage.getItem(`inventory_${user.uid}`) || '[]');
      setInventory(savedInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    }
  };

  // Load active items from localStorage
  const loadActiveItems = () => {
    try {
      const savedActive = JSON.parse(localStorage.getItem(`active_items_${user.uid}`) || '{}');
      setActiveItems({
        theme: savedActive.theme || null,
        avatar: savedActive.avatar || null,
        effect: savedActive.effect || null,
        powerups: savedActive.powerups || []
      });
    } catch (error) {
      console.error('Error loading active items:', error);
    }
  };

  // Load powerup timers
  const loadPowerupTimers = () => {
    try {
      const savedTimers = JSON.parse(localStorage.getItem(`powerup_timers_${user.uid}`) || '{}');
      const now = Date.now();
      
      // Filter out expired powerups
      const validTimers = {};
      Object.entries(savedTimers).forEach(([powerupId, endTime]) => {
        if (endTime > now) {
          validTimers[powerupId] = endTime;
        }
      });
      
      setPowerupTimers(validTimers);
      
      // Update active powerups to only include non-expired ones
      setActiveItems(prev => ({
        ...prev,
        powerups: prev.powerups.filter(powerupId => validTimers[powerupId])
      }));
    } catch (error) {
      console.error('Error loading powerup timers:', error);
    }
  };

  // Save active items to localStorage
  const saveActiveItems = (newActiveItems) => {
    try {
      localStorage.setItem(`active_items_${user.uid}`, JSON.stringify(newActiveItems));
      setActiveItems(newActiveItems);
    } catch (error) {
      console.error('Error saving active items:', error);
    }
  };

  // Save powerup timers
  const savePowerupTimers = (timers) => {
    try {
      localStorage.setItem(`powerup_timers_${user.uid}`, JSON.stringify(timers));
      setPowerupTimers(timers);
    } catch (error) {
      console.error('Error saving powerup timers:', error);
    }
  };

  // Add item to inventory (called after purchase)
  const addToInventory = (item) => {
    const purchaseData = {
      ...item,
      purchaseDate: new Date().toISOString(),
      transactionId: `store_${Date.now()}`
    };

    const newInventory = [...inventory, purchaseData];
    setInventory(newInventory);
    
    try {
      localStorage.setItem(`inventory_${user.uid}`, JSON.stringify(newInventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }

    return purchaseData;
  };

  // Apply/activate an item
  const applyItem = (item) => {
    const newActiveItems = { ...activeItems };

    switch (item.type) {
      case 'theme':
        newActiveItems.theme = item;
        break;
      case 'avatar':
        newActiveItems.avatar = item;
        break;
      case 'effect':
        newActiveItems.effect = item;
        break;
      case 'powerup':
        // Calculate end time based on duration
        const endTime = Date.now() + (item.duration * 60 * 60 * 1000); // duration in hours
        const newTimers = {
          ...powerupTimers,
          [item.id]: endTime
        };
        
        if (!newActiveItems.powerups.includes(item.id)) {
          newActiveItems.powerups.push(item.id);
        }
        
        savePowerupTimers(newTimers);
        break;
      default:
        console.warn('Unknown item type:', item.type);
        return;
    }

    saveActiveItems(newActiveItems);
    
    // Apply theme immediately if it's a theme
    if (item.type === 'theme') {
      applyTheme(item);
    }

    console.log(`✅ Applied ${item.type}: ${item.name}`);
  };

  // Remove/deactivate an item
  const removeItem = (itemType, itemId = null) => {
    const newActiveItems = { ...activeItems };

    switch (itemType) {
      case 'theme':
        newActiveItems.theme = null;
        removeTheme();
        break;
      case 'avatar':
        newActiveItems.avatar = null;
        break;
      case 'effect':
        newActiveItems.effect = null;
        break;
      case 'powerup':
        if (itemId) {
          newActiveItems.powerups = newActiveItems.powerups.filter(id => id !== itemId);
          const newTimers = { ...powerupTimers };
          delete newTimers[itemId];
          savePowerupTimers(newTimers);
        }
        break;
    }

    saveActiveItems(newActiveItems);
    console.log(`❌ Removed ${itemType}${itemId ? `: ${itemId}` : ''}`);
  };

  // Apply theme to the app
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    switch (theme.id) {
      case 'neon_glow':
        root.style.setProperty('--primary-bg', 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)');
        root.style.setProperty('--card-bg', 'rgba(255, 0, 255, 0.1)');
        root.style.setProperty('--text-primary', '#ff00ff');
        root.style.setProperty('--accent-color', '#00ffff');
        root.style.setProperty('--border-color', '#ff00ff');
        root.style.setProperty('--primary-gold', '#00ffff');
        break;
        
      case 'royal_gold':
        root.style.setProperty('--primary-bg', 'linear-gradient(135deg, #1a1a0a 0%, #2a2a0a 100%)');
        root.style.setProperty('--card-bg', 'rgba(255, 215, 0, 0.1)');
        root.style.setProperty('--text-primary', '#ffd700');
        root.style.setProperty('--accent-color', '#ffd700');
        root.style.setProperty('--border-color', '#ffd700');
        root.style.setProperty('--primary-gold', '#ffd700');
        break;
        
      case 'cyberpunk':
        root.style.setProperty('--primary-bg', 'linear-gradient(135deg, #000011 0%, #001122 100%)');
        root.style.setProperty('--card-bg', 'rgba(0, 255, 255, 0.1)');
        root.style.setProperty('--text-primary', '#00ffff');
        root.style.setProperty('--accent-color', '#ff0080');
        root.style.setProperty('--border-color', '#00ffff');
        root.style.setProperty('--primary-gold', '#ff0080');
        break;
        
      case 'space_odyssey':
        root.style.setProperty('--primary-bg', 'linear-gradient(135deg, #000022 0%, #001144 100%)');
        root.style.setProperty('--card-bg', 'rgba(100, 149, 237, 0.1)');
        root.style.setProperty('--text-primary', '#6495ed');
        root.style.setProperty('--accent-color', '#9370db');
        root.style.setProperty('--border-color', '#6495ed');
        root.style.setProperty('--primary-gold', '#9370db');
        break;
        
      default:
        console.warn('Unknown theme:', theme.id);
    }

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
    
    console.log(`🎨 Applied theme: ${theme.name}`);
  };

  // Remove theme (revert to default)
  const removeTheme = () => {
    const root = document.documentElement;
    
    // Reset to default theme values
    root.style.removeProperty('--primary-bg');
    root.style.removeProperty('--card-bg');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--primary-gold');
    
    // Remove theme classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    console.log('🎨 Reverted to default theme');
  };

  // Check if item is owned
  const isItemOwned = (itemId) => {
    return inventory.some(item => item.id === itemId);
  };

  // Check if item is active
  const isItemActive = (itemId, itemType) => {
    switch (itemType) {
      case 'theme':
        return activeItems.theme?.id === itemId;
      case 'avatar':
        return activeItems.avatar?.id === itemId;
      case 'effect':
        return activeItems.effect?.id === itemId;
      case 'powerup':
        return activeItems.powerups.includes(itemId) && powerupTimers[itemId] > Date.now();
      default:
        return false;
    }
  };

  // Get active powerups with time remaining
  const getActivePowerups = () => {
    const now = Date.now();
    return activeItems.powerups
      .filter(powerupId => powerupTimers[powerupId] > now)
      .map(powerupId => {
        const item = inventory.find(inv => inv.id === powerupId);
        const timeRemaining = powerupTimers[powerupId] - now;
        return {
          ...item,
          timeRemaining,
          timeRemainingFormatted: formatTimeRemaining(timeRemaining)
        };
      });
  };

  // Format time remaining for display
  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get items by category
  const getItemsByCategory = (category) => {
    return inventory.filter(item => item.type === category);
  };

  // Get currently applied theme
  const getCurrentTheme = () => {
    return activeItems.theme;
  };

  // Get currently applied avatar
  const getCurrentAvatar = () => {
    return activeItems.avatar;
  };

  // Get currently applied effect
  const getCurrentEffect = () => {
    return activeItems.effect;
  };

  // Trigger effect (for game wins)
  const triggerEffect = () => {
    const effect = getCurrentEffect();
    if (!effect) return;

    console.log(`✨ Triggering effect: ${effect.name}`);
    
    // Create effect element
    const effectElement = document.createElement('div');
    effectElement.style.position = 'fixed';
    effectElement.style.top = '50%';
    effectElement.style.left = '50%';
    effectElement.style.transform = 'translate(-50%, -50%)';
    effectElement.style.fontSize = '4rem';
    effectElement.style.zIndex = '10000';
    effectElement.style.pointerEvents = 'none';
    effectElement.style.animation = 'bounce 2s ease-in-out';
    
    switch (effect.id) {
      case 'fireworks':
        effectElement.innerHTML = '🎆🎆🎆';
        break;
      case 'coin_rain':
        effectElement.innerHTML = '🪙🪙🪙';
        break;
      case 'lightning':
        effectElement.innerHTML = '⚡⚡⚡';
        break;
      default:
        effectElement.innerHTML = '✨✨✨';
    }
    
    document.body.appendChild(effectElement);
    
    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(effectElement);
    }, 2000);
  };

  const value = {
    inventory,
    activeItems,
    powerupTimers,
    
    // Item management
    addToInventory,
    applyItem,
    removeItem,
    isItemOwned,
    isItemActive,
    
    // Category getters
    getItemsByCategory,
    getCurrentTheme,
    getCurrentAvatar,
    getCurrentEffect,
    getActivePowerups,
    
    // Effects
    triggerEffect,
    
    // Utilities
    formatTimeRemaining,
    loadInventory
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}; 