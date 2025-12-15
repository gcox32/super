import { MuscleGroup } from "./anatomy";
import { User } from "./user";
import { 
    DistanceMeasurement, TimeMeasurement, WeightMeasurement, CaloriesMeasurement, 
    PaceMeasurement, LongTimeMeasurement, WorkMeasurement, PowerMeasurement 
} from "./measures";

// helpers
type PlaneOfMotion = 'sagittal' | 'frontal' | 'transverse';

type MovementPattern = 
    'upper push' | 'upper pull' | 'squat'       | 
    'hinge'      | 'lunge'      | 'hip thrust'  |
    'isometric'  | 'locomotion' | 'hip flexion' |
    'plyometric' | 'other';

type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'variable' | 'other';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type RestTimer = 0 | 15 | 30 | 45 | 60 | 90 | 120 | 180 | 240 | 300;

export type WorkoutType = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'skill' | 'other';

export type WorkoutBlockType = 'warm-up' | 'prep' | 'main' | 'accessory' | 'finisher' | 'cooldown' | 'other'; 

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

interface ExerciseMeasures {
    externalLoad?:      WeightMeasurement;
    includeBodyweight?: boolean;
    reps?:              number;
    distance?:          DistanceMeasurement;
    time?:              TimeMeasurement;
    pace?:              PaceMeasurement;
    calories?:          CaloriesMeasurement;
}

// `train` schema for supabase
export interface Protocol {
    id:             string;
    name:           string;
    objectives:     string[];
    description?:   string;
    workouts?:      Workout[]; // hydrated on frontend
    duration:       LongTimeMeasurement;
    daysPerWeek:    number;
    includes2ADays: boolean;
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
    equipment?:         Equipment;
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

export interface WorkoutInstance {
    id: string;
    userId:        User['id'];
    workoutId:     Workout['id'];
    date:          Date;
    complete:      boolean;
    duration?:     TimeMeasurement;
    volume?:       WeightMeasurement; // sets * reps * weight
    work?:         WorkMeasurement; // weight * distance
    averagePower?: PowerMeasurement; // work / time
    notes?:        string;
}

export interface WorkoutBlockInstance {
    id:                string;
    userId:            User['id'];
    workoutInstanceId: WorkoutInstance['id'];
    workoutBlockId:    WorkoutBlock['id'];
    date:              Date;
    complete:          boolean;
    duration?:         TimeMeasurement;
    volume?:           WeightMeasurement; // sets * reps * weight
    notes?:            string;
}

export interface WorkoutBlockExerciseInstance {
    id:                     string;
    userId:                 User['id'];
    workoutBlockInstanceId: WorkoutBlockInstance['id'];
    workoutBlockExerciseId: WorkoutBlockExercise['id'];
    date:                   Date;
    complete:               boolean;
    personalBest?:          boolean;
    duration?:              TimeMeasurement;
    measures:               ExerciseMeasures;
    projected1RM?:          WeightMeasurement;
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
    duration:         TimeMeasurement;
    volume:           WeightMeasurement; // sets * reps * weight
    work:             WorkMeasurement; // weight * distance
    power:            PowerMeasurement; // work / time
    notes?:           string;
}

export interface Projected1RMLog {
    id:            string;
    userId:        User['id'];
    projected1RMs: Projected1RM[]; // hydrated on frontend
}

export interface Projected1RM {
    id:                string;
    projected1RMLogId: Projected1RMLog['id'];
    date:              Date;
    exerciseId:        Exercise['id'];
    projected1RM:      WeightMeasurement;
    notes?:            string;
}

// Session execution
export interface SessionStep {
    uniqueId: string;
    block: WorkoutBlock;
    exercise: WorkoutBlockExercise;
    setIndex: number; // 0-based
    totalSets: number;
}