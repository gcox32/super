import { MuscleGroup } from "./anatomy";

type ContractionType = 'isometric' | 'concentric' | 'eccentric';

interface MovementPattern {
    name: string;
    description: string;
}

export interface Exercise {
    name: string;
    description: string;
    muscleGroups: MuscleGroup[];
    movementPatterns: MovementPattern[];
}

export interface Set {
    exercise: Exercise;
    reps: number;
    weight: number;
    rpe: number;
    restTime: number;
    notes: string;
}
