# Database Schema Documentation

This document describes the relational database schema for the Super application, designed to work with Supabase (PostgreSQL).

## Schema Organization

The database is organized into several schemas:

- **`public`**: User-related tables (extends Supabase auth)
- **`train`**: Training and exercise data
- **`fuel`**: Nutrition, meal planning, and supplements
- **`anatomy`**: Reference data for muscles and muscle groups

## Table Relationships Overview

### User Domain (public schema)
- `user` → `user_profile` (1:1)
- `user_profile` → `user_goal` (1:many)
- `user_profile` → `user_stats_log` (1:1)
- `user_profile` → `user_image_log` (1:1)
- `user_stats_log` → `user_stats` (1:many)
- `user_stats` → `tape_measurement` (1:1)
- `user_image_log` → `user_image` (1:many)

### Train Domain
**Prescribed Elements:**
- `protocol` → `workout` (1:many, via junction table)
- `workout` → `workout_block` (1:many)
- `workout_block` → `workout_block_exercise` (1:many)
- `workout_block_exercise` → `exercise` (many:1)
- `exercise` → `muscle_group` (many:many, via JSONB)

**Instances:**
- `protocol_instance` → `workout_instance` (1:many)
- `workout_instance` → `workout_block_instance` (1:many)
- `workout_block_instance` → `workout_block_exercise_instance` (1:many)
- `workout_block_exercise_instance` → `workout_block_exercise` (many:1)

**Logs:**
- `performance_log` → `performance` (1:many)
- `projected_1rm_log` → `projected_1rm` (1:many)
- `projected_1rm` → `exercise` (many:1)

### Fuel Domain
**Prescribed Elements:**
- `meal_plan` → `meal` (1:many)
- `meal` → `meal_portion` (1:many, junction table)
- `meal_portion` → `portioned_food` (many:1)
- `portioned_food` → `food` (many:1)
- `recipe` → `recipe_ingredient` (1:many, junction table)
- `recipe_ingredient` → `portioned_food` (many:1)
- `grocery_list` → `grocery_list_item` (1:many, junction table)
- `grocery_list_item` → `portioned_food` (many:1)

**Instances:**
- `meal_plan_instance` → `meal_instance` (1:many)
- `meal_instance` → `portioned_food_instance` (1:many)
- `portioned_food_instance` → `food` (many:1)

**Supplements & Tracking:**
- `supplement_schedule` → `supplement_instance` (1:many)
- `supplement_instance` → `supplement` (many:1)
- `water_intake_log` → `water_intake` (1:many)
- `sleep_log` → `sleep_instance` (1:many)

## Detailed Table Specifications

### Public Schema

#### `user`
Extends Supabase `auth.users`. The `id` field references `auth.users.id`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users.id | User ID from Supabase auth |
| email | text | NOT NULL | User email |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Account creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

#### `user_profile`
User profile information and preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Profile ID |
| user_id | uuid | FK → user.id, UNIQUE, NOT NULL | Reference to user |
| email | text | NOT NULL | Email (denormalized from user) |
| first_name | text | | User's first name |
| last_name | text | | User's last name |
| profile_picture | text | | URL to profile picture |
| bio | text | | User biography |
| gender | text | CHECK (gender IN ('male', 'female')) | User gender |
| birth_date | date | | Date of birth |
| daily_water_recommendation | jsonb | | LiquidMeasurement JSON |
| activity_level | text | CHECK (activity_level IN (...)) | Activity level enum |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_user_profile_user_id` on `user_id`

#### `user_goal`
User goals and objectives.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Goal ID |
| user_id | uuid | FK → user.id, NOT NULL | Reference to user |
| name | text | | Goal name |
| description | text | | Goal description |
| duration | jsonb | | LongTimeMeasurement JSON |
| start_date | date | | Goal start date |
| end_date | date | | Goal end date (nullable) |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| notes | text | | Additional notes |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_user_goal_user_id` on `user_id`
- `idx_user_goal_complete` on `complete`

