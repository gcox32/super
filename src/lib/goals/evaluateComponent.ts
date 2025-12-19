import { UserGoalComponent, UserStats, TapeMeasurement } from '@/types/user';
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
    // If component doesn't have type, conditional, or value, fall back to manual completion
    if (!component.type || !component.conditional || !component.value) {
        return component.complete;
    }

    if (!stats) {
        return component.complete; // No stats to compare against
    }

    // Evaluate based on component type
    switch (component.type) {
        case 'bodyweight':
            return evaluateWeightComponent(component, stats);
        
        case 'bodycomposition':
            return evaluateBodyCompositionComponent(component, stats);
        
        case 'tape':
            return evaluateTapeComponent(component, stats);
        
        case 'strength':
        case 'time':
        case 'repetitions':
            // These would require performance log data - for now return current status
            // TODO: Implement when performance log access is available
            return component.complete;
        
        case 'skill':
        case 'other':
            // These are subjective - return current manual status
            return component.complete;
        
        default:
            return component.complete;
    }
}

function evaluateWeightComponent(component: UserGoalComponent, stats: UserStats): boolean {
    if (!component.value || typeof component.value === 'string') return component.complete;
    
    const targetValue = component.value as WeightMeasurement;
    const currentValue = stats.weight;
    
    if (!currentValue) return component.complete;
    
    // Convert both to same unit for comparison
    const targetKg = targetValue.unit === 'kg' ? targetValue.value : targetValue.value * 0.453592;
    const currentKg = currentValue.unit === 'kg' ? currentValue.value : currentValue.value * 0.453592;
    
    return compareValues(currentKg, targetKg, component.conditional!);
}

function evaluateBodyCompositionComponent(component: UserGoalComponent, stats: UserStats): boolean {
    if (!component.value || typeof component.value === 'string') return component.complete;
    
    const targetValue = component.value as PercentageMeasurement;
    const currentValue = stats.bodyFatPercentage;
    
    if (!currentValue) return component.complete;
    
    return compareValues(currentValue.value, targetValue.value, component.conditional!);
}

export function evaluateTapeComponent(component: UserGoalComponent, stats: UserStats): boolean {
    if (!component.value || typeof component.value === 'string') return component.complete;
    if (!stats.tapeMeasurements) return component.complete;
    
    const targetValue = component.value as DistanceMeasurement;

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
            
            if (compareValues(currentCm, targetCm, component.conditional!)) {
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

