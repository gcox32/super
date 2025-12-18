-- Add optional image_url column to protocol, phase, and workout tables

ALTER TABLE train.protocol
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE train.phase
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE train.workout
ADD COLUMN IF NOT EXISTS image_url TEXT;

