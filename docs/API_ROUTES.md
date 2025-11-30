# API Routes Documentation

All API routes require authentication via Supabase. The `withAuth` helper automatically handles authentication and returns 401 if the user is not authenticated.

## Base URL
All routes are prefixed with `/api`

## User Routes

### Profile
- `GET /api/user/profile` - Get current user's profile
- `POST /api/user/profile` - Create user profile
- `PATCH /api/user/profile` - Update user profile

### Goals
- `GET /api/user/goals` - Get all user goals
- `POST /api/user/goals` - Create a new goal
- `GET /api/user/goals/[id]` - Get a specific goal
- `PATCH /api/user/goals/[id]` - Update a goal
- `DELETE /api/user/goals/[id]` - Delete a goal

### Stats
- `GET /api/user/stats` - Get all user stats (or latest if `?latest=true`)
- `POST /api/user/stats` - Create a new stats entry
- `GET /api/user/stats/[id]` - Get a specific stats entry
- `DELETE /api/user/stats/[id]` - Delete a stats entry

### Images
- `GET /api/user/images` - Get all user images (or latest if `?latest=true`)
- `POST /api/user/images` - Create a new image entry
- `GET /api/user/images/[id]` - Get a specific image
- `DELETE /api/user/images/[id]` - Delete an image

## Train Routes (To Be Implemented)

### Protocols
- `GET /api/train/protocols` - Get all protocols
- `POST /api/train/protocols` - Create a protocol
- `GET /api/train/protocols/[id]` - Get a specific protocol
- `PATCH /api/train/protocols/[id]` - Update a protocol
- `DELETE /api/train/protocols/[id]` - Delete a protocol

### Workouts
- `GET /api/train/workouts` - Get user's workouts
- `POST /api/train/workouts` - Create a workout
- `GET /api/train/workouts/[id]` - Get a specific workout
- `PATCH /api/train/workouts/[id]` - Update a workout
- `DELETE /api/train/workouts/[id]` - Delete a workout

### Exercises
- `GET /api/train/exercises` - Get all exercises (public)
- `POST /api/train/exercises` - Create an exercise
- `GET /api/train/exercises/[id]` - Get a specific exercise
- `PATCH /api/train/exercises/[id]` - Update an exercise

### Workout Instances
- `GET /api/train/workout-instances` - Get user's workout instances
- `POST /api/train/workout-instances` - Create a workout instance
- `GET /api/train/workout-instances/[id]` - Get a specific workout instance
- `PATCH /api/train/workout-instances/[id]` - Update a workout instance
- `DELETE /api/train/workout-instances/[id]` - Delete a workout instance

### Performance
- `GET /api/train/performance` - Get user's performance log
- `POST /api/train/performance` - Create a performance entry

### Projected 1RM
- `GET /api/train/projected-1rm` - Get user's projected 1RM log
- `POST /api/train/projected-1rm` - Create a projected 1RM entry

## Fuel Routes ✅

### Meal Plans
- `GET /api/fuel/meal-plans` - Get user's meal plans
- `POST /api/fuel/meal-plans` - Create a meal plan
- `GET /api/fuel/meal-plans/[id]` - Get a specific meal plan
- `PATCH /api/fuel/meal-plans/[id]` - Update a meal plan
- `DELETE /api/fuel/meal-plans/[id]` - Delete a meal plan

### Foods
- `GET /api/fuel/foods` - Get all foods (public)
- `POST /api/fuel/foods` - Create a food
- `GET /api/fuel/foods/[id]` - Get a specific food
- `PATCH /api/fuel/foods/[id]` - Update a food

### Meal Instances
- `GET /api/fuel/meal-instances` - Get user's meal instances
- `POST /api/fuel/meal-instances` - Create a meal instance
- `GET /api/fuel/meal-instances/[id]` - Get a specific meal instance
- `PATCH /api/fuel/meal-instances/[id]` - Update a meal instance
- `DELETE /api/fuel/meal-instances/[id]` - Delete a meal instance

### Water Intake
- `GET /api/fuel/water-intake` - Get user's water intake log
- `POST /api/fuel/water-intake` - Create a water intake entry

### Sleep
- `GET /api/fuel/sleep` - Get user's sleep log
- `POST /api/fuel/sleep` - Create a sleep instance
- `PATCH /api/fuel/sleep/[id]` - Update a sleep instance
- `DELETE /api/fuel/sleep/[id]` - Delete a sleep instance

## Response Format

All successful responses return JSON:
```json
{
  "data": { ... }
}
```

Error responses:
```json
{
  "error": "Error message"
}
```

## Authentication

All routes (except public read routes like exercises and foods) require authentication. The `withAuth` helper:
1. Checks for valid Supabase session
2. Extracts user ID
3. Passes user ID to handler
4. Returns 401 if unauthorized

## CASCADE Deletes

The following deletions automatically cascade:
- Deleting a `workout_instance` → deletes all `workout_block_instance` records
- Deleting a `workout_block_instance` → deletes all `workout_block_exercise_instance` records
- Deleting a `meal_instance` → deletes all `portioned_food_instance` records
- Deleting a `protocol_instance` → deletes all `workout_instance` records
- Deleting a `meal_plan_instance` → deletes all `meal_instance` records

