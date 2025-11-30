-- ============================================================================
-- FUEL SCHEMA
-- ============================================================================

-- Meal Plan
CREATE TABLE IF NOT EXISTS fuel.meal_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plan_user_id ON fuel.meal_plan(user_id);

-- Meal
CREATE TABLE IF NOT EXISTS fuel.meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_meal_plan_id ON fuel.meal(meal_plan_id);

-- Food
CREATE TABLE IF NOT EXISTS fuel.food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_name ON fuel.food(name);

-- Portioned Food
CREATE TABLE IF NOT EXISTS fuel.portioned_food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    portion_size JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portioned_food_food_id ON fuel.portioned_food(food_id);

-- Meal Portion (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.meal_portion (
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (meal_id, portioned_food_id)
);

CREATE INDEX idx_meal_portion_meal_id ON fuel.meal_portion(meal_id);
CREATE INDEX idx_meal_portion_portioned_food_id ON fuel.meal_portion(portioned_food_id);

-- Recipe
CREATE TABLE IF NOT EXISTS fuel.recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    macros JSONB,
    micros JSONB,
    calories JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meal Recipe (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.meal_recipe (
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES fuel.recipe(id) ON DELETE CASCADE,
    PRIMARY KEY (meal_id, recipe_id)
);

CREATE INDEX idx_meal_recipe_meal_id ON fuel.meal_recipe(meal_id);
CREATE INDEX idx_meal_recipe_recipe_id ON fuel.meal_recipe(recipe_id);

-- Recipe Ingredient (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.recipe_ingredient (
    recipe_id UUID NOT NULL REFERENCES fuel.recipe(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (recipe_id, portioned_food_id)
);

CREATE INDEX idx_recipe_ingredient_recipe_id ON fuel.recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_portioned_food_id ON fuel.recipe_ingredient(portioned_food_id);

-- Grocery List
CREATE TABLE IF NOT EXISTS fuel.grocery_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grocery_list_user_id ON fuel.grocery_list(user_id);

-- Grocery List Item (Junction Table)
CREATE TABLE IF NOT EXISTS fuel.grocery_list_item (
    grocery_list_id UUID NOT NULL REFERENCES fuel.grocery_list(id) ON DELETE CASCADE,
    portioned_food_id UUID NOT NULL REFERENCES fuel.portioned_food(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    PRIMARY KEY (grocery_list_id, portioned_food_id)
);

CREATE INDEX idx_grocery_list_item_grocery_list_id ON fuel.grocery_list_item(grocery_list_id);
CREATE INDEX idx_grocery_list_item_portioned_food_id ON fuel.grocery_list_item(portioned_food_id);

-- Meal Plan Instance
CREATE TABLE IF NOT EXISTS fuel.meal_plan_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_meal_plan_instance_user_id ON fuel.meal_plan_instance(user_id);
CREATE INDEX idx_meal_plan_instance_meal_plan_id ON fuel.meal_plan_instance(meal_plan_id);

-- Meal Instance
CREATE TABLE IF NOT EXISTS fuel.meal_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_instance_id UUID NOT NULL REFERENCES fuel.meal_plan_instance(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_meal_instance_user_id ON fuel.meal_instance(user_id);
CREATE INDEX idx_meal_instance_meal_plan_instance_id ON fuel.meal_instance(meal_plan_instance_id);
CREATE INDEX idx_meal_instance_meal_id ON fuel.meal_instance(meal_id);
CREATE INDEX idx_meal_instance_date ON fuel.meal_instance(user_id, date);

-- Portioned Food Instance
CREATE TABLE IF NOT EXISTS fuel.portioned_food_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_instance_id UUID NOT NULL REFERENCES fuel.meal_instance(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    portion JSONB NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_portioned_food_instance_user_id ON fuel.portioned_food_instance(user_id);
CREATE INDEX idx_portioned_food_instance_meal_instance_id ON fuel.portioned_food_instance(meal_instance_id);
CREATE INDEX idx_portioned_food_instance_food_id ON fuel.portioned_food_instance(food_id);

-- Supplement
CREATE TABLE IF NOT EXISTS fuel.supplement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplement Schedule
CREATE TABLE IF NOT EXISTS fuel.supplement_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('hourly', 'twice-daily', 'every-other-day', 'daily', 'weekly', 'bi-weekly', 'monthly', 'once', 'other')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supplement_schedule_user_id ON fuel.supplement_schedule(user_id);

-- Supplement Instance
CREATE TABLE IF NOT EXISTS fuel.supplement_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    supplement_schedule_id UUID NOT NULL REFERENCES fuel.supplement_schedule(id) ON DELETE CASCADE,
    supplement_id UUID NOT NULL REFERENCES fuel.supplement(id) ON DELETE CASCADE,
    dosage JSONB NOT NULL,
    date DATE NOT NULL,
    complete BOOLEAN,
    notes TEXT
);

CREATE INDEX idx_supplement_instance_user_id ON fuel.supplement_instance(user_id);
CREATE INDEX idx_supplement_instance_supplement_schedule_id ON fuel.supplement_instance(supplement_schedule_id);
CREATE INDEX idx_supplement_instance_supplement_id ON fuel.supplement_instance(supplement_id);
CREATE INDEX idx_supplement_instance_date ON fuel.supplement_instance(user_id, date);

-- Water Intake Log
CREATE TABLE IF NOT EXISTS fuel.water_intake_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_water_intake_log_user_id ON fuel.water_intake_log(user_id);

-- Water Intake
CREATE TABLE IF NOT EXISTS fuel.water_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    water_intake_log_id UUID NOT NULL REFERENCES fuel.water_intake_log(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ,
    amount JSONB NOT NULL,
    notes TEXT
);

CREATE INDEX idx_water_intake_water_intake_log_id ON fuel.water_intake(water_intake_log_id);
CREATE INDEX idx_water_intake_user_id ON fuel.water_intake(user_id);
CREATE INDEX idx_water_intake_date ON fuel.water_intake(user_id, date);

-- Sleep Log
CREATE TABLE IF NOT EXISTS fuel.sleep_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE INDEX idx_sleep_log_user_id ON fuel.sleep_log(user_id);

-- Sleep Instance
CREATE TABLE IF NOT EXISTS fuel.sleep_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sleep_log_id UUID NOT NULL REFERENCES fuel.sleep_log(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_asleep JSONB,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    sleep_score NUMERIC,
    wake_count INTEGER,
    time_awake JSONB,
    notes TEXT
);

CREATE INDEX idx_sleep_instance_sleep_log_id ON fuel.sleep_instance(sleep_log_id);
CREATE INDEX idx_sleep_instance_user_id ON fuel.sleep_instance(user_id);
CREATE INDEX idx_sleep_instance_date ON fuel.sleep_instance(user_id, date);

