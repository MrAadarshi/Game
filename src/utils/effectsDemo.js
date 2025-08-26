// Effects Demo Utility
// This can be imported and used in game components to trigger effects

import { useInventory } from '../context/InventoryContext';

// Standalone function to trigger effects (for use in game components)
export const triggerWinEffect = (effectType = null) => {
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

  // Determine effect based on type or default
  switch (effectType) {
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
      effectElement.innerHTML = '✨🎉✨';
  }

  document.body.appendChild(effectElement);

  // Remove after animation
  setTimeout(() => {
    if (document.body.contains(effectElement)) {
      document.body.removeChild(effectElement);
    }
  }, 2000);

  console.log(`✨ Win effect triggered: ${effectType || 'default'}`);
};

// Hook-based effect trigger (for use in components with access to InventoryContext)
export const useWinEffects = () => {
  const { triggerEffect } = useInventory();
  
  return {
    triggerActiveEffect: triggerEffect,
    triggerCustomEffect: triggerWinEffect
  };
};

// Demo function to test all effects
export const demoAllEffects = () => {
  const effects = ['fireworks', 'coin_rain', 'lightning', null];
  
  effects.forEach((effect, index) => {
    setTimeout(() => {
      triggerWinEffect(effect);
    }, index * 3000); // 3 seconds apart
  });
  
  console.log('🎮 Effects demo started - all effects will play over 12 seconds');
};

// Power-up effect demonstrations
export const demoPowerUpEffects = () => {
  console.log('⚡ Power-up effects demo:');
  console.log('🍀 Luck Boost: Increases win probability in games');
  console.log('🧲 Coin Magnet: 20% bonus coins from all sources');
  console.log('💎 Double XP: 2x experience points for 24 hours');
  console.log('🛡️ Loss Protection: Reduces losses by 10% for 1 hour');
};

// Export for window access (debugging)
if (typeof window !== 'undefined') {
  window.demoAllEffects = demoAllEffects;
  window.demoPowerUpEffects = demoPowerUpEffects;
  window.triggerWinEffect = triggerWinEffect;
} 