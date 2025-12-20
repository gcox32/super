import { UserGoalComponent, UserStats, TapeMeasurement, UserGoalCriteria } from '@/types/user';
import { 
    WeightMeasurement, 
    PercentageMeasurement, 
    DistanceMeasurement,
} from '@/types/measures';

/**
 * Evaluates a goal component's completion status based on actual user data
 * Compares the component's target value against current user stats
 */
export function evaluateComponent(component: UserGoalComponent, stats: UserStats | null): boolean {
    if (!stats) {
        return component.complete; // No stats to compare against
    }

    // New multi-criteria evaluation
    if (component.criteria && component.criteria.length > 0) {
        // All criteria must be met (AND logic)
        const allCriteriaMet = component.criteria.every(criteria => {
            return evaluateCriteria(criteria, stats, component);
        });
        
        return allCriteriaMet;
    }

    // Fallback if no criteria (incomplete migration or manual only)
    return component.complete;
}

function evaluateCriteria(criteria: UserGoalCriteria, stats: UserStats, parentComponent: UserGoalComponent): boolean {
    const type = criteria.type || parentComponent.type;
    
    switch (type) {
        case 'bodyweight':
            return evaluateWeightComponent(criteria.value, criteria.conditional, stats);
        case 'bodycomposition':
            return evaluateBodyCompositionComponent(criteria.value, criteria.conditional, stats);
        case 'tape':
             // Use criteria specific site if available, otherwise check if parent has one? But parent one is removed in refactor.
             // If criteria has no site, it might be checking "any" or just invalid.
            return evaluateTapeComponent(criteria.value, criteria.conditional, criteria.measurementSite, stats);
        case 'strength':
        case 'time':
        case 'repetitions':
            // Needs performance log
            return false; // Default to false for now or keep previous state?
        default:
            return false;
    }
}

function evaluateWeightComponent(value: any, conditional: string | undefined, stats: UserStats): boolean {
    if (!value || typeof value === 'string' || !conditional) return false;
    
    const targetValue = value as WeightMeasurement;
    const currentValue = stats.weight;
    
    if (!currentValue) return false;
    
    // Convert both to same unit for comparison
    const targetKg = targetValue.unit === 'kg' ? targetValue.value : targetValue.value * 0.453592;
    const currentKg = currentValue.unit === 'kg' ? currentValue.value : currentValue.value * 0.453592;
    
    return compareValues(currentKg, targetKg, conditional);
}

function evaluateBodyCompositionComponent(value: any, conditional: string | undefined, stats: UserStats): boolean {
    if (!value || typeof value === 'string' || !conditional) return false;
    
    const targetValue = value as PercentageMeasurement;
    const currentValue = stats.bodyFatPercentage;
    
    if (!currentValue) return false;
    
    return compareValues(currentValue.value, targetValue.value, conditional);
}

export function evaluateTapeComponent(
    value: any, 
    conditional: string | undefined, 
    measurementSite: keyof Omit<TapeMeasurement, 'id'> | undefined, 
    stats: UserStats
): boolean {
    if (!value || typeof value === 'string' || !conditional) return false;
    if (!stats.tapeMeasurements) return false;
    
    const targetValue = value as DistanceMeasurement;

    // If a specific site is selected, check only that site
    if (measurementSite) {
        const field = measurementSite;
        const currentMeasurement = stats.tapeMeasurements[field];
        
        if (
            currentMeasurement && 
            typeof currentMeasurement === 'object' && 
            'unit' in currentMeasurement && 
            'value' in currentMeasurement && 
            typeof currentMeasurement.value === 'number'
        ) {
            // Convert to same unit
            const targetCm = targetValue.unit === 'cm' ? targetValue.value : targetValue.value * 2.54;
            const currentCm = currentMeasurement.unit === 'cm' ? currentMeasurement.value : currentMeasurement.value * 2.54;
            
            return compareValues(currentCm, targetCm, conditional);
        }
        return false;
    }

    // Fallback: check ANY tape measurement if no specific site (legacy behavior, maybe remove?)
    const tapeFields: (keyof TapeMeasurement)[] = [
        'neck', 'shoulders', 'chest', 'waist', 'hips',
        'leftArm', 'rightArm', 'leftLeg', 'rightLeg',
        'leftForearm', 'rightForearm', 'leftCalf', 'rightCalf'
    ];
    
    for (const field of tapeFields) {
        const currentMeasurement = stats.tapeMeasurements[field];
        if (
            currentMeasurement && 
            typeof currentMeasurement === 'object' && 
            'unit' in currentMeasurement && 
            'value' in currentMeasurement && 
            typeof currentMeasurement.value === 'number'
        ) {
            // Convert to same unit
            const targetCm = targetValue.unit === 'cm' ? targetValue.value : targetValue.value * 2.54;
            const currentCm = currentMeasurement.unit === 'cm' ? currentMeasurement.value : currentMeasurement.value * 2.54;
            
            if (compareValues(currentCm, targetCm, conditional)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Compares two numeric values based on the conditional operator
 */
function compareValues(current: number, target: number, conditional: string): boolean {
    switch (conditional) {
        case 'equals':
            return Math.abs(current - target) < 0.01; // Small tolerance for floating point
        case 'greater than':
            return current > target;
        case 'less than':
            return current < target;
        case 'greater than or equal to':
            return current >= target;
        case 'less than or equal to':
            return current <= target;
        case 'not equal to':
            return Math.abs(current - target) >= 0.01;
        default:
            return false;
    }
}

/**
 * Evaluates all components for a goal and returns updated components with evaluated completion status
 */
export function evaluateGoalComponents(
    components: UserGoalComponent[],
    stats: UserStats | null
): UserGoalComponent[] {
    if (components.length === 0) {
        return components;
    }

    return components.map((component) => {
        const isComplete = evaluateComponent(component, stats);
        return {
            ...component,
            complete: isComplete,
        };
    });
}