#### `user_stats_log`
Container for user statistics entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Stats log ID |
| user_id | uuid | FK → user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_user_stats_log_user_id` on `user_id`

#### `user_stats`
Individual statistics entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Stats entry ID |
| stats_log_id | uuid | FK → user_stats_log.id, NOT NULL | Reference to stats log |
| height | jsonb | | HeightMeasurement JSON |
| weight | jsonb | | WeightMeasurement JSON |
| body_fat_percentage | jsonb | | PercentageMeasurement JSON |
| muscle_mass | jsonb | | WeightMeasurement JSON |
| date | date | NOT NULL | Date of measurement |

**Indexes:**
- `idx_user_stats_stats_log_id` on `stats_log_id`
- `idx_user_stats_date` on `date`

#### `tape_measurement`
Body measurements for a stats entry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Measurement ID |
| user_stats_id | uuid | FK → user_stats.id, UNIQUE, NOT NULL | Reference to stats entry |
| neck | jsonb | | DistanceMeasurement JSON |
| shoulders | jsonb | | DistanceMeasurement JSON |
| chest | jsonb | | DistanceMeasurement JSON |
| waist | jsonb | | DistanceMeasurement JSON |
| hips | jsonb | | DistanceMeasurement JSON |
| left_arm | jsonb | | DistanceMeasurement JSON |
| right_arm | jsonb | | DistanceMeasurement JSON |
| left_leg | jsonb | | DistanceMeasurement JSON |
| right_leg | jsonb | | DistanceMeasurement JSON |
| left_forearm | jsonb | | DistanceMeasurement JSON |
| right_forearm | jsonb | | DistanceMeasurement JSON |
| left_calf | jsonb | | DistanceMeasurement JSON |
| right_calf | jsonb | | DistanceMeasurement JSON |

**Indexes:**
- `idx_tape_measurement_user_stats_id` on `user_stats_id`

#### `user_image_log`
Container for user progress images.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Image log ID |
| user_id | uuid | FK → user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_user_image_log_user_id` on `user_id`

#### `user_image`
Individual progress images.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Image ID |
| image_log_id | uuid | FK → user_image_log.id, NOT NULL | Reference to image log |
| date | date | NOT NULL | Date of image |
| image_url | text | NOT NULL | URL to image |
| notes | text | | Additional notes |

**Indexes:**
- `idx_user_image_image_log_id` on `image_log_id`
- `idx_user_image_date` on `date`

#### `user_profile_key_exercise`
Junction table for user profile key exercises.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_profile_id | uuid | FK → user_profile.id, NOT NULL | Reference to profile |
| exercise_id | uuid | FK → train.exercise.id, NOT NULL | Reference to exercise |
| PRIMARY KEY (user_profile_id, exercise_id) | | | Composite primary key |

### Train Schema

#### `train.protocol`
Workout protocols (templates).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Protocol ID |
| name | text | NOT NULL | Protocol name |
| objectives | text[] | NOT NULL | Array of objectives |
| description | text | | Protocol description |
| duration | jsonb | NOT NULL | LongTimeMeasurement JSON |
| days_per_week | integer | NOT NULL | Days per week |
| includes_2a_days | boolean | NOT NULL, DEFAULT false | Includes 2-a-day workouts |
| notes | text | | Additional notes |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

#### `train.protocol_workout`
Junction table for protocol-workout relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| protocol_id | uuid | FK → train.protocol.id, NOT NULL | Reference to protocol |
| workout_id | uuid | FK → train.workout.id, NOT NULL | Reference to workout |
| order | integer | NOT NULL | Display order |
| PRIMARY KEY (protocol_id, workout_id) | | | Composite primary key |

**Indexes:**
- `idx_protocol_workout_protocol_id` on `protocol_id`
- `idx_protocol_workout_workout_id` on `workout_id`

