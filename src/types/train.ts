import { MuscleGroup } from "./anatomy";
import { User } from "./user";
import { 
    DistanceMeasurement, TimeMeasurement, WeightMeasurement, CaloriesMeasurement, 
    PaceMeasurement, LongTimeMeasurement, WorkMeasurement, PowerMeasurement, ProjectedMaxMeasurement, HeightMeasurement
} from "./measures";

// helpers
type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse';

type MovementPattern = 
    'upper push' | 'upper pull' | 'squat'       | 
    'hinge'      | 'lunge'      | 'hip thrust'  |
    'isometric'  | 'locomotion' | 'hip flexion' |
    'plyometric' | 'other';

type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'variable' | 'cable' 
                | 'band' | 'medicine ball' | 'sled' | 'sandbag' | 'wheel' | 'jump rope' | 'pullup bar'
                | 'rack' | 'box' | 'swiss ball' | 'foam roller' | 'bench' | 'landmine'  | 'hip band'
                | 'glute ham developer' | 'other';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type RestTimer = 0 | 15 | 30 | 45 | 60 | 90 | 120 | 180 | 240 | 300;

export type WorkoutType = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'skill' | 'recovery' | 'mobility' | 'other';

export type WorkoutBlockType = 'warm-up' | 'prep' | 'main' | 'accessory' | 'finisher' | 'cooldown' | 'other'; 

export type ScoringType = 'reps' | 'load' | 'dist' | 'cals' | 'time' | 'height' | 'pace' | null;

interface EffectedMuscleGroups {
    primary:    MuscleGroup['id'];
    secondary?: MuscleGroup['id'];
    tertiary?:  MuscleGroup['id'];
}

export interface WorkPowerConstants {
    useCalories:      boolean;
    defaultDistance:  DistanceMeasurement;
    armLengthFactor:  number; // -1.0 - 1.0 default is 0
    legLengthFactor:  number; // -1.0 - 1.0 default is 0
    bodyweightFactor: number; // 0 - 1.0 default is 1
}

export interface ExerciseMeasures {
    externalLoad?:      WeightMeasurement;
    includeBodyweight?: boolean;
    reps?:              number;
    distance?:          DistanceMeasurement;
    time?:              TimeMeasurement;
    pace?:              PaceMeasurement;
    height?:            HeightMeasurement;
    calories?:          CaloriesMeasurement;
}

export type ExerciseMeasureType = keyof ExerciseMeasures;

// `train` schema for supabase
export interface Protocol {
    id:             string;
    name:           string;
    objectives:     string[];
    description?:   string;
    imageUrl?:      string;
    phases?:        Phase[]; // hydrated on frontend
    notes?:         string;
    createdAt:      Date;
    updatedAt:      Date;
}

export interface Phase {
    id:             string;
    protocolId:     Protocol['id'];
    name:           string;
    purpose?:       string; // e.g., "establish a rhythm", "build strength", "hypertrophy"
    imageUrl?:      string;
    duration:       LongTimeMeasurement;
    daysPerWeek:    number;
    includes2ADays: boolean;
    workoutIds?:    string[]; // ordered array of workout IDs (workouts remain independent)
    workouts?:      Workout[]; // hydrated on frontend when needed
    order:          number;
    notes?:         string;
    createdAt:      Date;
    updatedAt:      Date;
}

export interface Workout {
    id:                 string;
    userId:             User['id'];
    workoutType:        WorkoutType;
    name?:              string;
    objectives?:        string[];
    description?:       string;
    imageUrl?:          string;
    blocks?:            WorkoutBlock[]; // hydrated on frontend
    estimatedDuration?: number; // in minutes
    createdAt:          Date;
    updatedAt:          Date;
}

export interface WorkoutBlock {
    id:                 string;
    workoutId:          Workout['id'];
    workoutBlockType:   WorkoutBlockType;
    name?:              string;
    description?:       string;
    order:              number;
    exercises?:         WorkoutBlockExercise[]; // hydrated on frontend
    circuit?:           boolean;
    estimatedDuration?: number; // in minutes
    createdAt:          Date;
    updatedAt:          Date;
}

