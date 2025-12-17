-- Change date columns to timestamptz to capture time
ALTER TABLE train.workout_instance ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
ALTER TABLE train.workout_block_instance ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
ALTER TABLE train.workout_block_exercise_instance ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
