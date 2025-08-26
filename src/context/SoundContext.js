import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSafeAudio } from '../hooks/useSafeAudio';

const SoundContext = createContext();

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }) => {
  const [globalSoundEnabled, setGlobalSoundEnabled] = useState(true);
  const { playTone, stopAllOscillators, closeAudioContext } = useSafeAudio();

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundSetting = localStorage.getItem('soundEnabled');
    if (savedSoundSetting !== null) {
      setGlobalSoundEnabled(JSON.parse(savedSoundSetting));
    }
  }, []);

  // Save sound preference when changed
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(globalSoundEnabled));
  }, [globalSoundEnabled]);

  // Clean up all sounds when component unmounts
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const toggleGlobalSound = () => {
    const newSoundState = !globalSoundEnabled;
    setGlobalSoundEnabled(newSoundState);
    
    // If turning off sound, stop all currently playing sounds
    if (!newSoundState) {
      stopAllSounds();
    }
  };

  const stopAllSounds = () => {
    stopAllOscillators();
  };

  const playSound = (type, gameSpecificEnabled = true) => {
    // Check both global and game-specific sound settings
    if (!globalSoundEnabled || !gameSpecificEnabled) {
      return null;
    }

    let frequency, duration, waveType, volume = 0.1;

    switch (type) {
      case 'takeoff':
        frequency = 800;
        duration = 0.3;
        waveType = 'sine';
        break;
      case 'flying':
        frequency = 1000;
        duration = 0.1;
        waveType = 'triangle';
        volume = 0.05; // Quieter for repeated sounds
        break;
      case 'crash':
        frequency = 200;
        duration = 0.8;
        waveType = 'sawtooth';
        break;
      case 'cashout':
        frequency = 1200;
        duration = 0.4;
        waveType = 'sine';
        break;
      case 'button':
      case 'bet_placed':
        frequency = 600;
        duration = 0.2;
        waveType = 'sine';
        volume = 0.08;
        break;
      case 'win':
        frequency = 1000;
        duration = 0.6;
        waveType = 'sine';
        break;
      case 'lose':
        frequency = 300;
        duration = 0.4;
        waveType = 'sawtooth';
        break;
      case 'flip':
        frequency = 800;
        duration = 0.3;
        waveType = 'triangle';
        break;
      case 'join':
        frequency = 900;
        duration = 0.3;
        waveType = 'sine';
        break;
      default:
        frequency = 500;
        duration = 0.2;
        waveType = 'sine';
    }

    return playTone(frequency, duration, waveType, volume);
  };

  const value = {
    globalSoundEnabled,
    toggleGlobalSound,
    playSound,
    stopAllSounds
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}; 