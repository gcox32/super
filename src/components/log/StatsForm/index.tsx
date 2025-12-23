'use client';

import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { TapeMeasurement } from '@/types/user';
import type { HeightMeasurement, WeightMeasurement, PercentageMeasurement, DistanceMeasurement } from '@/types/measures';
import { useToast } from '@/components/ui/Toast';
import { usePreferences } from '@/lib/preferences';
import AnthropometryField from './AnthropometryField';
import BodyFatField from './BodyFatField';
import MuscleMassField from './MuscleMassField';
import TapeMeasurementsField from './TapeMeasurementsField';

type CreateStatsPayload = {
  date?: string;
  height?: HeightMeasurement;
  weight?: WeightMeasurement;
  armLength?: HeightMeasurement;
  legLength?: HeightMeasurement;
  bodyFatPercentage?: PercentageMeasurement;
  muscleMass?: WeightMeasurement;
  tapeMeasurements?: Partial<TapeMeasurement>;
};

type StatsFormProps = {
  onSuccess?: () => void;
};

export default function StatsForm({ onSuccess }: StatsFormProps) {
  const { preferences } = usePreferences();
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState('');

  // Weight (always visible)
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');

  // Expandable sections
  const [showAnthropometry, setShowAnthropometry] = useState(false);
  const [showBodyFat, setShowBodyFat] = useState(false);
  const [showMuscleMass, setShowMuscleMass] = useState(false);
  const [showTapeMeasurements, setShowTapeMeasurements] = useState(false);

  // Height
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm' | 'in' | 'ft'>('in');

  // Arm length
  const [armLength, setArmLength] = useState('');
  const [armLengthUnit, setArmLengthUnit] = useState<'cm' | 'm' | 'in' | 'ft'>('in');

  // Leg length
  const [legLength, setLegLength] = useState('');
  const [legLengthUnit, setLegLengthUnit] = useState<'cm' | 'm' | 'in' | 'ft'>('in');

  // Body fat
  const [bodyFat, setBodyFat] = useState('');

  // Muscle mass
  const [muscleMass, setMuscleMass] = useState('');
  const [muscleMassUnit, setMuscleMassUnit] = useState<'kg' | 'lbs'>('lbs');

  // Tape measurements
  const [tapeMeasurements, setTapeMeasurements] = useState<Record<string, { value: string; unit: 'cm' | 'in' }>>({});

  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: CreateStatsPayload = {};
      if (date) payload.date = date;

      if (weight) {
        payload.weight = {
          value: Number(weight),
          unit: weightUnit,
        };
      }

      if (showAnthropometry) {
        if (height) {
          payload.height = {
            value: Number(height),
            unit: heightUnit,
          };
        }
        if (armLength) {
          payload.armLength = {
            value: Number(armLength),
            unit: armLengthUnit,
          };
        }
        if (legLength) {
          payload.legLength = {
            value: Number(legLength),
            unit: legLengthUnit,
          };
        }
      }

      if (showBodyFat && bodyFat) {
        payload.bodyFatPercentage = {
          value: Number(bodyFat),
          unit: '%',
        };
      }

      if (showMuscleMass && muscleMass) {
        payload.muscleMass = {
          value: Number(muscleMass),
          unit: muscleMassUnit,
        };
      }

      if (showTapeMeasurements) {
        const tape: Partial<Record<keyof TapeMeasurement, DistanceMeasurement>> = {};
        const tapeFields: Array<keyof TapeMeasurement> = [
          'neck', 'shoulders', 'chest', 'waist', 'hips',
          'leftArm', 'rightArm', 'leftLeg', 'rightLeg',
          'leftForearm', 'rightForearm', 'leftCalf', 'rightCalf',
        ];

        tapeFields.forEach((field) => {
          const data = tapeMeasurements[field];
          if (data?.value) {
            const measurement: DistanceMeasurement = {
              value: Number(data.value),
              unit: data.unit === 'cm' ? 'cm' : 'in',
            };
            tape[field] = measurement;
          }
        });

        if (Object.keys(tape).length > 0) {
          payload.tapeMeasurements = tape as Partial<TapeMeasurement>;
        }
      }

      // Include body fat calculation preferences from localStorage
      const bodyFatStrategy = preferences.bodyFatStrategy;
      const bodyFatMaxDaysOld = preferences.bodyFatMaxDaysOld;

      const res = await fetch('/api/me/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          date: payload.date ? new Date(payload.date) : undefined,
          bodyFatStrategy, // Send strategy to backend for calculation
          bodyFatMaxDaysOld, // Send max days old to backend
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to create stats');
      }

      // Reset form
      setWeight('');
      setHeight('');
      setArmLength('');
      setLegLength('');
      setBodyFat('');
      setMuscleMass('');
      setTapeMeasurements({});
      setShowAnthropometry(false);
      setShowBodyFat(false);
      setShowMuscleMass(false);
      setShowTapeMeasurements(false);

      showToast({
        variant: 'success',
        title: 'Stats logged',
        description: 'Your body stats entry has been saved.',
      });

      onSuccess?.();
    } catch (e: any) {
      showToast({
        variant: 'error',
        title: 'Could not log stats',
        description: e.message || 'There was a problem saving your stats.',
      });
    } finally {
      setSaving(false);
    }
  }

  function updateTapeMeasurement(field: string, value: string, unit: 'cm' | 'in') {
    setTapeMeasurements((prev) => ({
      ...prev,
      [field]: { value, unit },
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-card px-4 py-4 border border-border rounded-xl"
    >
      {/* Date and Weight (always visible) */}
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="stats-date"
            className="block font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]"
          >
            Date
          </label>
          <input
            id="stats-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-[92%]! text-white text-sm transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="stats-weight"
            className="block font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]"
          >
            Weight
          </label>
          <div className="flex gap-2">
            <input
              id="stats-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
              placeholder="180"
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expandable sections */}
      <div className="space-y-3 pt-2">
        <TapeMeasurementsField
          isExpanded={showTapeMeasurements}
          onExpand={() => setShowTapeMeasurements(true)}
          onCollapse={() => {
            setShowTapeMeasurements(false);
            setTapeMeasurements({});
          }}
          measurements={tapeMeasurements}
          onMeasurementChange={updateTapeMeasurement}
        />

        <BodyFatField
          isExpanded={showBodyFat}
          onExpand={() => setShowBodyFat(true)}
          onCollapse={() => {
            setShowBodyFat(false);
            setBodyFat('');
          }}
          value={bodyFat}
          onValueChange={setBodyFat}
        />

        <MuscleMassField
          isExpanded={showMuscleMass}
          onExpand={() => setShowMuscleMass(true)}
          onCollapse={() => {
            setShowMuscleMass(false);
            setMuscleMass('');
          }}
          value={muscleMass}
          unit={muscleMassUnit}
          onValueChange={setMuscleMass}
          onUnitChange={setMuscleMassUnit}
        />

        <AnthropometryField
          isExpanded={showAnthropometry}
          onExpand={() => setShowAnthropometry(true)}
          onCollapse={() => {
            setShowAnthropometry(false);
            setHeight('');
            setArmLength('');
            setLegLength('');
          }}
          height={height}
          heightUnit={heightUnit}
          onHeightChange={setHeight}
          onHeightUnitChange={setHeightUnit}
          armLength={armLength}
          armLengthUnit={armLengthUnit}
          onArmLengthChange={setArmLength}
          onArmLengthUnitChange={setArmLengthUnit}
          legLength={legLength}
          legLengthUnit={legLengthUnit}
          onLegLengthChange={setLegLength}
          onLegLengthUnitChange={setLegLengthUnit}
        />

      </div>

      <div className="pt-1">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Log stats'
          )}
        </Button>
      </div>
    </form>
  );
}

