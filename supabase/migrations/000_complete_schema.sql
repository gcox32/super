-- ============================================================================
-- COMPLETE DATABASE SCHEMA INITIALIZATION
-- ============================================================================
-- This file consolidates all migrations into a single schema initialization.
-- Use this for fresh database setups instead of running migrations sequentially.
--
-- For existing databases, continue using the numbered migration files.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS train;
CREATE SCHEMA IF NOT EXISTS fuel;
CREATE SCHEMA IF NOT EXISTS anatomy;

-- ============================================================================
-- PUBLIC SCHEMA - User Domain
-- ============================================================================

-- User table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profile
CREATE TABLE IF NOT EXISTS public.user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_picture TEXT,
    bio TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    birth_date DATE,
    daily_water_recommendation JSONB,
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly active', 'moderately active', 'very active', 'extra active')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profile_user_id ON public.user_profile(user_id);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE,
    body_fat_strategy TEXT DEFAULT 'weighted_mean',
    preferred_weight_unit TEXT CHECK (preferred_weight_unit IN ('kg', 'lb')) DEFAULT 'lb',
    preferred_length_unit TEXT CHECK (preferred_length_unit IN ('cm', 'in')) DEFAULT 'in',
    body_fat_max_days_old INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE,
    sleep_reminder BOOLEAN DEFAULT FALSE,
    session_reminders BOOLEAN DEFAULT TRUE,
    meal_reminders BOOLEAN DEFAULT FALSE,
    progress_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- User Goal
CREATE TABLE IF NOT EXISTS public.user_goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    duration JSONB,
    components JSONB,
    start_date DATE,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_goal_user_id ON public.user_goal(user_id);
CREATE INDEX idx_user_goal_components ON public.user_goal USING GIN(components);
CREATE INDEX idx_user_goal_complete ON public.user_goal(complete);

-- User Goal Component
CREATE TABLE IF NOT EXISTS public.user_goal_component (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.user_goal(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    priority INTEGER NOT NULL DEFAULT 1,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    exercise_id UUID REFERENCES train.exercise(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_goal_component_goal_id ON public.user_goal_component(goal_id);

-- User Goal Criteria
CREATE TABLE IF NOT EXISTS public.user_goal_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES public.user_goal_component(id) ON DELETE CASCADE,
    type TEXT,
    conditional TEXT NOT NULL,
    value JSONB NOT NULL,
    initial_value JSONB,
    measurement_site TEXT
);

CREATE INDEX idx_user_goal_criteria_component_id ON public.user_goal_criteria(component_id);

-- User Stats Log
CREATE TABLE IF NOT EXISTS public.user_stats_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_stats_log_user_id ON public.user_stats_log(user_id);

-- User Stats
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stats_log_id UUID NOT NULL REFERENCES public.user_stats_log(id) ON DELETE CASCADE,
    height JSONB,
    weight JSONB,
    body_fat_percentage JSONB,
    muscle_mass JSONB,
    arm_length JSONB,
    leg_length JSONB,
    date DATE NOT NULL
);

CREATE INDEX idx_user_stats_stats_log_id ON public.user_stats(stats_log_id);
CREATE INDEX idx_user_stats_date ON public.user_stats(date);

-- Tape Measurement
CREATE TABLE IF NOT EXISTS public.tape_measurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_stats_id UUID NOT NULL UNIQUE REFERENCES public.user_stats(id) ON DELETE CASCADE,
    neck JSONB,
    shoulders JSONB,
    chest JSONB,
    waist JSONB,
    hips JSONB,
    left_arm JSONB,
    right_arm JSONB,
    left_leg JSONB,
    right_leg JSONB,
    left_forearm JSONB,
    right_forearm JSONB,
    left_calf JSONB,
    right_calf JSONB
);

CREATE INDEX idx_tape_measurement_user_stats_id ON public.tape_measurement(user_stats_id);

