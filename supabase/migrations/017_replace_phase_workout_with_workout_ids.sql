-- Replace phase_workout junction table with workout_ids array on phase table
-- This makes workouts independent while allowing phases to reference them

-- Step 1: Add workout_ids column to phase table
ALTER TABLE train.phase
ADD COLUMN IF NOT EXISTS workout_ids TEXT[];

-- Step 2: Migrate data from phase_workout to workout_ids array
-- For each phase, collect workout IDs ordered by the order field
DO $$
DECLARE
    phase_record RECORD;
    workout_ids_array TEXT[];
BEGIN
    FOR phase_record IN SELECT id FROM train.phase
    LOOP
        -- Collect workout IDs for this phase, ordered by the order field
        SELECT ARRAY_AGG(workout_id ORDER BY "order")
        INTO workout_ids_array
        FROM train.phase_workout
        WHERE phase_id = phase_record.id;
        
        -- Update the phase with the workout IDs array
        IF workout_ids_array IS NOT NULL THEN
            UPDATE train.phase
            SET workout_ids = workout_ids_array
            WHERE id = phase_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 3: Drop the phase_workout junction table
DROP TABLE IF EXISTS train.phase_workout CASCADE;

-- Step 4: Create index on workout_ids for better query performance (using GIN index for array)
CREATE INDEX IF NOT EXISTS idx_phase_workout_ids ON train.phase USING GIN(workout_ids);

