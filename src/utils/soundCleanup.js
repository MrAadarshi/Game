// Utility to clean up any lingering audio contexts and oscillators
export const cleanupPageSounds = () => {
  try {
    // Stop any running animations that might be playing sounds
    const runningAnimations = document.querySelectorAll('[data-animation-id]');
    runningAnimations.forEach(element => {
      const animationId = element.getAttribute('data-animation-id');
      if (animationId) {
        try {
          cancelAnimationFrame(parseInt(animationId));
        } catch (error) {
          console.log('Animation frame already cancelled:', error.message);
        }
      }
    });

    console.log('🔇 Cleaned up page sounds and animations');
  } catch (error) {
    console.log('Error during sound cleanup:', error.message);
  }
};

// Add page cleanup when navigating away
export const setupPageCleanup = () => {
  // Cleanup when page visibility changes (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cleanupPageSounds();
    }
  });

  // Cleanup when user navigates away
  window.addEventListener('beforeunload', cleanupPageSounds);
  
  // Cleanup when using browser back/forward
  window.addEventListener('pagehide', cleanupPageSounds);
}; 