#### `train.workout`
Workout templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Workout ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| workout_type | text | NOT NULL, CHECK (workout_type IN (...)) | WorkoutType enum |
| name | text | | Workout name |
| objectives | text[] | | Array of objectives |
| description | text | | Workout description |
| estimated_duration | integer | | Estimated duration in minutes |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_workout_user_id` on `user_id`
- `idx_workout_workout_type` on `workout_type`

#### `train.workout_block`
Workout block templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Block ID |
| workout_id | uuid | FK → train.workout.id, NOT NULL | Reference to workout |
| workout_block_type | text | NOT NULL, CHECK (workout_block_type IN (...)) | WorkoutBlockType enum |
| name | text | | Block name |
| description | text | | Block description |
| order | integer | NOT NULL | Display order |
| circuit | boolean | NOT NULL, DEFAULT false | Is circuit training |
| estimated_duration | integer | | Estimated duration in minutes |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_workout_block_workout_id` on `workout_id`
- `idx_workout_block_order` on `(workout_id, order)`

#### `train.workout_block_exercise`
Exercise assignments within workout blocks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Exercise assignment ID |
| workout_block_id | uuid | FK → train.workout_block.id, NOT NULL | Reference to block |
| exercise_id | uuid | FK → train.exercise.id, NOT NULL | Reference to exercise |
| order | integer | NOT NULL | Display order |
| sets | integer | NOT NULL | Number of sets |
| measures | jsonb | NOT NULL | ExerciseMeasures JSON |
| tempo | jsonb | | Tempo object JSON |
| rest_time | integer | CHECK (rest_time IN (0, 15, 30, ...)) | Rest timer in seconds |
| rpe | integer | CHECK (rpe BETWEEN 1 AND 10) | Rate of perceived exertion |
| notes | text | | Additional notes |

**Indexes:**
- `idx_workout_block_exercise_workout_block_id` on `workout_block_id`
- `idx_workout_block_exercise_exercise_id` on `exercise_id`
- `idx_workout_block_exercise_order` on `(workout_block_id, order)`

#### `train.exercise`
Exercise definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Exercise ID |
| name | text | NOT NULL | Exercise name |
| description | text | | Exercise description |
| movement_pattern | text | CHECK (movement_pattern IN (...)) | MovementPattern enum |
| muscle_groups | jsonb | NOT NULL | EffectedMuscleGroups JSON |
| plane_of_motion | text | CHECK (plane_of_motion IN (...)) | PlaneOfMotion enum |
| bilateral | boolean | | Is bilateral exercise |
| equipment | text | CHECK (equipment IN (...)) | Equipment enum |
| image_url | text | | URL to exercise image |
| video_url | text | | URL to exercise video |
| work_power_constants | jsonb | NOT NULL | WorkPowerConstants JSON |
| difficulty | text | CHECK (difficulty IN (...)) | Difficulty enum |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_exercise_name` on `name` (for search)

#### `train.protocol_instance`
User's active protocol instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| protocol_id | uuid | FK → train.protocol.id, NOT NULL | Reference to protocol |
| active | boolean | NOT NULL, DEFAULT true | Is currently active |
| start_date | date | NOT NULL | Start date |
| end_date | date | | End date (nullable) |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| duration | jsonb | | LongTimeMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_protocol_instance_user_id` on `user_id`
- `idx_protocol_instance_protocol_id` on `protocol_id`
- `idx_protocol_instance_active` on `(user_id, active)`

