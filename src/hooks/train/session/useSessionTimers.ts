import { useState, useEffect, useRef } from 'react';

export function useSessionTimers() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [timerSoundsEnabled, setTimerSoundsEnabled] = useState(true);
  const [isRestComplete, setIsRestComplete] = useState(false);

  // Audio refs
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // Load timer-sound preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('super.timerSoundsEnabled');
      if (stored !== null) {
        setTimerSoundsEnabled(stored === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize audio elements
  useEffect(() => {
    if (countdownAudioRef.current) countdownAudioRef.current.load();
    if (completeAudioRef.current) completeAudioRef.current.load();

    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      try {
        if (countdownAudioRef.current) {
          await countdownAudioRef.current.play();
          countdownAudioRef.current.pause();
          countdownAudioRef.current.currentTime = 0;
        }
        audioUnlockedRef.current = true;
      } catch {
        // ignore
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  // Workout Timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest Timer
  useEffect(() => {
    if (!isResting || isPaused) return;
    if (restSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestSecondsRemaining((s) => {
        const nextValue = s - 1;
        
        // Play countdown sound
        if (nextValue === 3 && timerSoundsEnabled && countdownAudioRef.current) {
          try {
            const audio = countdownAudioRef.current;
            if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              audio.currentTime = 0;
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch((err) => {
                  if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
                    audioUnlockedRef.current = false;
                  }
                  console.debug('Countdown audio playback failed:', err);
                });
              }
            }
          } catch (err) {
            console.debug('Countdown audio error:', err);
          }
        }
        
        if (nextValue <= 0) {
          clearInterval(interval);
          setIsResting(false);
          setIsRestComplete(true);
          return 0;
        }
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isPaused, restSecondsRemaining, timerSoundsEnabled]);

  return {
    elapsedSeconds,
    setElapsedSeconds,
    isPaused,
    setIsPaused,
    isResting,
    setIsResting,
    restSecondsRemaining,
    setRestSecondsRemaining,
    timerSoundsEnabled,
    setTimerSoundsEnabled,
    countdownAudioRef,
    completeAudioRef,
    isRestComplete,
    setIsRestComplete,
  };
}

