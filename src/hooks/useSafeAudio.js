import { useCallback, useRef, useEffect } from 'react';

export const useSafeAudio = () => {
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef(new Set());

  const createAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioContextRef.current;
    } catch (error) {
      console.log('Error creating AudioContext:', error.message);
      return null;
    }
  }, []);

  const playTone = useCallback((frequency, duration, waveType = 'sine', volume = 0.1) => {
    try {
      const audioContext = createAudioContext();
      if (!audioContext) return null;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      // Track active oscillator
      activeOscillatorsRef.current.add(oscillator);

      // Clean up when done
      oscillator.onended = () => {
        activeOscillatorsRef.current.delete(oscillator);
      };

      return oscillator;
    } catch (error) {
      console.log('Error playing tone:', error.message);
      return null;
    }
  }, [createAudioContext]);

  const stopAllOscillators = useCallback(() => {
    activeOscillatorsRef.current.forEach(oscillator => {
      try {
        if (oscillator && typeof oscillator.stop === 'function') {
          oscillator.stop();
        }
      } catch (error) {
        console.log('Oscillator already stopped:', error.message);
      }
    });
    activeOscillatorsRef.current.clear();
  }, []);

  const closeAudioContext = useCallback(() => {
    try {
      stopAllOscillators();
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    } catch (error) {
      console.log('Error closing AudioContext:', error.message);
    }
    audioContextRef.current = null;
  }, [stopAllOscillators]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeAudioContext();
    };
  }, [closeAudioContext]);

  return {
    playTone,
    stopAllOscillators,
    closeAudioContext,
    isContextClosed: () => !audioContextRef.current || audioContextRef.current.state === 'closed'
  };
}; 