#### `train.workout_instance`
Executed or scheduled workout instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| workout_id | uuid | FK → train.workout.id, NOT NULL | Reference to workout |
| date | date | NOT NULL | Workout date |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| duration | jsonb | | TimeMeasurement JSON |
| volume | jsonb | | WeightMeasurement JSON |
| work | jsonb | | WorkMeasurement JSON |
| average_power | jsonb | | PowerMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_workout_instance_user_id` on `user_id`
- `idx_workout_instance_workout_id` on `workout_id`
- `idx_workout_instance_date` on `(user_id, date)`

#### `train.workout_block_instance`
Executed workout block instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| workout_instance_id | uuid | FK → train.workout_instance.id, NOT NULL, ON DELETE CASCADE | Reference to workout instance |
| workout_block_id | uuid | FK → train.workout_block.id, NOT NULL | Reference to block |
| date | date | NOT NULL | Block date |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| duration | jsonb | | TimeMeasurement JSON |
| volume | jsonb | | WeightMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_workout_block_instance_user_id` on `user_id`
- `idx_workout_block_instance_workout_instance_id` on `workout_instance_id`
- `idx_workout_block_instance_workout_block_id` on `workout_block_id`

#### `train.workout_block_exercise_instance`
Executed exercise instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| workout_block_instance_id | uuid | FK → train.workout_block_instance.id, NOT NULL, ON DELETE CASCADE | Reference to block instance |
| workout_block_exercise_id | uuid | FK → train.workout_block_exercise.id, NOT NULL | Reference to exercise assignment |
| date | date | NOT NULL | Exercise date |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| personal_best | boolean | | Is personal best |
| duration | jsonb | | TimeMeasurement JSON |
| measures | jsonb | NOT NULL | ExerciseMeasures JSON |
| projected_1rm | jsonb | | WeightMeasurement JSON |
| rpe | integer | CHECK (rpe BETWEEN 1 AND 10) | Rate of perceived exertion |
| notes | text | | Additional notes |

**Indexes:**
- `idx_workout_block_exercise_instance_user_id` on `user_id`
- `idx_workout_block_exercise_instance_workout_block_instance_id` on `workout_block_instance_id`
- `idx_workout_block_exercise_instance_workout_block_exercise_id` on `workout_block_exercise_id`

#### `train.performance_log`
Container for performance entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Performance log ID |
| user_id | uuid | FK → public.user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_performance_log_user_id` on `user_id`

#### `train.performance`
Individual performance entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Performance ID |
| performance_log_id | uuid | FK → train.performance_log.id, NOT NULL | Reference to performance log |
| date | date | NOT NULL | Performance date |
| duration | jsonb | NOT NULL | TimeMeasurement JSON |
| volume | jsonb | NOT NULL | WeightMeasurement JSON |
| work | jsonb | NOT NULL | WorkMeasurement JSON |
| power | jsonb | NOT NULL | PowerMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_performance_performance_log_id` on `performance_log_id`
- `idx_performance_date` on `date`

#### `train.projected_1rm_log`
Container for projected 1RM entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Projected 1RM log ID |
| user_id | uuid | FK → public.user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_projected_1rm_log_user_id` on `user_id`

#### `train.projected_1rm`
Individual projected 1RM entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Projected 1RM ID |
| projected_1rm_log_id | uuid | FK → train.projected_1rm_log.id, NOT NULL | Reference to log |
| date | date | NOT NULL | Entry date |
| exercise_id | uuid | FK → train.exercise.id, NOT NULL | Reference to exercise |
| projected_1rm | jsonb | NOT NULL | WeightMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_projected_1rm_projected_1rm_log_id` on `projected_1rm_log_id`
- `idx_projected_1rm_exercise_id` on `exercise_id`
- `idx_projected_1rm_date` on `date`

### Fuel Schema

#### `fuel.meal_plan`
Meal plan templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Meal plan ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| name | text | NOT NULL | Meal plan name |
| description | text | | Meal plan description |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_meal_plan_user_id` on `user_id`

#### `fuel.meal`
Meal templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Meal ID |
| meal_plan_id | uuid | FK → fuel.meal_plan.id, NOT NULL | Reference to meal plan |
| name | text | NOT NULL | Meal name |
| description | text | | Meal description |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_meal_meal_plan_id` on `meal_plan_id`

