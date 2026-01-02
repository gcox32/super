import type { UserProfile, UserGoal, UserGoalComponent } from '@/types/user';
import type { HeightMeasurement, WeightMeasurement, PercentageMeasurement } from '@/types/measures';

// Conversion constants
const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'sedentary': 1.2,           // Little to no exercise
  'lightly active': 1.375,    // Light exercise 1-3 days/week
  'moderately active': 1.55,  // Moderate exercise 3-5 days/week
  'very active': 1.725,       // Hard exercise 6-7 days/week
  'extra active': 1.9,        // Very hard exercise, physical job
};

// Goal type for calorie adjustments
type GoalType = 'cut' | 'recomp' | 'gain' | 'maintenance';

export interface FuelRecommendations {
  bmr?: number;              // Basal Metabolic Rate (calories/day)
  tdee?: number;             // Total Daily Energy Expenditure (calories/day)
  calorieTarget?: number;    // Target calories based on goals (calories/day)
  macros?: {
    protein?: number;        // grams
    carbs?: number;          // grams
    fat?: number;            // grams
  };
}

/**
 * Convert height to centimeters
 */
function heightToCm(height: HeightMeasurement): number {
  const { value, unit } = height;
  switch (unit) {
    case 'cm':
      return value;
    case 'm':
      return value * 100;
    case 'in':
      return value * IN_TO_CM;
    case 'ft':
      return value * IN_TO_CM * 12;
    default:
      throw new Error(`Unsupported height unit: ${unit}`);
  }
}

/**
 * Convert weight to kilograms
 */
