import { 
    LiquidMeasurement, 
    HeightMeasurement, 
    WeightMeasurement, 
    PercentageMeasurement, 
    DistanceMeasurement, 
    LongTimeMeasurement, 
    TimeMeasurement, 
    RepetitionsMeasurement
} from "./measures"; 
import { Exercise, ExerciseMeasureType, PerformanceLog } from "./train";
import { SleepLog, SupplementSchedule, WaterIntakeLog } from "./fuel";

// `user` schema for supabase
export interface User {
    id:        string; // sub id from supabase auth
    email:     string; // email from supabase auth
    createdAt: Date; // created at from supabase auth
    updatedAt: Date; // updated at from supabase auth
}

type Gender = 'male' | 'female';

type ActivityLevel = 'sedentary' | 'lightly active' | 'moderately active' | 'very active' | 'extra active';

export type GoalComponentType = 'bodyweight' | 'bodycomposition' | 'tape' | 'strength' | 'time' | 'repetitions' | 'skill' | 'other';
export type GoalComponentConditional = 'equals' | 'greater than' | 'less than' | 'greater than or equal to' | 'less than or equal to' | 'not equal to';
export type GoalComponentValue = DistanceMeasurement | PercentageMeasurement | WeightMeasurement | HeightMeasurement | TimeMeasurement | RepetitionsMeasurement | string;
// user profile
export interface UserProfile {
    id:                        string; // supabase id
    userId:                    User['id'];
    email:                     User['email'];
    firstName?:                string;
    lastName?:                 string;
    profilePicture?:           string;
    bio?:                      string;
    gender?:                   Gender;
    birthDate?:                Date;
    dailyWaterRecommendation?: LiquidMeasurement;
    activityLevel?:            ActivityLevel;
    keyExercises?:             Exercise['id'][];

    // latest instances
    latestStats?:              UserStats;
    latestTapeMeasurements?:   TapeMeasurement;
    latestImage?:              UserImage;

    // logs
    goals?:                    UserGoal[]; // hydrated on frontend
    statsLog?:                 UserStatsLog; // hydrated on frontend
    imageLog?:                 UserImageLog; // hydrated on frontend
    performanceLog?:           PerformanceLog; // hydrated on frontend
    waterIntakeLog?:           WaterIntakeLog; // hydrated on frontend
    supplementSchedule?:       SupplementSchedule; // hydrated on frontend
    sleepLog?:                 SleepLog; // hydrated on frontend
    createdAt:                 Date;
    updatedAt:                 Date;
}

export interface UserGoal {
    id:           string;
    userId:       User['id'];
    name?:        string;
    description?: string;
    components?:  UserGoalComponent[]; // JSONB array of UserGoalComponent
    duration?:    LongTimeMeasurement; // in weeks
    startDate?:   Date;
    endDate?:     Date | null;
    complete:     boolean; // as determined by the components if components.length > 0, otherwise false
    notes?:       string;
    createdAt:    Date;
    updatedAt:    Date;
}

export interface UserGoalComponent {
    id:               string;
    name:             string;
    description?:     string;
    type?:            GoalComponentType;
    priority:         number;
    complete:         boolean;
    exerciseId?:      Exercise['id']; // For strength, time, repetitions
    exerciseName?:    string; // Added for display convenience
    criteria?:        UserGoalCriteria[]; // Multiple conditions
    notes?:           string;
    createdAt:        Date;
    updatedAt:        Date;
}

export interface UserGoalCriteria {
    id:          string;
    conditional: GoalComponentConditional;
    value:       GoalComponentValue;
    type?:       GoalComponentType | ExerciseMeasureType; // e.g. 'time' or 'distance' for a running goal
    initialValue?: GoalComponentValue; // To track starting progress
    measurementSite?: keyof Omit<TapeMeasurement, 'id'>; // For tape measurements
}

export interface UserStatsLog {
    id:     string;
    userId: User['id'];
    stats:  UserStats[];
}

export interface UserStats {
    id:                 string;
    statsLogId:         UserStatsLog['id'];
    height?:            HeightMeasurement;
    weight?:            WeightMeasurement;
    armLength?:         HeightMeasurement;
    legLength?:         HeightMeasurement;
    bodyFatPercentage?: PercentageMeasurement;
    muscleMass?:        WeightMeasurement;
    tapeMeasurements?:  TapeMeasurement;
    date:               Date;
}

// tape measurements
export interface TapeMeasurement {
    id:            string;
    date?:         Date;
    neck?:         DistanceMeasurement;
    shoulders?:    DistanceMeasurement;
    chest?:        DistanceMeasurement;
    waist?:        DistanceMeasurement;
    hips?:         DistanceMeasurement;
    leftArm?:      DistanceMeasurement;
    rightArm?:     DistanceMeasurement;
    leftLeg?:      DistanceMeasurement;
    rightLeg?:     DistanceMeasurement;
    leftForearm?:  DistanceMeasurement;
    rightForearm?: DistanceMeasurement;
    leftCalf?:     DistanceMeasurement;
    rightCalf?:    DistanceMeasurement;
}

// image logs
export interface UserImageLog {
    id:     string;
    userId: User['id'];
    images: UserImage[];
}

export interface UserImage {
    id:         string;
    imageLogId: UserImageLog['id'];
    date:       Date;
    imageUrl:   string;
    notes?:     string;
}


