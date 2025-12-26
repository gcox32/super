import { User } from "./user";
import { LiquidMeasurement, DosageMeasurement, PercentageMeasurement, TimeMeasurement, ServingSizeMeasurement } from "./measures";

type ScheduleType = 'hourly' | 'twice-daily' | 'every-other-day' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'once' | 'other';

export type Macros = {
    protein?: number; // in grams
    carbs?: number; // in grams
    fat?: number; // in grams
}

export type Micros = {
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

// starting here we are reconsidereing the schema and how we want to store the data

export interface MealPlan {
    id:           string;
    userId:       User['id'];
    name:         string;
    description?: string;
    weeks?:       MealWeek[]; // hydrated in UI
    meals?:       Meal[]; // hydrated in UI
    createdAt:    Date;
    updatedAt:    Date;
}

export interface MealWeek { // a collection of meals that can be used to create a grocery list and build out a meal plan
    id: string;
    mealPlanId: MealPlan['id'];
    weekNumber: number; // 1-52
    meals: Meal[];
    groceryList?: GroceryList; // hydrated in UI
    createdAt: Date;
    updatedAt: Date;
}

export interface Meal {
    id:           string;
    mealPlanId?:  MealPlan['id'] | null; // can belong to a meal plan or can stand alone (i.e. how workout is to protocol)
    name:         string;
    description?: string;
    foods?:       PortionedFood[]; // hydrated in UI
    calories?:    number; // hydrated using the foods field and the corresponding food's calories field
    macros?:      Macros; // hydrated using the foods field and the corresponding food's macros field
    micros?:      Micros; // hydrated using the foods field and the corresponding food's micros field
    createdAt:    Date;
    updatedAt:    Date;
}

export interface PortionedFood {
    id:        string;
    foodId:    Food['id'];
    mealId:    Meal['id'];
    portion:   ServingSizeMeasurement; // math between this field and the corresponding food's serving size gives us the important data for the meal portion
    calories?:  number; // hydrated using the portion field and the food's calories field
    macros?:    Macros; // hydrated using the portion field and the food's macros field
    micros?:    Micros; // hydrated using the portion field and the food's micros field
    createdAt: Date;
    updatedAt: Date;
}

export interface Food {
    id:           string;
    name:         string;
    description?: string;
    servingSize:  ServingSizeMeasurement;
    calories?:    number;
    macros?:      Macros;
    micros?:      Micros;
    imageUrl?:    string;
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
    calories?:          number;
    macros?:            Macros;
    micros?:            Micros;
    timestamp?:         Date | null;
    complete:           boolean;
    notes?:             string;
}

export interface PortionedFoodInstance {
    id: string;
    userId:         User['id'];
    mealInstanceId: MealInstance['id'];
    foodId:         Food['id'];
    portion:        ServingSizeMeasurement;
    calories?:      number;
    macros?:        Macros;
    micros?:        Micros;
    complete:       boolean; 
    notes?:         string;
}

// derivates of Meal, MealPlan, and Food
export interface Recipe {
    id:          string;
    name:        string;
    text:        string;
    imageUrl?:   string;
    ingredients: PortionedFood[];
    calories?:   number; // hydrated using the ingredients field and the corresponding food's calories field
    macros?:     Macros; // hydrated using the ingredients field and the corresponding food's macros field
    micros?:     Micros; // hydrated using the ingredients field and the corresponding food's micros field
    createdAt:   Date;
    updatedAt:   Date;
}

export interface GroceryList {
    id:           string;
    userId:       User['id'];
    name:         string;
    description?: string;
    mealWeekId?:  MealWeek['id'] | null; // can belong to a meal week or can stand alone
    foods:        PortionedFood[];
    createdAt:    Date;
    updatedAt:    Date;
}

// here onward is set

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