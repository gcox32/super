-- Create user_goal_component table
CREATE TABLE IF NOT EXISTS user_goal_component (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES user_goal(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT, -- Enum validation handled in app or we can add check constraint
    priority INTEGER NOT NULL DEFAULT 1,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    exercise_id UUID REFERENCES exercise(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_goal_criteria table
CREATE TABLE IF NOT EXISTS user_goal_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID NOT NULL REFERENCES user_goal_component(id) ON DELETE CASCADE,
    type TEXT,
    conditional TEXT NOT NULL,
    value JSONB NOT NULL,
    initial_value JSONB,
    measurement_site TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_goal_component_goal_id ON user_goal_component(goal_id);
CREATE INDEX IF NOT EXISTS idx_user_goal_criteria_component_id ON user_goal_criteria(component_id);

-- Add simple RLS policies (optional but recommended if using Supabase client)
ALTER TABLE user_goal_component ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goal_criteria ENABLE ROW LEVEL SECURITY;

-- Policies for user_goal_component (using join on goal_id -> user_goal.user_id)
-- Note: This requires auth.uid() function which is standard in Supabase
CREATE POLICY "Users can view their own goal components" ON user_goal_component
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_goal
            WHERE user_goal.id = user_goal_component.goal_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own goal components" ON user_goal_component
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_goal
            WHERE user_goal.id = user_goal_component.goal_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own goal components" ON user_goal_component
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_goal
            WHERE user_goal.id = user_goal_component.goal_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own goal components" ON user_goal_component
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_goal
            WHERE user_goal.id = user_goal_component.goal_id
            AND user_goal.user_id = auth.uid()
        )
    );

-- Policies for user_goal_criteria (using join on component_id -> goal_id -> user_id)
CREATE POLICY "Users can view their own goal criteria" ON user_goal_criteria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_goal_component
            JOIN user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own goal criteria" ON user_goal_criteria
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_goal_component
            JOIN user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own goal criteria" ON user_goal_criteria
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_goal_component
            JOIN user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own goal criteria" ON user_goal_criteria
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_goal_component
            JOIN user_goal ON user_goal.id = user_goal_component.goal_id
            WHERE user_goal_component.id = user_goal_criteria.component_id
            AND user_goal.user_id = auth.uid()
        )
    );

