-- Add Phase entity between Protocol and Workout
-- Migration: Protocol -> Phase -> Workout (instead of Protocol -> Workout)

-- Step 1: Create phase table
CREATE TABLE IF NOT EXISTS train.phase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES train.protocol(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purpose TEXT,
    duration JSONB NOT NULL,
    days_per_week INTEGER NOT NULL,
    includes_2a_days BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phase_protocol_id ON train.phase(protocol_id);
CREATE INDEX idx_phase_order ON train.phase(protocol_id, "order");

-- Step 2: Create phase_workout junction table
CREATE TABLE IF NOT EXISTS train.phase_workout (
    phase_id UUID NOT NULL REFERENCES train.phase(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES train.workout(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (phase_id, workout_id)
);

CREATE INDEX idx_phase_workout_phase_id ON train.phase_workout(phase_id);
CREATE INDEX idx_phase_workout_workout_id ON train.phase_workout(workout_id);

-- Step 4: Migrate existing data
-- For each protocol, create a default phase with the protocol's duration/days_per_week/includes_2a_days
-- Then migrate protocol_workout relationships to phase_workout through the new phase
DO $$
DECLARE
    protocol_record RECORD;
    new_phase_id UUID;
    workout_order INTEGER;
BEGIN
    -- Loop through each protocol
    FOR protocol_record IN 
        SELECT id, name, duration, days_per_week, includes_2a_days 
        FROM train.protocol
    LOOP
        -- Create a default phase for this protocol
        INSERT INTO train.phase (
            protocol_id,
            name,
            purpose,
            duration,
            days_per_week,
            includes_2a_days,
            "order",
            notes
        ) VALUES (
            protocol_record.id,
            'Phase 1', -- Default name
            'Initial phase', -- Default purpose
            protocol_record.duration,
            protocol_record.days_per_week,
            protocol_record.includes_2a_days,
            1, -- Default order
            'Migrated from protocol'
        ) RETURNING id INTO new_phase_id;

        -- Migrate workouts from protocol_workout to phase_workout
        FOR workout_order IN 
            SELECT "order" 
            FROM train.protocol_workout 
            WHERE protocol_id = protocol_record.id 
            ORDER BY "order"
        LOOP
            INSERT INTO train.phase_workout (phase_id, workout_id, "order")
            SELECT new_phase_id, workout_id, "order"
            FROM train.protocol_workout
            WHERE protocol_id = protocol_record.id 
            AND "order" = workout_order;
        END LOOP;
    END LOOP;
END $$;

-- Step 5: Remove old columns from protocol table
ALTER TABLE train.protocol
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS days_per_week,
DROP COLUMN IF EXISTS includes_2a_days;

-- Step 6: Drop old protocol_workout junction table
DROP TABLE IF EXISTS train.protocol_workout CASCADE;

