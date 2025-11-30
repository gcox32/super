-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tape_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_image_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_key_exercise ENABLE ROW LEVEL SECURITY;

-- Train schema
ALTER TABLE train.protocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.protocol_workout ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.protocol_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.workout_block_exercise_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.projected_1rm_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE train.projected_1rm ENABLE ROW LEVEL SECURITY;

-- Fuel schema
ALTER TABLE fuel.meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.food ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.portioned_food ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_portion ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.recipe_ingredient ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.grocery_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.grocery_list_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_plan_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.meal_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.portioned_food_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.supplement_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.water_intake_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.sleep_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel.sleep_instance ENABLE ROW LEVEL SECURITY;

-- Anatomy schema (reference data - read-only for all authenticated users)
ALTER TABLE anatomy.muscle_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy.muscle ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - User can only access their own data
-- ============================================================================

-- Note: auth.uid() is a built-in Supabase function, no need to create it

-- Public schema policies
CREATE POLICY "Users can view own user record" ON public.user
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user record" ON public.user
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.user_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profile
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON public.user_goal
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats log" ON public.user_stats_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own tape measurements" ON public.tape_measurement
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats us
            JOIN public.user_stats_log usl ON us.stats_log_id = usl.id
            WHERE us.id = tape_measurement.user_stats_id
            AND usl.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own image log" ON public.user_image_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own images" ON public.user_image
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own images" ON public.user_image
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own key exercises" ON public.user_profile_key_exercise
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profile
            WHERE id = user_profile_key_exercise.user_profile_id
            AND user_id = auth.uid()
        )
    );

-- Train schema policies
CREATE POLICY "Users can view all protocols" ON train.protocol
    FOR SELECT USING (true);

CREATE POLICY "Users can view own workouts" ON train.workout
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view protocol workouts" ON train.protocol_workout
    FOR SELECT USING (true);

CREATE POLICY "Users can view own workout blocks" ON train.workout_block
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout
            WHERE id = workout_block.workout_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view all exercises" ON train.exercise
    FOR SELECT USING (true);

CREATE POLICY "Users can view own workout block exercises" ON train.workout_block_exercise
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout_block wb
            JOIN train.workout w ON wb.workout_id = w.id
            WHERE wb.id = workout_block_exercise.workout_block_id
            AND w.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own protocol instances" ON train.protocol_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout instances" ON train.workout_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout block instances" ON train.workout_block_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise instances" ON train.workout_block_exercise_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own performance log" ON train.performance_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own performances" ON train.performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.performance_log
            WHERE id = performance.performance_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own projected 1RM log" ON train.projected_1rm_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own projected 1RMs" ON train.projected_1rm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.projected_1rm_log
            WHERE id = projected_1rm.projected_1rm_log_id
            AND user_id = auth.uid()
        )
    );

-- Fuel schema policies
CREATE POLICY "Users can view own meal plans" ON fuel.meal_plan
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meals" ON fuel.meal
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal_plan
            WHERE id = meal.meal_plan_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view all foods" ON fuel.food
    FOR SELECT USING (true);

CREATE POLICY "Users can view all portioned foods" ON fuel.portioned_food
    FOR SELECT USING (true);

CREATE POLICY "Users can view own meal portions" ON fuel.meal_portion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_portion.meal_id
            AND mp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view all recipes" ON fuel.recipe
    FOR SELECT USING (true);

CREATE POLICY "Users can view own meal recipes" ON fuel.meal_recipe
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_recipe.meal_id
            AND mp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view recipe ingredients" ON fuel.recipe_ingredient
    FOR SELECT USING (true);

CREATE POLICY "Users can view own grocery lists" ON fuel.grocery_list
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own grocery list items" ON fuel.grocery_list_item
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.grocery_list
            WHERE id = grocery_list_item.grocery_list_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own meal plan instances" ON fuel.meal_plan_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meal instances" ON fuel.meal_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own portioned food instances" ON fuel.portioned_food_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all supplements" ON fuel.supplement
    FOR SELECT USING (true);

CREATE POLICY "Users can view own supplement schedules" ON fuel.supplement_schedule
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own supplement instances" ON fuel.supplement_instance
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own water intake log" ON fuel.water_intake_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own water intakes" ON fuel.water_intake
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.water_intake_log
            WHERE id = water_intake.water_intake_log_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own sleep log" ON fuel.sleep_log
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sleep instances" ON fuel.sleep_instance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.sleep_log
            WHERE id = sleep_instance.sleep_log_id
            AND user_id = auth.uid()
        )
    );

-- Anatomy schema policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view muscle groups" ON anatomy.muscle_group
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view muscles" ON anatomy.muscle
    FOR SELECT USING (auth.uid() IS NOT NULL);

