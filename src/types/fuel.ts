import { User } from "./user";
import { PortionMeasurement, LiquidMeasurement, DosageMeasurement, PercentageMeasurement, TimeMeasurement, CaloriesMeasurement } from "./measures";


type ScheduleType = 'hourly' | 'twice-daily' | 'every-other-day' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'once' | 'other';

type Macros = {
    protein?: number; // in grams
    carbs?: number; // in grams
    fat?: number; // in grams
}

type Micros = {
    fiber?: number; // in grams
    sugar?: number; // in grams
    vitaminA?: number; // in IU
    vitaminC?: number; // in mg
    vitaminD?: number; // in IU
    vitaminE?: number; // in mg
    vitaminK?: number; // in μg
    calcium?: number; // in mg
    iron?: number; // in mg
    magnesium?: number; // in mg
    phosphorus?: number; // in mg
    potassium?: number; // in mg
    sodium?: number; // in mg
    zinc?: number; // in mg
    copper?: number; // in mg
    manganese?: number; // in mg
    selenium?: number; // in μg
    chromium?: number; // in μg
    molybdenum?: number; // in μg
    iodine?: number; // in μg
    vitaminB1?: number; // (Thiamin) in mg
    vitaminB2?: number; // (Riboflavin) in mg
    vitaminB3?: number; // (Niacin) in mg
    vitaminB5?: number; // (Pantothenic acid) in mg
    vitaminB6?: number; // (Pyridoxine) in mg
    vitaminB7?: number; // (Biotin) in μg
    vitaminB9?: number; // (Folate) in μg
    vitaminB12?: number; // (Cobalamin) in μg
}

// `fuel` schema for supabase
export interface MealPlan {
    id:           string;
    userId:       User['id'];
    name:         string;
    description?: string;
    meals?:       Meal[]; // hydrated in UI
    createdAt:    Date;
    updatedAt:    Date;
}

export interface Meal {
    id:           string;
    mealPlanId:   MealPlan['id'];
    name:         string;
    description?: string;
    foods?:       PortionedFood[]; // hydrated in UI
    recipes?:     Recipe[]
    createdAt:    Date;
    updatedAt:    Date;
}

export interface PortionedFood {
    id:           string;
    food:         Food['id'];
    calories?:    number;
    macros?:      Macros;
    micros?:      Micros;
    portionSize:  PortionMeasurement;
    createdAt:    Date;
    updatedAt:    Date;
}

export interface Food {
    id:           string;
    name:         string;
    description?: string;
    imageUrl?:    string;
    createdAt:    Date;
    updatedAt:    Date;
}

export interface Recipe {
    id:          string;
    name:        string;
    text:        string;
    imageUrl?:   string;
    ingredients: PortionedFood[];
    macros?:     Macros;
    micros?:     Micros;
    calories?:   CaloriesMeasurement;
    createdAt:   Date;
    updatedAt:   Date;
}

export interface GroceryList {
    id:           string;
    userId:       User['id'];
    name:         string;
    description?: string;
    foods:        PortionedFood[];
    createdAt:    Date;
    updatedAt:    Date;
}

// specific instances
export interface MealPlanInstance {
    id:         string;
    userId:     User['id'];
    mealPlanId: MealPlan['id'];
    startDate:  Date;
    endDate?:   Date | null;
    complete:   boolean;
    notes?:     string;
}

export interface MealInstance {
    id: string;
    userId:             User['id'];
    mealPlanInstanceId: MealPlanInstance['id'];
    mealId:             Meal['id'];
    date:               Date;
    timestamp?:         Date | null;
    complete:           boolean;
    notes?:             string;
}

export interface PortionedFoodInstance {
    id: string;
    userId:         User['id'];
    mealInstanceId: MealInstance['id'];
    foodId:         Food['id'];
    portion:        PortionMeasurement;
    complete:       boolean; 
    notes?:         string;
}

// future proofing for tracking water
export interface WaterIntakeLog {
    id: string;
    userId: User['id'];
    waterIntake: WaterIntake[];
}

export interface WaterIntake {
    id:         string;
    userId:     User['id'];
    date:       Date;
    timestamp?: Date | null;
    amount:     LiquidMeasurement;
    notes?:     string;
}

// supplements
export interface SupplementSchedule {
    id:           string;
    userId:       User['id'];
    name:         string;
    scheduleType: ScheduleType;
    description?: string;
    supplements:  SupplementInstance[];
}

export interface SupplementInstance {
    id:                   string;
    userId:               User['id'];
    supplementScheduleId: SupplementSchedule['id'];
    supplementId:         Supplement['id'];
    dosage:               DosageMeasurement;
    date:                 Date;
    complete?:            boolean | null;
    notes?:               string;
}

export interface Supplement {
    id:           string;
    name:         string;
    description?: string;
    imageUrl?:    string;
}

// sleep
export interface SleepLog {
    id:     string;
    userId: User['id'];
    sleep:  SleepInstance[]; // hydrated in UI
}

export interface SleepInstance {
    id:          string;
    sleepLogId:  SleepLog['id'];
    userId:      User['id'];
    date:        Date;
    timeAsleep?: TimeMeasurement; // in hours
    startTime?:  Date | null;
    endTime?:    Date | null;
    sleepScore?: number;
    wakeCount?:  number;
    timeAwake?:  TimeMeasurement; // in minutes
    notes?:      string;
}