#### `fuel.food`
Food definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Food ID |
| name | text | NOT NULL | Food name |
| description | text | | Food description |
| image_url | text | | URL to food image |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_food_name` on `name` (for search)

#### `fuel.portioned_food`
Food with portion size and nutritional information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Portioned food ID |
| food_id | uuid | FK → fuel.food.id, NOT NULL | Reference to food |
| calories | numeric | | Calories per portion |
| macros | jsonb | | Macros JSON |
| micros | jsonb | | Micros JSON |
| portion_size | jsonb | NOT NULL | PortionMeasurement JSON |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_portioned_food_food_id` on `food_id`

#### `fuel.meal_portion`
Junction table for meal-portioned food relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| meal_id | uuid | FK → fuel.meal.id, NOT NULL | Reference to meal |
| portioned_food_id | uuid | FK → fuel.portioned_food.id, NOT NULL | Reference to portioned food |
| order | integer | NOT NULL | Display order |
| PRIMARY KEY (meal_id, portioned_food_id) | | | Composite primary key |

**Indexes:**
- `idx_meal_portion_meal_id` on `meal_id`
- `idx_meal_portion_portioned_food_id` on `portioned_food_id`

#### `fuel.meal_recipe`
Junction table for meal-recipe relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| meal_id | uuid | FK → fuel.meal.id, NOT NULL | Reference to meal |
| recipe_id | uuid | FK → fuel.recipe.id, NOT NULL | Reference to recipe |
| PRIMARY KEY (meal_id, recipe_id) | | | Composite primary key |

**Indexes:**
- `idx_meal_recipe_meal_id` on `meal_id`
- `idx_meal_recipe_recipe_id` on `recipe_id`

#### `fuel.recipe`
Recipe definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Recipe ID |
| name | text | NOT NULL | Recipe name |
| text | text | NOT NULL | Recipe instructions |
| image_url | text | | URL to recipe image |
| macros | jsonb | | Macros JSON |
| micros | jsonb | | Micros JSON |
| calories | jsonb | | CaloriesMeasurement JSON |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

#### `fuel.recipe_ingredient`
Junction table for recipe-portioned food relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| recipe_id | uuid | FK → fuel.recipe.id, NOT NULL | Reference to recipe |
| portioned_food_id | uuid | FK → fuel.portioned_food.id, NOT NULL | Reference to portioned food |
| order | integer | NOT NULL | Display order |
| PRIMARY KEY (recipe_id, portioned_food_id) | | | Composite primary key |

**Indexes:**
- `idx_recipe_ingredient_recipe_id` on `recipe_id`
- `idx_recipe_ingredient_portioned_food_id` on `portioned_food_id`

