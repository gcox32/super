-- Add date field to tape_measurement table to allow querying latest measurements independently
-- This allows tape measurements to be tracked separately from user_stats entries
ALTER TABLE public.tape_measurement
  ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create index on date for efficient queries
CREATE INDEX idx_tape_measurement_date ON public.tape_measurement(date);

-- Update existing records to use the date from their associated user_stats entry
UPDATE public.tape_measurement tm
SET date = (
  SELECT us.date
  FROM public.user_stats us
  WHERE us.id = tm.user_stats_id
);

-- Now that all existing records have dates, we can remove the default
ALTER TABLE public.tape_measurement
  ALTER COLUMN date DROP DEFAULT;

