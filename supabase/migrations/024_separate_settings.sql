-- Separate settings from preferences
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

-- Create index for user_id lookup
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Users can manage their own settings"
    ON public.user_settings
    FOR ALL
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing sleep_reminder from preferences to settings
DO $$
DECLARE
    pref_record RECORD;
BEGIN
    FOR pref_record IN 
        SELECT user_id, sleep_reminder 
        FROM public.user_preferences 
        WHERE sleep_reminder IS NOT NULL
    LOOP
        INSERT INTO public.user_settings (user_id, sleep_reminder)
        VALUES (pref_record.user_id, pref_record.sleep_reminder)
        ON CONFLICT (user_id) DO UPDATE
        SET sleep_reminder = EXCLUDED.sleep_reminder;
    END LOOP;
END $$;

-- Drop sleep_reminder column from user_preferences
ALTER TABLE public.user_preferences DROP COLUMN IF EXISTS sleep_reminder;

