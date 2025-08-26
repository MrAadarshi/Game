import React from 'react';
import { useSound } from '../context/SoundContext';

const GlobalSoundToggle = () => {
  const { globalSoundEnabled, toggleGlobalSound, playSound } = useSound();

  const handleToggle = () => {
    if (globalSoundEnabled) {
      // If turning off, play a quick sound before disabling
      playSound('button', true);
      setTimeout(() => {
        toggleGlobalSound();
      }, 100);
    } else {
      // If turning on, toggle first then play sound
      toggleGlobalSound();
      setTimeout(() => {
        playSound('button', true);
      }, 100);
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: globalSoundEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        border: `1px solid ${globalSoundEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: '6px',
        padding: '4px',
        color: globalSoundEnabled ? '#22C55E' : '#EF4444',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = globalSoundEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = globalSoundEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      }}
      title={`${globalSoundEnabled ? 'Disable' : 'Enable'} sound for all games`}
    >
      {globalSoundEnabled ? '🔊' : '🔇'}
    </button>
  );
};

export default GlobalSoundToggle; 