-- User Image Log
CREATE TABLE IF NOT EXISTS public.user_image_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_image_log_user_id ON public.user_image_log(user_id);

-- User Image
CREATE TABLE IF NOT EXISTS public.user_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_log_id UUID NOT NULL REFERENCES public.user_image_log(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    image_url TEXT NOT NULL,
    notes TEXT
);

CREATE INDEX idx_user_image_image_log_id ON public.user_image(image_log_id);
CREATE INDEX idx_user_image_date ON public.user_image(date);

-- User Profile Key Exercise (Junction Table)
CREATE TABLE IF NOT EXISTS public.user_profile_key_exercise (
    user_profile_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    PRIMARY KEY (user_profile_id, exercise_id)
);

CREATE INDEX idx_user_profile_key_exercise_user_profile_id ON public.user_profile_key_exercise(user_profile_id);
CREATE INDEX idx_user_profile_key_exercise_exercise_id ON public.user_profile_key_exercise(exercise_id);

-- ============================================================================
-- ANATOMY SCHEMA - Reference Data
-- ============================================================================

-- Muscle Group
CREATE TABLE IF NOT EXISTS anatomy.muscle_group (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE INDEX idx_muscle_group_name ON anatomy.muscle_group(name);

-- Muscle
CREATE TABLE IF NOT EXISTS anatomy.muscle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    muscle_group_id UUID NOT NULL REFERENCES anatomy.muscle_group(id) ON DELETE CASCADE,
    scientific_name TEXT
);

CREATE INDEX idx_muscle_muscle_group_id ON anatomy.muscle(muscle_group_id);
CREATE INDEX idx_muscle_name ON anatomy.muscle(name);

-- ============================================================================
-- TRAIN SCHEMA
-- ============================================================================

-- Protocol
CREATE TABLE IF NOT EXISTS train.protocol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    objectives TEXT[] NOT NULL,
    description TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase
CREATE TABLE IF NOT EXISTS train.phase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES train.protocol(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purpose TEXT,
    image_url TEXT,
    duration JSONB NOT NULL,
    days_per_week INTEGER NOT NULL,
    includes_2a_days BOOLEAN NOT NULL DEFAULT FALSE,
    workout_ids TEXT[],
    "order" INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phase_protocol_id ON train.phase(protocol_id);
CREATE INDEX idx_phase_order ON train.phase(protocol_id, "order");
CREATE INDEX idx_phase_workout_ids ON train.phase USING GIN(workout_ids);

-- Workout
CREATE TABLE IF NOT EXISTS train.workout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'hypertrophy', 'endurance', 'power', 'skill', 'recovery', 'mobility', 'other')),
    name TEXT,
    objectives TEXT[],
    description TEXT,
    image_url TEXT,
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_user_id ON train.workout(user_id);
CREATE INDEX idx_workout_workout_type ON train.workout(workout_type);

