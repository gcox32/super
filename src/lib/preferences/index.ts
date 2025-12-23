'use client';

import { useState, useEffect } from 'react';
import type { CompositeStrategy, LengthUnit, WeightUnit } from '@/types/stats';

export interface UserPreferences {
  bodyFatStrategy: CompositeStrategy;
  preferredWeightUnit: WeightUnit;
  preferredLengthUnit: LengthUnit;
  bodyFatMaxDaysOld: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  bodyFatStrategy: 'weighted_mean',
  preferredWeightUnit: 'lb',
  preferredLengthUnit: 'in',
  bodyFatMaxDaysOld: 30,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch('/api/me/preferences');
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
          }
        }
      } catch (error) {
        console.error('Failed to fetch preferences', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    // Optimistic update
    setPreferences((prev) => ({ ...prev, ...newPrefs }));

    try {
      await fetch('/api/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
    } catch (error) {
      console.error('Failed to update preferences', error);
    }
  };

  return { preferences, updatePreferences, loading };
}
