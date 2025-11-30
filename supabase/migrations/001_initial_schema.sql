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

-- User Goal
CREATE TABLE IF NOT EXISTS public.user_goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    duration JSONB,
    start_date DATE,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_goal_user_id ON public.user_goal(user_id);
CREATE INDEX idx_user_goal_complete ON public.user_goal(complete);

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
    duration JSONB NOT NULL,
    days_per_week INTEGER NOT NULL,
    includes_2a_days BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout
CREATE TABLE IF NOT EXISTS train.workout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'hypertrophy', 'endurance', 'power', 'skill', 'other')),
    name TEXT,
    objectives TEXT[],
    description TEXT,
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_user_id ON train.workout(user_id);
CREATE INDEX idx_workout_workout_type ON train.workout(workout_type);

-- Protocol Workout (Junction Table)
CREATE TABLE IF NOT EXISTS train.protocol_workout (
    protocol_id UUID NOT NULL REFERENCES train.protocol(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES train.workout(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (protocol_id, workout_id)
);

CREATE INDEX idx_protocol_workout_protocol_id ON train.protocol_workout(protocol_id);
CREATE INDEX idx_protocol_workout_workout_id ON train.protocol_workout(workout_id);

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
    equipment TEXT CHECK (equipment IN ('barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'other')),
    image_url TEXT,
    video_url TEXT,
    work_power_constants JSONB NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_name ON train.exercise(name);

-- Workout Block Exercise
CREATE TABLE IF NOT EXISTS train.workout_block_exercise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_block_id UUID NOT NULL REFERENCES train.workout_block(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    measures JSONB NOT NULL,
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

-- Workout Instance
CREATE TABLE IF NOT EXISTS train.workout_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES train.workout(id) ON DELETE CASCADE,
    date DATE NOT NULL,
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
    date DATE NOT NULL,
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
    date DATE NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    personal_best BOOLEAN,
    duration JSONB,
    measures JSONB NOT NULL,
    projected_1rm JSONB,
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    notes TEXT
);

CREATE INDEX idx_workout_block_exercise_instance_user_id ON train.workout_block_exercise_instance(user_id);
CREATE INDEX idx_workout_block_exercise_instance_workout_block_instance_id ON train.workout_block_exercise_instance(workout_block_instance_id);
CREATE INDEX idx_workout_block_exercise_instance_workout_block_exercise_id ON train.workout_block_exercise_instance(workout_block_exercise_id);

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
    date DATE NOT NULL,
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
    date DATE NOT NULL,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    projected_1rm JSONB NOT NULL,
    notes TEXT
);

CREATE INDEX idx_projected_1rm_projected_1rm_log_id ON train.projected_1rm(projected_1rm_log_id);
CREATE INDEX idx_projected_1rm_exercise_id ON train.projected_1rm(exercise_id);
CREATE INDEX idx_projected_1rm_date ON train.projected_1rm(date);

-- User Profile Key Exercise (Junction Table)
CREATE TABLE IF NOT EXISTS public.user_profile_key_exercise (
    user_profile_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES train.exercise(id) ON DELETE CASCADE,
    PRIMARY KEY (user_profile_id, exercise_id)
);

CREATE INDEX idx_user_profile_key_exercise_user_profile_id ON public.user_profile_key_exercise(user_profile_id);
CREATE INDEX idx_user_profile_key_exercise_exercise_id ON public.user_profile_key_exercise(exercise_id);

