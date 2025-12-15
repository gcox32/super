import { WorkPowerConstants } from '@/types/train';

export const defaultWorkPowerConstants: WorkPowerConstants = {
    useCalories: false,
    defaultDistance: { value: 0, unit: 'm' },
    armLengthFactor: 0,
    legLengthFactor: 0,
    bodyweightFactor: 0
};

export const MOVEMENT_PATTERNS = [
    'upper push', 'upper pull', 'squat', 'hinge', 'lunge', 'hip thrust',
    'isometric', 'locomotion', 'hip flexion', 'plyometric', 'other'
] as const;

export const PLANES_OF_MOTION = ['sagittal', 'frontal', 'transverse'] as const;

export const EQUIPMENT_TYPES = [
    'barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable',
    'cable', 'band', 'medicine ball', 'sled', 'sandbag', 'wheel', 'jump rope',
    'pullup bar', 'rack', 'box', 'swiss ball', 'foam roller', 'bench',
    'other'
] as const;

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
