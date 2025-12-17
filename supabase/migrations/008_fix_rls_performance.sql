-- Fix RLS performance by wrapping auth.uid() in subqueries

-- Public schema policies
DROP POLICY IF EXISTS "Users can view own user record" ON public.user;
CREATE POLICY "Users can view own user record" ON public.user
    FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own user record" ON public.user;
CREATE POLICY "Users can update own user record" ON public.user
    FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profile;
CREATE POLICY "Users can view own profile" ON public.user_profile
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profile;
CREATE POLICY "Users can insert own profile" ON public.user_profile
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profile;
CREATE POLICY "Users can update own profile" ON public.user_profile
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own goals" ON public.user_goal;
CREATE POLICY "Users can view own goals" ON public.user_goal
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own stats log" ON public.user_stats_log;
CREATE POLICY "Users can view own stats log" ON public.user_stats_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stats_log
            WHERE id = user_stats.stats_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own tape measurements" ON public.tape_measurement;
CREATE POLICY "Users can view own tape measurements" ON public.tape_measurement
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stats us
            JOIN public.user_stats_log usl ON us.stats_log_id = usl.id
            WHERE us.id = tape_measurement.user_stats_id
            AND usl.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own image log" ON public.user_image_log;
CREATE POLICY "Users can view own image log" ON public.user_image_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own images" ON public.user_image;
CREATE POLICY "Users can view own images" ON public.user_image
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert own images" ON public.user_image;
CREATE POLICY "Users can insert own images" ON public.user_image
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_image_log
            WHERE id = user_image.image_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own key exercises" ON public.user_profile_key_exercise;
CREATE POLICY "Users can view own key exercises" ON public.user_profile_key_exercise
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profile
            WHERE id = user_profile_key_exercise.user_profile_id
            AND user_id = (select auth.uid())
        )
    );

-- Train schema policies
DROP POLICY IF EXISTS "Users can view own workouts" ON train.workout;
CREATE POLICY "Users can view own workouts" ON train.workout
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own workout blocks" ON train.workout_block;
CREATE POLICY "Users can view own workout blocks" ON train.workout_block
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout
            WHERE id = workout_block.workout_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own workout block exercises" ON train.workout_block_exercise;
CREATE POLICY "Users can view own workout block exercises" ON train.workout_block_exercise
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM train.workout_block wb
            JOIN train.workout w ON wb.workout_id = w.id
            WHERE wb.id = workout_block_exercise.workout_block_id
            AND w.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own protocol instances" ON train.protocol_instance;
CREATE POLICY "Users can view own protocol instances" ON train.protocol_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own workout instances" ON train.workout_instance;
CREATE POLICY "Users can view own workout instances" ON train.workout_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own workout block instances" ON train.workout_block_instance;
CREATE POLICY "Users can view own workout block instances" ON train.workout_block_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own exercise instances" ON train.workout_block_exercise_instance;
CREATE POLICY "Users can view own exercise instances" ON train.workout_block_exercise_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own performance log" ON train.performance_log;
CREATE POLICY "Users can view own performance log" ON train.performance_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own performances" ON train.performance;
CREATE POLICY "Users can view own performances" ON train.performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.performance_log
            WHERE id = performance.performance_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own projected 1RM log" ON train.projected_1rm_log;
CREATE POLICY "Users can view own projected 1RM log" ON train.projected_1rm_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own projected 1RMs" ON train.projected_1rm;
CREATE POLICY "Users can view own projected 1RMs" ON train.projected_1rm
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM train.projected_1rm_log
            WHERE id = projected_1rm.projected_1rm_log_id
            AND user_id = (select auth.uid())
        )
    );

-- Fuel schema policies
DROP POLICY IF EXISTS "Users can view own meal plans" ON fuel.meal_plan;
CREATE POLICY "Users can view own meal plans" ON fuel.meal_plan
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own meals" ON fuel.meal;
CREATE POLICY "Users can view own meals" ON fuel.meal
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal_plan
            WHERE id = meal.meal_plan_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own meal portions" ON fuel.meal_portion;
CREATE POLICY "Users can view own meal portions" ON fuel.meal_portion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_portion.meal_id
            AND mp.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own meal recipes" ON fuel.meal_recipe;
CREATE POLICY "Users can view own meal recipes" ON fuel.meal_recipe
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.meal m
            JOIN fuel.meal_plan mp ON m.meal_plan_id = mp.id
            WHERE m.id = meal_recipe.meal_id
            AND mp.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own grocery lists" ON fuel.grocery_list;
CREATE POLICY "Users can view own grocery lists" ON fuel.grocery_list
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own grocery list items" ON fuel.grocery_list_item;
CREATE POLICY "Users can view own grocery list items" ON fuel.grocery_list_item
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fuel.grocery_list
            WHERE id = grocery_list_item.grocery_list_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own meal plan instances" ON fuel.meal_plan_instance;
CREATE POLICY "Users can view own meal plan instances" ON fuel.meal_plan_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own meal instances" ON fuel.meal_instance;
CREATE POLICY "Users can view own meal instances" ON fuel.meal_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own portioned food instances" ON fuel.portioned_food_instance;
CREATE POLICY "Users can view own portioned food instances" ON fuel.portioned_food_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own supplement schedules" ON fuel.supplement_schedule;
CREATE POLICY "Users can view own supplement schedules" ON fuel.supplement_schedule
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own supplement instances" ON fuel.supplement_instance;
CREATE POLICY "Users can view own supplement instances" ON fuel.supplement_instance
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own water intake log" ON fuel.water_intake_log;
CREATE POLICY "Users can view own water intake log" ON fuel.water_intake_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own water intakes" ON fuel.water_intake;
CREATE POLICY "Users can view own water intakes" ON fuel.water_intake
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.water_intake_log
            WHERE id = water_intake.water_intake_log_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view own sleep log" ON fuel.sleep_log;
CREATE POLICY "Users can view own sleep log" ON fuel.sleep_log
    FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own sleep instances" ON fuel.sleep_instance;
CREATE POLICY "Users can view own sleep instances" ON fuel.sleep_instance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fuel.sleep_log
            WHERE id = sleep_instance.sleep_log_id
            AND user_id = (select auth.uid())
        )
    );

-- Anatomy schema policies
DROP POLICY IF EXISTS "Authenticated users can view muscle groups" ON anatomy.muscle_group;
CREATE POLICY "Authenticated users can view muscle groups" ON anatomy.muscle_group
    FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view muscles" ON anatomy.muscle;
CREATE POLICY "Authenticated users can view muscles" ON anatomy.muscle
    FOR SELECT USING ((select auth.uid()) IS NOT NULL);
