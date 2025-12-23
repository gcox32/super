-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE,
    body_fat_strategy TEXT DEFAULT 'weighted_mean',
    preferred_weight_unit TEXT CHECK (preferred_weight_unit IN ('kg', 'lb')) DEFAULT 'lb',
    preferred_length_unit TEXT CHECK (preferred_length_unit IN ('cm', 'in')) DEFAULT 'in',
    body_fat_max_days_old INTEGER DEFAULT 30,
    sleep_reminder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id lookup
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Add RLS policy (Users can only see/modify their own preferences)
CREATE POLICY "Users can manage their own preferences"
    ON public.user_preferences
    FOR ALL
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

