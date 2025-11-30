-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column

-- Public schema
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public.user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON public.user_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goal_updated_at BEFORE UPDATE ON public.user_goal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Train schema
CREATE TRIGGER update_protocol_updated_at BEFORE UPDATE ON train.protocol
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