#### `fuel.grocery_list`
Grocery list definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Grocery list ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| name | text | NOT NULL | Grocery list name |
| description | text | | Grocery list description |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_grocery_list_user_id` on `user_id`

#### `fuel.grocery_list_item`
Junction table for grocery list-portioned food relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| grocery_list_id | uuid | FK → fuel.grocery_list.id, NOT NULL | Reference to grocery list |
| portioned_food_id | uuid | FK → fuel.portioned_food.id, NOT NULL | Reference to portioned food |
| order | integer | NOT NULL | Display order |
| PRIMARY KEY (grocery_list_id, portioned_food_id) | | | Composite primary key |

**Indexes:**
- `idx_grocery_list_item_grocery_list_id` on `grocery_list_id`
- `idx_grocery_list_item_portioned_food_id` on `portioned_food_id`

#### `fuel.meal_plan_instance`
User's active meal plan instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| meal_plan_id | uuid | FK → fuel.meal_plan.id, NOT NULL | Reference to meal plan |
| start_date | date | NOT NULL | Start date |
| end_date | date | | End date (nullable) |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| notes | text | | Additional notes |

**Indexes:**
- `idx_meal_plan_instance_user_id` on `user_id`
- `idx_meal_plan_instance_meal_plan_id` on `meal_plan_id`

#### `fuel.meal_instance`
Executed or scheduled meal instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| meal_plan_instance_id | uuid | FK → fuel.meal_plan_instance.id, NOT NULL | Reference to meal plan instance |
| meal_id | uuid | FK → fuel.meal.id, NOT NULL | Reference to meal |
| date | date | NOT NULL | Meal date |
| timestamp | timestamptz | | Actual meal time |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| notes | text | | Additional notes |

**Indexes:**
- `idx_meal_instance_user_id` on `user_id`
- `idx_meal_instance_meal_plan_instance_id` on `meal_plan_instance_id`
- `idx_meal_instance_meal_id` on `meal_id`
- `idx_meal_instance_date` on `(user_id, date)`

#### `fuel.portioned_food_instance`
Executed portioned food instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| meal_instance_id | uuid | FK → fuel.meal_instance.id, NOT NULL, ON DELETE CASCADE | Reference to meal instance |
| food_id | uuid | FK → fuel.food.id, NOT NULL | Reference to food |
| portion | jsonb | NOT NULL | PortionMeasurement JSON |
| complete | boolean | NOT NULL, DEFAULT false | Completion status |
| notes | text | | Additional notes |

**Indexes:**
- `idx_portioned_food_instance_user_id` on `user_id`
- `idx_portioned_food_instance_meal_instance_id` on `meal_instance_id`
- `idx_portioned_food_instance_food_id` on `food_id`

#### `fuel.supplement`
Supplement definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Supplement ID |
| name | text | NOT NULL | Supplement name |
| description | text | | Supplement description |
| image_url | text | | URL to supplement image |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

#### `fuel.supplement_schedule`
Supplement schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Schedule ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| name | text | NOT NULL | Schedule name |
| schedule_type | text | NOT NULL, CHECK (schedule_type IN (...)) | ScheduleType enum |
| description | text | | Schedule description |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Update timestamp |

**Indexes:**
- `idx_supplement_schedule_user_id` on `user_id`

#### `fuel.supplement_instance`
Supplement intake instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Instance ID |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| supplement_schedule_id | uuid | FK → fuel.supplement_schedule.id, NOT NULL | Reference to schedule |
| supplement_id | uuid | FK → fuel.supplement.id, NOT NULL | Reference to supplement |
| dosage | jsonb | NOT NULL | DosageMeasurement JSON |
| date | date | NOT NULL | Intake date |
| complete | boolean | | Completion status |
| notes | text | | Additional notes |

**Indexes:**
- `idx_supplement_instance_user_id` on `user_id`
- `idx_supplement_instance_supplement_schedule_id` on `supplement_schedule_id`
- `idx_supplement_instance_supplement_id` on `supplement_id`
- `idx_supplement_instance_date` on `(user_id, date)`

#### `fuel.water_intake_log`
Container for water intake entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Water intake log ID |
| user_id | uuid | FK → public.user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_water_intake_log_user_id` on `user_id`

#### `fuel.water_intake`
Individual water intake entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Water intake ID |
| water_intake_log_id | uuid | FK → fuel.water_intake_log.id, NOT NULL | Reference to log |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| date | date | NOT NULL | Intake date |
| timestamp | timestamptz | | Actual intake time |
| amount | jsonb | NOT NULL | LiquidMeasurement JSON |
| notes | text | | Additional notes |

**Indexes:**
- `idx_water_intake_water_intake_log_id` on `water_intake_log_id`
- `idx_water_intake_user_id` on `user_id`
- `idx_water_intake_date` on `(user_id, date)`

#### `fuel.sleep_log`
Container for sleep entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Sleep log ID |
| user_id | uuid | FK → public.user.id, UNIQUE, NOT NULL | Reference to user |

