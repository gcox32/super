import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  getUserStats,
  createUserStats,
  getLatestUserStats,
  getUserStatsById,
  deleteUserStats,
  getUserProfile,
} from '@/lib/db/crud';
import { getQueryParam } from '@/lib/api/helpers';
import { estimateBodyFat } from '@/lib/stats/bodyfat';
import { getLatestStatsValues, getLatestHeight, getLatestArmLength, getLatestLegLength, calculateAge } from '@/lib/stats/bodyfat/helpers';
import type { BodyFatInput } from '@/types/stats';
import type { CompositeStrategy } from '@/types/stats';

// GET /api/user/stats - Get all user stats (or latest if ?latest=true)
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const latest = getQueryParam(request.url, 'latest') === 'true';

    if (latest) {
      const stats = await getLatestUserStats(userId);
      return { stats };
    }

    const stats = await getUserStats(userId);
    return { stats };
  });
}

// POST /api/user/stats - Create a new stats entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody<{
      date?: string;
      height?: { value: number; unit: string };
      weight?: { value: number; unit: string };
      armLength?: { value: number; unit: string };
      legLength?: { value: number; unit: string };
      bodyFatPercentage?: { value: number; unit?: string };
      muscleMass?: { value: number; unit: string };
      tapeMeasurements?: Record<string, { value: number; unit: string }>;
      bodyFatStrategy?: CompositeStrategy; // Optional: sent from frontend
      bodyFatMaxDaysOld?: number; // Optional: sent from frontend
    }>(request);

    // Check if ANY stats data was submitted
    const hasAnyData = !!(
      body.height ||
      body.weight ||
      body.armLength ||
      body.legLength ||
      body.bodyFatPercentage ||
      body.muscleMass ||
      body.tapeMeasurements ||
      body.date
    );

    if (!hasAnyData) {
      return { error: 'No stats data provided' };
    }

    // Always fetch latest values to fill in missing data
    const maxDaysOld = body.bodyFatMaxDaysOld ?? 30;
    
    // Fetch height, armLength, and legLength separately (ignores staleness - these rarely change)
    const latestHeight = await getLatestHeight(userId);
    const latestArmLength = await getLatestArmLength(userId);
    const latestLegLength = await getLatestLegLength(userId);
    
    // Fetch other values with staleness constraint
    const latestValues = await getLatestStatsValues(userId, maxDaysOld);
    // Always use latest height, armLength, legLength, and weight (submitted takes precedence)
    const height = body.height || latestHeight;
    const armLength = body.armLength || latestArmLength;
    const legLength = body.legLength || latestLegLength;
    const weight = body.weight || latestValues.weight;
    
    // Merge tape measurements: use submitted values, fill in missing from latest
    const mergedTape = {
      ...(latestValues.tapeMeasurements || {}),
      ...(body.tapeMeasurements || {}),
    };
    const tapeMeasurements = Object.keys(mergedTape).length > 0 ? mergedTape : undefined;

    // Calculate body fat if we have required inputs and it wasn't directly submitted
    let calculatedBodyFat: number | undefined;

    if (!body.bodyFatPercentage && height && weight) {
      const neck = tapeMeasurements?.neck;
      const waist = tapeMeasurements?.waist;
      const hip = tapeMeasurements?.hips;

      // Check if we have the minimum required: neck and waist
      if (neck && waist && typeof neck.value === 'number' && typeof waist.value === 'number') {
        // Get user profile for gender and age
        const profile = await getUserProfile(userId);

        if (profile?.gender && profile?.birthDate) {
          const age = calculateAge(profile.birthDate);
          const strategy = body.bodyFatStrategy || 'median';

          // Normalize units for BodyFatInput
          let heightValue = height.value;
          let heightUnit: 'in' | 'cm';
          if (height.unit === 'm') {
            heightValue = height.value * 100;
            heightUnit = 'cm';
          } else if (height.unit === 'ft') {
            heightValue = height.value * 12;
            heightUnit = 'in';
          } else if (height.unit === 'cm') {
            heightUnit = 'cm';
          } else {
            heightUnit = 'in';
          }

          let weightValue = weight.value;
          let weightUnit: 'lb' | 'kg';
          if (weight.unit === 'lbs' || weight.unit === 'lb') {
            weightUnit = 'lb';
          } else {
            weightUnit = 'kg';
          }

          let circumferenceUnit: 'in' | 'cm';
          if (neck.unit === 'cm') {
            circumferenceUnit = 'cm';
          } else {
            circumferenceUnit = 'in';
          }

          // Build BodyFatInput
          const bfInput: BodyFatInput = {
            gender: profile.gender,
            age,
            height: heightValue,
            heightUnit,
            weight: weightValue,
            weightUnit,
            neck: neck.value,
            waist: waist.value,
            hip: hip?.value,
            circumferenceUnit,
            composite: {
              strategy: strategy as CompositeStrategy,
            },
          };

          try {
            const result = estimateBodyFat(bfInput);
            if (Number.isFinite(result.composite.bf) && result.composite.bf >= 0 && result.composite.bf <= 100) {
              calculatedBodyFat = result.composite.bf;
            }
          } catch (error) {
            console.error('Body fat calculation error:', error);
          }
        }
      }
    }

    // Build complete stats data: include submitted values or latest values (if they exist)
    const statsData: any = {
      date: body.date ? new Date(body.date) : new Date(), // Use submitted date or now
    };

    // Include height if submitted or latest exists
    if (height) {
      statsData.height = height;
    }

    // Include armLength if submitted or latest exists
    if (armLength) {
      statsData.armLength = armLength;
    }

    // Include legLength if submitted or latest exists
    if (legLength) {
      statsData.legLength = legLength;
    }

    // Include weight if submitted or latest exists
    if (weight) {
      statsData.weight = weight;
    }

    // Include muscle mass if submitted
    if (body.muscleMass) {
      statsData.muscleMass = body.muscleMass;
    }

    // Include tape measurements if submitted
    if (body.tapeMeasurements) {
      statsData.tapeMeasurements = body.tapeMeasurements;
    }

    // Include body fat: use submitted if provided, otherwise use calculated
    if (body.bodyFatPercentage) {
      statsData.bodyFatPercentage = body.bodyFatPercentage;
    } else if (calculatedBodyFat !== undefined) {
      statsData.bodyFatPercentage = {
        value: calculatedBodyFat,
        unit: '%',
      };
    }

    const stats = await createUserStats(userId, statsData);
    return { stats };
  });
}

