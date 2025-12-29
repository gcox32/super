import type { TapeMeasurement } from '@/types/user';
import type { DistanceMeasurement } from '@/types/measures';

function convertToCm(measurement: DistanceMeasurement | undefined): number {
  if (!measurement) return 0;
  if (measurement.unit === 'cm') return measurement.value;
  if (measurement.unit === 'in') return measurement.value * 2.54;
  if (measurement.unit === 'm') return measurement.value * 100;
  return measurement.value; // fallback
}

function calculateRatio(
  numerator: DistanceMeasurement | undefined,
  denominator: DistanceMeasurement | undefined
): number | null {
  if (!numerator || !denominator) return null;
  const numCm = convertToCm(numerator);
  const denCm = convertToCm(denominator);
  if (denCm === 0) return null;
  return numCm / denCm;
}

export interface RatioConfig {
  label: string;
  calculate: (tape: TapeMeasurement) => number | null;
  perspective?: number; // Target/ideal value for this ratio
}

export const maleRatios: RatioConfig[] = [
  {
    label: 'Shoulder-to-Waist',
    calculate: (tape) => calculateRatio(tape.shoulders, tape.waist),
    perspective: 1.618,
  },
  {
    label: 'Chest-to-Waist',
    calculate: (tape) => calculateRatio(tape.chest, tape.waist),
    perspective: 1.35
  },
  {
    label: 'Arm-to-Waist',
    calculate: (tape) => {
      // Average of left and right arm measurements
      if (!tape.leftArm || !tape.rightArm || !tape.waist) return null;
      const leftArmCm = convertToCm(tape.leftArm);
      const rightArmCm = convertToCm(tape.rightArm);
      const avgArmCm = (leftArmCm + rightArmCm) / 2;
      const waistCm = convertToCm(tape.waist);
      if (waistCm === 0) return null;
      return avgArmCm / waistCm;
    },
    perspective: 0.5,
  },
];

export const femaleRatios: RatioConfig[] = [
  {
    label: 'Waist-to-Hips',
    calculate: (tape) => calculateRatio(tape.waist, tape.hips),
    perspective: 0.7,
  },
  {
    label: 'Chest-to-Waist',
    calculate: (tape) => calculateRatio(tape.chest, tape.waist),
  },
  {
    label: 'Shoulder-to-Hips',
    calculate: (tape) => calculateRatio(tape.shoulders, tape.hips),
  },
];

export function getRatiosForGender(
  gender: 'male' | 'female' | undefined,
  tape: TapeMeasurement | undefined
): Array<{ label: string; value: number | null; perspective?: number }> {
  if (!gender || !tape) return [];

  const configs = gender === 'male' ? maleRatios : femaleRatios;
  
  return configs
    .map(config => ({
      label: config.label,
      value: config.calculate(tape),
      perspective: config.perspective,
    }))
    .filter(ratio => ratio.value !== null); // Only show ratios that can be calculated
}