**Indexes:**
- `idx_sleep_log_user_id` on `user_id`

#### `fuel.sleep_instance`
Individual sleep entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Sleep instance ID |
| sleep_log_id | uuid | FK → fuel.sleep_log.id, NOT NULL | Reference to log |
| user_id | uuid | FK → public.user.id, NOT NULL | Reference to user |
| date | date | NOT NULL | Sleep date |
| time_asleep | jsonb | | TimeMeasurement JSON (hours) |
| start_time | timestamptz | | Sleep start time |
| end_time | timestamptz | | Sleep end time |
| sleep_score | numeric | | Sleep quality score |
| wake_count | integer | | Number of wake events |
| time_awake | jsonb | | TimeMeasurement JSON (minutes) |
| notes | text | | Additional notes |

**Indexes:**
- `idx_sleep_instance_sleep_log_id` on `sleep_log_id`
- `idx_sleep_instance_user_id` on `user_id`
- `idx_sleep_instance_date` on `(user_id, date)`

### Anatomy Schema

#### `anatomy.muscle_group`
Muscle group reference data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Muscle group ID |
| name | text | NOT NULL, UNIQUE | Muscle group name |
| description | text | | Muscle group description |

**Indexes:**
- `idx_muscle_group_name` on `name`

#### `anatomy.muscle`
Muscle reference data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Muscle ID |
| name | text | NOT NULL | Muscle name |
| description | text | | Muscle description |
| muscle_group_id | uuid | FK → anatomy.muscle_group.id, NOT NULL | Reference to muscle group |
| scientific_name | text | | Scientific name |

**Indexes:**
- `idx_muscle_muscle_group_id` on `muscle_group_id`
- `idx_muscle_name` on `name`

## Data Types

### JSONB Measurement Types

All measurements are stored as JSONB with the following structure:
```json
{
  "value": number,
  "unit": string
}
```

Examples:
- `WeightMeasurement`: `{ "value": 100, "unit": "kg" }`
- `DistanceMeasurement`: `{ "value": 50, "unit": "cm" }`
- `TimeMeasurement`: `{ "value": 30, "unit": "min" }`
- `LiquidMeasurement`: `{ "value": 500, "unit": "ml" }`
- `PortionMeasurement`: `{ "value": 100, "unit": "g" }`

### JSONB Complex Types

- `Macros`: `{ "protein": number, "carbs": number, "fat": number }`
- `Micros`: Complex object with all micronutrient fields
- `EffectedMuscleGroups`: `{ "primary": uuid, "secondary": uuid, "tertiary": uuid }`
- `WorkPowerConstants`: `{ "useCalories": boolean, "defaultDistance": {...}, "armLengthFactor": number, ... }`
- `ExerciseMeasures`: `{ "externalLoad": {...}, "includeBodyweight": boolean, "reps": number, ... }`
- `Tempo`: `{ "eccentric": {...}, "bottom": {...}, "concentric": {...}, "top": {...} }`

## Cascade Delete Rules

The following tables have CASCADE delete rules to maintain referential integrity:

- `train.workout_block_instance` → `train.workout_instance` (ON DELETE CASCADE)
- `train.workout_block_exercise_instance` → `train.workout_block_instance` (ON DELETE CASCADE)
- `fuel.portioned_food_instance` → `fuel.meal_instance` (ON DELETE CASCADE)

## Row Level Security (RLS)

All tables should have RLS policies enabled. Users should only be able to:
- SELECT, INSERT, UPDATE, DELETE their own records
- SELECT public/reference data (exercises, foods, muscle groups, etc.)

## Indexes

Indexes are created on:
- All foreign keys
- Frequently queried date fields
- User ID + date combinations for time-series queries
- Search fields (names, etc.)

## Triggers

Recommended triggers:
- `updated_at` timestamp auto-update on all tables
- Aggregate calculations (e.g., workout volume, work, power)