function weightToKg(weight: WeightMeasurement): number {
  const { value, unit } = weight;
  switch (unit) {
    case 'kg':
      return value;
    case 'lbs':
      return value * LB_TO_KG;
    default:
      throw new Error(`Unsupported weight unit: ${unit}`);
  }
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate Lean Body Mass (LBM) from weight and body fat percentage
 */
function calculateLBM(weightKg: number, bodyFatPercentage?: number): number {
  if (bodyFatPercentage !== undefined && bodyFatPercentage > 0 && bodyFatPercentage < 100) {
    return weightKg * (1 - bodyFatPercentage / 100);
  }
  // If body fat is not available, estimate it based on typical values
  // This is a fallback - ideally body fat should be measured
  // Rough estimate: assume 15% for males, 25% for females (will be refined if we have gender)
  return weightKg * 0.85; // Conservative estimate assuming ~15% body fat
}

/**
 * Estimate body fat percentage if not available
 * Uses a simple BMI-based estimation as fallback
 */
function estimateBodyFatPercentage(
  weightKg: number,
  heightCm: number,
  gender?: 'male' | 'female',
  bodyFatPercentage?: PercentageMeasurement
): number {
  // If body fat is already provided, use it
  if (bodyFatPercentage?.value !== undefined) {
    return bodyFatPercentage.value;
  }

  // Try to calculate using available stats
  // This is a simplified fallback - ideally body fat should be measured
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  
  // Simple BMI-based estimation (not very accurate, but better than nothing)
  if (gender === 'male') {
    return Math.max(5, Math.min(40, 1.2 * bmi + 0.23 * 30 - 10.8 * 1 - 5.4)); // Rough estimate
  } else if (gender === 'female') {
    return Math.max(10, Math.min(45, 1.2 * bmi + 0.23 * 30 - 10.8 * 0 - 5.4)); // Rough estimate
  }
  
  // Default to 20% if we can't estimate
  return 20;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Katch-McArdle equation
 * BMR = 370 + 21.6 * LBM_kg
 */
function calculateBMR(lbmKg: number): number {
  return 370 + 21.6 * lbmKg;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS['sedentary'];
  return bmr * multiplier;
}

/**
 * Determine goal type from user goals
 * Returns 'cut', 'recomp', 'gain', or 'maintenance'
 * Considers all active goal components and selects the highest priority one
 */
function determineGoalType(
  goals: UserGoal[] | undefined,
  currentWeightKg: number
): GoalType {
  if (!goals || goals.length === 0) return 'maintenance';

  // Collect all active components from incomplete goals
  // Include both bodycomposition and bodyweight components
  const activeComponents: Array<{
    component: UserGoalComponent;
    priority: number;
  }> = [];

  for (const goal of goals) {
    if (goal.complete) continue;

    for (const component of goal.components || []) {
      // Only consider bodycomposition and bodyweight components
      if (component.type === 'bodycomposition' || component.type === 'bodyweight') {
        activeComponents.push({
          component,
          priority: component.priority || 999, // Higher number = lower priority
        });
      }
    }
  }

  if (activeComponents.length === 0) return 'maintenance';

  // Sort by priority (lower number = higher priority)
  activeComponents.sort((a, b) => a.priority - b.priority);

  // Get the highest priority component
  const highestPriorityComponent = activeComponents[0].component;

  // Determine goal type based on component type
  if (highestPriorityComponent.type === 'bodycomposition') {
    return 'recomp';
  }

  if (highestPriorityComponent.type === 'bodyweight') {
    // Check criteria to determine if it's a cut or gain
    if (!highestPriorityComponent.criteria || highestPriorityComponent.criteria.length === 0) {
      return 'maintenance';
    }

    // Find the target weight from criteria
    for (const criteria of highestPriorityComponent.criteria) {
      if (criteria.value && typeof criteria.value === 'object' && 'value' in criteria.value && 'unit' in criteria.value) {
        const weightValue = criteria.value as WeightMeasurement;
        const targetWeightKg = weightToKg(weightValue);
        
        if (targetWeightKg < currentWeightKg) {
          return 'cut';
        } else if (targetWeightKg > currentWeightKg) {
          return 'gain';
        }
      }
    }
  }

  return 'maintenance';
}

/**
 * Extract target weight from user goals
 * Uses the same priority logic as determineGoalType to find the highest priority bodyweight component
 */
function extractTargetWeight(
  goals: UserGoal[] | undefined
): number | null {
  if (!goals || goals.length === 0) return null;

  // Collect all active bodyweight components from incomplete goals
  const activeBodyweightComponents: Array<{
    component: UserGoalComponent;
    priority: number;
  }> = [];

  for (const goal of goals) {
    if (goal.complete) continue;

    for (const component of goal.components || []) {
      if (component.type === 'bodyweight') {
        activeBodyweightComponents.push({
          component,
          priority: component.priority || 999,
        });
      }
    }
  }

  if (activeBodyweightComponents.length === 0) return null;

  // Sort by priority (lower number = higher priority)
  activeBodyweightComponents.sort((a, b) => a.priority - b.priority);

  // Get the highest priority bodyweight component
  const highestPriorityComponent = activeBodyweightComponents[0].component;

  if (!highestPriorityComponent.criteria || highestPriorityComponent.criteria.length === 0) {
    return null;
  }

  // Find the target weight from criteria
  for (const criteria of highestPriorityComponent.criteria) {
    if (criteria.value && typeof criteria.value === 'object' && 'value' in criteria.value && 'unit' in criteria.value) {
      const weightValue = criteria.value as WeightMeasurement;
      return weightToKg(weightValue);
    }
  }

  return null;
}

/**
 * Calculate calorie target based on goal type
 * cut: TDEE - 100
 * recomp: TDEE + 100
 * gain: TDEE + ~200
 * maintenance: TDEE
 */
function calculateCalorieTarget(
  tdee: number,
  goalType: GoalType
): number {
  switch (goalType) {
    case 'cut':
      return tdee - 100;
    case 'recomp':
      return tdee + 100;
    case 'gain':
      return tdee + 200;
    case 'maintenance':
    default:
      return tdee;
  }
}

/**
 * Calculate protein target
 * Protein (g/day) = 1.8–2.2 × LeanMass_target_kg
 * Using 2.0 as the middle value for simplicity
 */
function calculateProteinTarget(lbmTargetKg: number): number {
  // Use 2.0 g per kg of target lean mass (middle of 1.8-2.2 range)
  return lbmTargetKg * 2.0;
}

/**
 * Calculate fat target
 * Fat_min = 0.6–0.8 g per kg of LeanMass_target
 * Using 0.7 as the middle value for simplicity
 */
function calculateFatTarget(lbmTargetKg: number): number {
  // Use 0.7 g per kg of target lean mass (middle of 0.6-0.8 range)
  return lbmTargetKg * 0.7;
}

/**
 * Calculate carbohydrate target
 * Carbs = remaining calories after protein and fat
 */
function calculateCarbTarget(
  calorieTarget: number,
  proteinGrams: number,
  fatGrams: number
): number {
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  
  // Carbs have 4 calories per gram
  return Math.max(0, remainingCalories / 4);
}

/**
 * Calculate target lean body mass based on goal type
 */
function calculateTargetLBM(
  currentWeightKg: number,
  currentLBMKg: number,
  targetWeightKg: number | null,
  goalType: GoalType,
  bodyFatPercentage?: number
): number {
  if (goalType === 'recomp') {
    // For recomp, maintain current LBM while losing fat
    return currentLBMKg;
  }

  if (targetWeightKg === null) {
    // No target weight, use current LBM
    return currentLBMKg;
  }

  // For cut/gain, estimate body fat at target weight
  // For cut: body fat typically decreases slightly (assume 1-2% improvement)
  // For gain: body fat might increase slightly (assume 1-2% increase)
  let estimatedBodyFatAtTarget = bodyFatPercentage || 20;
  
  if (goalType === 'cut' && bodyFatPercentage !== undefined) {
    // Assume slight improvement in body composition during cut
    estimatedBodyFatAtTarget = Math.max(8, bodyFatPercentage - 1.5);
  } else if (goalType === 'gain' && bodyFatPercentage !== undefined) {
    // Assume slight increase in body fat during gain (but try to minimize)
    estimatedBodyFatAtTarget = Math.min(30, bodyFatPercentage + 1.5);
  }

  // Calculate target LBM from target weight and estimated body fat
  return targetWeightKg * (1 - estimatedBodyFatAtTarget / 100);
}

/**
 * Main function to calculate fuel recommendations
 */
export function calculateFuelRecommendations(
  profile: UserProfile
): FuelRecommendations {
  const { latestStats, gender, birthDate, activityLevel, goals } = profile;

  // Check if we have the minimum required data
  if (!latestStats?.weight || !latestStats?.height || !gender || !birthDate) {
    return {};
  }

  // Convert measurements to standard units
  const weightKg = weightToKg(latestStats.weight);
  const heightCm = heightToCm(latestStats.height);
  const age = calculateAge(birthDate);

  // Estimate or get body fat percentage
  const bodyFatPercentage = estimateBodyFatPercentage(
    weightKg,
    heightCm,
    gender,
    latestStats.bodyFatPercentage
  );

  // Calculate current LBM
  const currentLBMKg = calculateLBM(weightKg, bodyFatPercentage);

  // Calculate BMR using Katch-McArdle
  const bmr = calculateBMR(currentLBMKg);
  
  // Calculate TDEE
  const defaultActivityLevel = activityLevel || 'sedentary';
  const tdee = calculateTDEE(bmr, defaultActivityLevel);

  // Determine goal type
  const goalType = determineGoalType(goals, weightKg);
  
  // Get target weight if available
  const targetWeightKg = extractTargetWeight(goals);
  
  // Calculate target LBM
  const targetLBMKg = calculateTargetLBM(
    weightKg,
    currentLBMKg,
    targetWeightKg,
    goalType,
    bodyFatPercentage
  );
  
  // Calculate calorie target based on goal type
  const calorieTarget = calculateCalorieTarget(tdee, goalType);

  // Calculate macro targets based on target LBM
  const protein = calculateProteinTarget(targetLBMKg);
  const fat = calculateFatTarget(targetLBMKg);
  const carbs = calculateCarbTarget(calorieTarget, protein, fat);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    macros: {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
  };
}