export interface WorkoutBlockExercise {
    id:         string;
    exercise:   Exercise; // hydrated on frontend
    order:      number;
    sets:       number;
    measures:   ExerciseMeasures;
    scoringType: ScoringType;
    tempo?: {
        eccentric:  TimeMeasurement;
        bottom:     TimeMeasurement;
        concentric: TimeMeasurement;
        top:        TimeMeasurement;
    };
    restTime?: RestTimer;
    rpe?:      RPE;
    notes?:    string;
}

export interface Exercise {
    id:                 string;
    name:               string;
    description?:       string;
    movementPattern?:   MovementPattern;
    muscleGroups:       EffectedMuscleGroups;
    planeOfMotion?:     PlaneOfMotion;
    bilateral?:         boolean;
    equipment?:         Equipment[]; // can be multiple
    imageUrl?:          string;
    videoUrl?:          string;
    workPowerConstants: WorkPowerConstants;
    createdAt:          Date;
    updatedAt:          Date;
    difficulty?:        Difficulty;
    parentExerciseId?:  Exercise['id'];
}

// specific instances
export interface ProtocolInstance {
    id:         string;
    userId:     User['id'];
    protocolId: Protocol['id'];
    active:     boolean;
    startDate:  Date;
    endDate?:   Date | null;
    complete:   boolean;
    duration?:  LongTimeMeasurement; // in minutes
    notes?:     string;
}

export interface PhaseInstance {
    id:         string;
    userId:     User['id'];
    protocolInstanceId: ProtocolInstance['id'];
    phaseId:    Phase['id'];
    phase?:     Phase; // hydrated on frontend
    active:     boolean;
    startDate:  Date;
    endDate?:   Date | null;
    complete:   boolean;
    duration?:  LongTimeMeasurement;
    notes?:     string;
}

export interface WorkoutInstance {
    id: string;
    userId:        User['id'];
    workoutId:     Workout['id'];
    workout?:      Workout; // hydrated on frontend
    date:          Date;
    complete:      boolean;
    duration?:     TimeMeasurement;
    volume?:       WeightMeasurement; // sets * reps * weight
    work?:         WorkMeasurement; // weight * distance
    averagePower?: PowerMeasurement; // work / time
    notes?:        string;
    blockInstances?: WorkoutBlockInstance[]; // hydrated on frontend
}

export interface WorkoutBlockInstance {
    id:                string;
    userId:            User['id'];
    workoutInstanceId: WorkoutInstance['id'];
    workoutBlockId:    WorkoutBlock['id'];
    workoutBlock?:     WorkoutBlock; // hydrated on frontend
    date:              Date;
    complete:          boolean;
    duration?:         TimeMeasurement;
    volume?:           WeightMeasurement; // sets * reps * weight
    notes?:            string;
    exerciseInstances?: WorkoutBlockExerciseInstance[]; // hydrated on frontend
}

export interface WorkoutBlockExerciseInstance {
    id:                     string;
    userId:                 User['id'];
    workoutBlockInstanceId: WorkoutBlockInstance['id'];
    workoutBlockExerciseId: WorkoutBlockExercise['id'];
    workoutBlockExercise?:  WorkoutBlockExercise; // hydrated on frontend
    created_at:             Date;
    complete:               boolean;
    personalBest?:          boolean;
    measures:               ExerciseMeasures;
    projected1RM?:          ProjectedMaxMeasurement;
    rpe?:                   RPE;
    notes?:                 string;
}

// training logs
export interface PerformanceLog {
    id:           string;
    userId:       User['id'];
    performances: Performance[];
}

export interface Performance {
    id:               string;
    performanceLogId: PerformanceLog['id'];
    date:             Date;
    duration:         TimeMeasurement; // workout duration
    volume:           WeightMeasurement; // workout volume
    work:             WorkMeasurement; // using work calculation formula
    power:            PowerMeasurement; // using power calculation formula
    notes?:           string;
}

// Session execution
export interface SessionStep {
    uniqueId: string;
    block: WorkoutBlock;
    exercise: WorkoutBlockExercise;
    setIndex: number; // 0-based
    totalSets: number;
}
