'use client';

import { useState, useEffect } from 'react';

export interface UserSettings {
  sleepReminder: boolean;
  sessionReminders: boolean;
  mealReminders: boolean;
  progressUpdates: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  sleepReminder: false,
  sessionReminders: false,
  mealReminders: false,
  progressUpdates: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/me/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    // Optimistic update
    setSettings((prev) => ({ ...prev, ...newSettings }));

    try {
      await fetch('/api/me/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  return { settings, updateSettings, loading };
}

