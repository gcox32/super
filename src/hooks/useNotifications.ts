import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (e) {
      console.error('Failed to request notification permission', e);
      return false;
    }
  }, []);

  const scheduleNotification = useCallback((title: string, options?: NotificationOptions, delayMs: number = 0) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (permission !== 'granted') {
        // Try requesting if not explicitly denied
        if (permission === 'default') {
            requestPermission().then(granted => {
                if (granted) scheduleNotification(title, options, delayMs);
            });
        }
        return;
    }

    if (delayMs <= 0) {
        // Immediate
        new Notification(title, options);
    } else {
        // Scheduled
        setTimeout(() => {
            new Notification(title, options);
        }, delayMs);
    }
  }, [permission, requestPermission]);

  return {
    permission,
    requestPermission,
    scheduleNotification
  };
}

