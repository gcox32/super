import { LiquidMeasurement, HeightMeasurement, WeightMeasurement, PercentageMeasurement, DistanceMeasurement, LongTimeMeasurement } from "./measures"; 
import { Exercise, PerformanceLog, Projected1RMLog } from "./train";
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
    keyExercises?:             Exercise[];

    // latest instances
    latestStats?:              UserStats;
    latestTapeMeasurements?:   TapeMeasurement;
    latestImage?:              UserImage;

    // logs
    goals?:                    UserGoal[]; // hydrated on frontend
    statsLog?:                 UserStatsLog; // hydrated on frontend
    imageLog?:                 UserImageLog; // hydrated on frontend
    performanceLog?:           PerformanceLog; // hydrated on frontend
    projected1RMLog?:          Projected1RMLog; // hydrated on frontend
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
    duration?:    LongTimeMeasurement; // in weeks
    startDate?:   Date;
    endDate?:     Date | null;
    complete:     boolean;
    notes?:       string;
    createdAt:    Date;
    updatedAt:    Date;
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
    bodyFatPercentage?: PercentageMeasurement;
    muscleMass?:        WeightMeasurement;
    tapeMeasurements?:  TapeMeasurement;
    date:               Date;
}

// tape measurements
export interface TapeMeasurement {
    id:            string;
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