-- Workout Block
CREATE TABLE IF NOT EXISTS train.workout_block (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES train.workout(id) ON DELETE CASCADE,
    workout_block_type TEXT NOT NULL CHECK (workout_block_type IN ('warm-up', 'prep', 'main', 'accessory', 'finisher', 'cooldown', 'other')),
    name TEXT,
    description TEXT,
    "order" INTEGER NOT NULL,
    circuit BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_block_workout_id ON train.workout_block(workout_id);
CREATE INDEX idx_workout_block_order ON train.workout_block(workout_id, "order");

-- Exercise
CREATE TABLE IF NOT EXISTS train.exercise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    movement_pattern TEXT CHECK (movement_pattern IN ('upper push', 'upper pull', 'squat', 'hinge', 'lunge', 'hip thrust', 'isometric', 'locomotion', 'hip flexion', 'plyometric', 'other')),
    muscle_groups JSONB NOT NULL,
    plane_of_motion TEXT CHECK (plane_of_motion IN ('sagittal', 'frontal', 'transverse')),
    bilateral BOOLEAN,
    equipment TEXT[] CHECK (equipment <@ ARRAY['barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable', 'cable', 'band', 'medicine ball', 'sled', 'sandbag', 'wheel', 'jump rope', 'pullup bar', 'rack', 'box', 'swiss ball', 'foam roller', 'bench', 'landmine', 'hip band', 'other']::text[]),
    image_url TEXT,
    video_url TEXT,
    work_power_constants JSONB NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    parent_exercise_id UUID REFERENCES train.exercise(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_name ON train.exercise(name);
CREATE INDEX idx_exercise_parent_exercise_id ON train.exercise(parent_exercise_id);

-- Workout Block Exercise
CREATE TABLE IF NOT EXISTS train.workout_block_exercise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_block_id UUID NOT NULL REFERENCES train.workout_block(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    measures JSONB NOT NULL,
    scoring_type TEXT CHECK (scoring_type IN ('reps', 'load', 'dist', 'cals', 'time', 'height', 'pace')),
    tempo JSONB,
    rest_time INTEGER CHECK (rest_time IN (0, 15, 30, 45, 60, 90, 120, 180, 240, 300)),
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    notes TEXT
);

CREATE INDEX idx_workout_block_exercise_workout_block_id ON train.workout_block_exercise(workout_block_id);
CREATE INDEX idx_workout_block_exercise_exercise_id ON train.workout_block_exercise(exercise_id);
CREATE INDEX idx_workout_block_exercise_order ON train.workout_block_exercise(workout_block_id, "order");

-- Protocol Instance
CREATE TABLE IF NOT EXISTS train.protocol_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES train.protocol(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    duration JSONB,
    notes TEXT
);

CREATE INDEX idx_protocol_instance_user_id ON train.protocol_instance(user_id);
CREATE INDEX idx_protocol_instance_protocol_id ON train.protocol_instance(protocol_id);
CREATE INDEX idx_protocol_instance_active ON train.protocol_instance(user_id, active);

-- Phase Instance
CREATE TABLE IF NOT EXISTS train.phase_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    protocol_instance_id UUID NOT NULL REFERENCES train.protocol_instance(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES train.phase(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    duration JSONB,
    notes TEXT
);

CREATE INDEX idx_phase_instance_user_id ON train.phase_instance(user_id);
CREATE INDEX idx_phase_instance_protocol_instance_id ON train.phase_instance(protocol_instance_id);
CREATE INDEX idx_phase_instance_phase_id ON train.phase_instance(phase_id);
CREATE INDEX idx_phase_instance_active ON train.phase_instance(user_id, active);

-- Workout Instance
CREATE TABLE IF NOT EXISTS train.workout_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES train.workout(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    duration JSONB,
    volume JSONB,
    work JSONB,
    average_power JSONB,
    notes TEXT
);

CREATE INDEX idx_workout_instance_user_id ON train.workout_instance(user_id);
CREATE INDEX idx_workout_instance_workout_id ON train.workout_instance(workout_id);
CREATE INDEX idx_workout_instance_date ON train.workout_instance(user_id, date);

-- Workout Block Instance
CREATE TABLE IF NOT EXISTS train.workout_block_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_instance_id UUID NOT NULL REFERENCES train.workout_instance(id) ON DELETE CASCADE,
    workout_block_id UUID NOT NULL REFERENCES train.workout_block(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    duration JSONB,
    volume JSONB,
    notes TEXT
);

CREATE INDEX idx_workout_block_instance_user_id ON train.workout_block_instance(user_id);
CREATE INDEX idx_workout_block_instance_workout_instance_id ON train.workout_block_instance(workout_instance_id);
CREATE INDEX idx_workout_block_instance_workout_block_id ON train.workout_block_instance(workout_block_id);

-- Workout Block Exercise Instance
CREATE TABLE IF NOT EXISTS train.workout_block_exercise_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_block_instance_id UUID NOT NULL REFERENCES train.workout_block_instance(id) ON DELETE CASCADE,
    workout_block_exercise_id UUID NOT NULL REFERENCES train.workout_block_exercise(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    personal_best BOOLEAN,
    measures JSONB NOT NULL,
    projected_1rm JSONB,
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    notes TEXT
);

CREATE INDEX idx_workout_block_exercise_instance_user_id ON train.workout_block_exercise_instance(user_id);
CREATE INDEX idx_workout_block_exercise_instance_workout_block_instance_id ON train.workout_block_exercise_instance(workout_block_instance_id);
CREATE INDEX idx_workout_block_exercise_instance_workout_block_exercise_id ON train.workout_block_exercise_instance(workout_block_exercise_id);
CREATE INDEX idx_workout_block_exercise_instance_created_at ON train.workout_block_exercise_instance(created_at);

-- Performance Log
CREATE TABLE IF NOT EXISTS train.performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_performance_log_user_id ON train.performance_log(user_id);

-- Performance
CREATE TABLE IF NOT EXISTS train.performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_log_id UUID NOT NULL REFERENCES train.performance_log(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    duration JSONB NOT NULL,
    volume JSONB NOT NULL,
    work JSONB NOT NULL,
    power JSONB NOT NULL,
    notes TEXT
);

CREATE INDEX idx_performance_performance_log_id ON train.performance(performance_log_id);
CREATE INDEX idx_performance_date ON train.performance(date);

-- Projected 1RM Log
CREATE TABLE IF NOT EXISTS train.projected_1rm_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_projected_1rm_log_user_id ON train.projected_1rm_log(user_id);

-- Projected 1RM
CREATE TABLE IF NOT EXISTS train.projected_1rm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projected_1rm_log_id UUID NOT NULL REFERENCES train.projected_1rm_log(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    projected_1rm JSONB NOT NULL,
    notes TEXT
);

CREATE INDEX idx_projected_1rm_projected_1rm_log_id ON train.projected_1rm(projected_1rm_log_id);
CREATE INDEX idx_projected_1rm_exercise_id ON train.projected_1rm(exercise_id);
CREATE INDEX idx_projected_1rm_date ON train.projected_1rm(date);

-- ============================================================================
-- FUEL SCHEMA
-- ============================================================================

-- Meal Plan
CREATE TABLE IF NOT EXISTS fuel.meal_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plan_user_id ON fuel.meal_plan(user_id);

-- Meal
CREATE TABLE IF NOT EXISTS fuel.meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_meal_plan_id ON fuel.meal(meal_plan_id);

-- Food
CREATE TABLE IF NOT EXISTS fuel.food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_name ON fuel.food(name);

-- Portioned Food
CREATE TABLE IF NOT EXISTS fuel.portioned_food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    portion_size JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portioned_food_food_id ON fuel.portioned_food(food_id);

-- Meal Portion (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.meal_portion (
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (meal_id, portioned_food_id)
);

CREATE INDEX idx_meal_portion_meal_id ON fuel.meal_portion(meal_id);
CREATE INDEX idx_meal_portion_portioned_food_id ON fuel.meal_portion(portioned_food_id);

-- Recipe
CREATE TABLE IF NOT EXISTS fuel.recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    macros JSONB,
    micros JSONB,
    calories JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meal Recipe (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.meal_recipe (
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES fuel.recipe(id) ON DELETE CASCADE,
    PRIMARY KEY (meal_id, recipe_id)
);

CREATE INDEX idx_meal_recipe_meal_id ON fuel.meal_recipe(meal_id);
CREATE INDEX idx_meal_recipe_recipe_id ON fuel.meal_recipe(recipe_id);

-- Recipe Ingredient (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.recipe_ingredient (
    recipe_id UUID NOT NULL REFERENCES fuel.recipe(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (recipe_id, portioned_food_id)
);

CREATE INDEX idx_recipe_ingredient_recipe_id ON fuel.recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_portioned_food_id ON fuel.recipe_ingredient(portioned_food_id);

-- Grocery List
CREATE TABLE IF NOT EXISTS fuel.grocery_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grocery_list_user_id ON fuel.grocery_list(user_id);

-- Grocery List Item (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.grocery_list_item (
    grocery_list_id UUID NOT NULL REFERENCES fuel.grocery_list(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (grocery_list_id, portioned_food_id)
);

CREATE INDEX idx_grocery_list_item_grocery_list_id ON fuel.grocery_list_item(grocery_list_id);
CREATE INDEX idx_grocery_list_item_portioned_food_id ON fuel.grocery_list_item(portioned_food_id);

-- Meal Plan Instance
CREATE TABLE IF NOT EXISTS fuel.meal_plan_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_meal_plan_instance_user_id ON fuel.meal_plan_instance(user_id);
CREATE INDEX idx_meal_plan_instance_meal_plan_id ON fuel.meal_plan_instance(meal_plan_id);

-- Meal Instance
CREATE TABLE IF NOT EXISTS fuel.meal_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_instance_id UUID NOT NULL REFERENCES fuel.meal_plan_instance(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_meal_instance_user_id ON fuel.meal_instance(user_id);
CREATE INDEX idx_meal_instance_meal_plan_instance_id ON fuel.meal_instance(meal_plan_instance_id);
CREATE INDEX idx_meal_instance_meal_id ON fuel.meal_instance(meal_id);
CREATE INDEX idx_meal_instance_date ON fuel.meal_instance(user_id, date);

-- Portioned Food Instance
CREATE TABLE IF NOT EXISTS fuel.portioned_food_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_instance_id UUID NOT NULL REFERENCES fuel.meal_instance(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    portion JSONB NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_portioned_food_instance_user_id ON fuel.portioned_food_instance(user_id);
CREATE INDEX idx_portioned_food_instance_meal_instance_id ON fuel.portioned_food_instance(meal_instance_id);
CREATE INDEX idx_portioned_food_instance_food_id ON fuel.portioned_food_instance(food_id);

-- Supplement
CREATE TABLE IF NOT EXISTS fuel.supplement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplement Schedule
CREATE TABLE IF NOT EXISTS fuel.supplement_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('hourly', 'twice-daily', 'every-other-day', 'daily', 'weekly', 'bi-weekly', 'monthly', 'once', 'other')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supplement_schedule_user_id ON fuel.supplement_schedule(user_id);

-- Supplement Instance
CREATE TABLE IF NOT EXISTS fuel.supplement_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    supplement_schedule_id UUID NOT NULL REFERENCES fuel.supplement_schedule(id) ON DELETE CASCADE,
    supplement_id UUID NOT NULL REFERENCES fuel.supplement(id) ON DELETE CASCADE,
    dosage JSONB NOT NULL,
    date DATE NOT NULL,
    complete BOOLEAN,
    notes TEXT
);

CREATE INDEX idx_supplement_instance_user_id ON fuel.supplement_instance(user_id);
CREATE INDEX idx_supplement_instance_supplement_schedule_id ON fuel.supplement_instance(supplement_schedule_id);
CREATE INDEX idx_supplement_instance_supplement_id ON fuel.supplement_instance(supplement_id);
CREATE INDEX idx_supplement_instance_date ON fuel.supplement_instance(user_id, date);

-- Water Intake Log
CREATE TABLE IF NOT EXISTS fuel.water_intake_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_water_intake_log_user_id ON fuel.water_intake_log(user_id);

-- Water Intake
CREATE TABLE IF NOT EXISTS fuel.water_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_intake_log_id UUID NOT NULL REFERENCES fuel.water_intake_log(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ,
    amount JSONB NOT NULL,
    notes TEXT
);

CREATE INDEX idx_water_intake_water_intake_log_id ON fuel.water_intake(water_intake_log_id);
CREATE INDEX idx_water_intake_user_id ON fuel.water_intake(user_id);
CREATE INDEX idx_water_intake_date ON fuel.water_intake(user_id, date);

-- Sleep Log
CREATE TABLE IF NOT EXISTS fuel.sleep_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_sleep_log_user_id ON fuel.sleep_log(user_id);

-- Sleep Instance
CREATE TABLE IF NOT EXISTS fuel.sleep_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sleep_log_id UUID NOT NULL REFERENCES fuel.sleep_log(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_asleep JSONB,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    sleep_score NUMERIC,
    wake_count INTEGER,
    time_awake JSONB,
    notes TEXT
);

CREATE INDEX idx_sleep_instance_sleep_log_id ON fuel.sleep_instance(sleep_log_id);
CREATE INDEX idx_sleep_instance_user_id ON fuel.sleep_instance(user_id);
CREATE INDEX idx_sleep_instance_date ON fuel.sleep_instance(user_id, date);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables with updated_at column

-- Public schema
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public.user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON public.user_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goal_updated_at BEFORE UPDATE ON public.user_goal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goal_component_updated_at BEFORE UPDATE ON public.user_goal_component
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Train schema
CREATE TRIGGER update_protocol_updated_at BEFORE UPDATE ON train.protocol
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phase_updated_at BEFORE UPDATE ON train.phase
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_updated_at BEFORE UPDATE ON train.workout
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_block_updated_at BEFORE UPDATE ON train.workout_block
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_updated_at BEFORE UPDATE ON train.exercise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fuel schema
CREATE TRIGGER update_meal_plan_updated_at BEFORE UPDATE ON fuel.meal_plan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_updated_at BEFORE UPDATE ON fuel.meal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_updated_at BEFORE UPDATE ON fuel.food
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portioned_food_updated_at BEFORE UPDATE ON fuel.portioned_food
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_updated_at BEFORE UPDATE ON fuel.recipe
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_list_updated_at BEFORE UPDATE ON fuel.grocery_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplement_updated_at BEFORE UPDATE ON fuel.supplement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplement_schedule_updated_at BEFORE UPDATE ON fuel.supplement_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_component ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tape_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_image_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_key_exercise ENABLE ROW LEVEL SECURITY;

-- Train schema
ALTER TABLE train.protocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.phase ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.protocol_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.phase_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_exercise_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.projected_1rm_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.projected_1rm ENABLE ROW LEVEL SECURITY;

-- Fuel schema
ALTER TABLE fuel.meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.food ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.portioned_food ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_portion ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.recipe_ingredient ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.grocery_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.grocery_list_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_plan_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.portioned_food_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.water_intake_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.sleep_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.sleep_instance ENABLE ROW LEVEL SECURITY;

-- Anatomy schema (reference data - read-only for all authenticated users)
ALTER TABLE anatomy.muscle_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy.muscle ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - User can only access their own data (with performance optimizations)
-- ============================================================================

-- Note: Using (select auth.uid()) pattern for better RLS performance

-- Public schema policies
CREATE POLICY "Users can view own user record" ON public.user
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own user record" ON public.user
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can view own profile" ON public.user_profile
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profile
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profile
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own goals" ON public.user_goal
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR ALL USING ((select auth.uid()) = user_id);

-- User Goal Component Policies
CREATE POLICY "Users can view own goal components" ON public.user_goal_component
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_goal
            WHERE id = user_goal_component.goal_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own goal components" ON public.user_goal_component
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_goal
            WHERE id = user_goal_component.goal_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own goal components" ON public.user_goal_component
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_goal
            WHERE id = user_goal_component.goal_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own goal components" ON public.user_goal_component
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_goal
            WHERE id = user_goal_component.goal_id
            AND user_id = (select auth.uid())
        )
    );

-- User Goal Criteria Policies
CREATE POLICY "Users can view own goal criteria" ON public.user_goal_criteria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_goal_component
            JOIN public.user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own goal criteria" ON public.user_goal_criteria
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_goal_component
            JOIN public.user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update own goal criteria" ON public.user_goal_criteria
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_goal_component
            JOIN public.user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete own goal criteria" ON public.user_goal_criteria
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_goal_component
            JOIN public.user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own stats log" ON public.user_stats_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own tape measurements" ON public.tape_measurement
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats us
            JOIN public.user_stats_log usl ON us.stats_log_id = usl.id
            WHERE us.id = tape_measurement.user_stats_id
            AND usl.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own image log" ON public.user_image_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own images" ON public.user_image
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can insert own images" ON public.user_image
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own key exercises" ON public.user_profile_key_exercise
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profile
            WHERE id = user_profile_key_exercise.user_profile_id
            AND user_id = (select auth.uid())
        )
    );

-- Train schema policies
CREATE POLICY "Users can view all protocols" ON train.protocol
    FOR SELECT USING (true);

CREATE POLICY "Users can view all phases" ON train.phase
    FOR SELECT USING (true);

CREATE POLICY "Users can view own workouts" ON train.workout
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own workout blocks" ON train.workout_block
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout
            WHERE id = workout_block.workout_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view all exercises" ON train.exercise
    FOR SELECT USING (true);

CREATE POLICY "Users can view own workout block exercises" ON train.workout_block_exercise
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout_block wb
            JOIN train.workout w ON wb.workout_id = w.id
            WHERE wb.id = workout_block_exercise.workout_block_id
            AND w.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own protocol instances" ON train.protocol_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own phase instances" ON train.phase_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own workout instances" ON train.workout_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own workout block instances" ON train.workout_block_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own exercise instances" ON train.workout_block_exercise_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own performance log" ON train.performance_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own performances" ON train.performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.performance_log
            WHERE id = performance.performance_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own projected 1RM log" ON train.projected_1rm_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own projected 1RMs" ON train.projected_1rm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.projected_1rm_log
            WHERE id = projected_1rm.projected_1rm_log_id
            AND user_id = (select auth.uid())
        )
    );

-- Fuel schema policies
CREATE POLICY "Users can view own meal plans" ON fuel.meal_plan
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own meals" ON fuel.meal
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal_plan
            WHERE id = meal.meal_plan_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view all foods" ON fuel.food
    FOR SELECT USING (true);

CREATE POLICY "Users can view all portioned foods" ON fuel.portioned_food
    FOR SELECT USING (true);

CREATE POLICY "Users can view own meal portions" ON fuel.meal_portion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_portion.meal_id
            AND mp.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view all recipes" ON fuel.recipe
    FOR SELECT USING (true);

CREATE POLICY "Users can view own meal recipes" ON fuel.meal_recipe
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_recipe.meal_id
            AND mp.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view recipe ingredients" ON fuel.recipe_ingredient
    FOR SELECT USING (true);

CREATE POLICY "Users can view own grocery lists" ON fuel.grocery_list
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own grocery list items" ON fuel.grocery_list_item
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.grocery_list
            WHERE id = grocery_list_item.grocery_list_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own meal plan instances" ON fuel.meal_plan_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own meal instances" ON fuel.meal_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own portioned food instances" ON fuel.portioned_food_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view all supplements" ON fuel.supplement
    FOR SELECT USING (true);

CREATE POLICY "Users can view own supplement schedules" ON fuel.supplement_schedule
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own supplement instances" ON fuel.supplement_instance
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own water intake log" ON fuel.water_intake_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own water intakes" ON fuel.water_intake
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.water_intake_log
            WHERE id = water_intake.water_intake_log_id
            AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own sleep log" ON fuel.sleep_log
    FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own sleep instances" ON fuel.sleep_instance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.sleep_log
            WHERE id = sleep_instance.sleep_log_id
            AND user_id = (select auth.uid())
        )
    );

-- Anatomy schema policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view muscle groups" ON anatomy.muscle_group
    FOR SELECT USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can view muscles" ON anatomy.muscle
    FOR SELECT USING ((select auth.uid()) IS NOT NULL);

