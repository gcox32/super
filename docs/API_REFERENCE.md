# API Reference

Complete reference for all API endpoints in the application.

## Base URL

All API routes are prefixed with `/api`

## Authentication

Most endpoints require authentication via Supabase. The `withAuth` helper automatically:
- Validates the user's session
- Extracts the user ID
- Returns `401 Unauthorized` if authentication fails

**Public Endpoints** (no authentication required):
- `GET /api/train/protocols`
- `GET /api/train/exercises`
- `GET /api/fuel/foods`
- `GET /api/fuel/recipes`
- `GET /api/fuel/supplements`
- `GET /api/fuel/recipes/[id]/ingredients`

## Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## User Endpoints

### Profile

#### `GET /api/user/profile`
Get current user's profile.

**Authentication:** Required

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "gender": "male" | "female" | "other",
    "birthDate": "YYYY-MM-DD",
    "dailyWaterRecommendation": "LiquidMeasurement",
    "activityLevel": "sedentary" | "lightly-active" | "moderately-active" | "very-active" | "extremely-active"
  }
}
```

#### `PUT /api/user/profile`
Create or update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "gender": "male" | "female" | "other",
  "birthDate": "YYYY-MM-DD",
  "dailyWaterRecommendation": "LiquidMeasurement",
  "activityLevel": "sedentary" | "lightly-active" | "moderately-active" | "very-active" | "extremely-active"
}
```

### Goals

#### `GET /api/user/goals`
Get all user goals.

**Authentication:** Required

**Response:**
```json
{
  "goals": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "string",
      "description": "string",
      "type": "weight" | "strength" | "endurance" | "body-composition" | "other",
      "targetValue": "number",
      "currentValue": "number",
      "unit": "string",
      "duration": "number",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "complete": "boolean",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/user/goals`
Create a new goal.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "type": "weight" | "strength" | "endurance" | "body-composition" | "other",
  "targetValue": "number",
  "currentValue": "number",
  "unit": "string",
  "duration": "number",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "complete": "boolean",
  "notes": "string"
}
```

#### `GET /api/user/goals/[id]`
Get a specific goal.

**Authentication:** Required

#### `PATCH /api/user/goals/[id]`
Update a goal.

**Authentication:** Required

**Request Body:** Partial goal object

#### `DELETE /api/user/goals/[id]`
Delete a goal.

**Authentication:** Required

### Stats

#### `GET /api/user/stats`
Get all user stats or latest stats.

**Authentication:** Required

**Query Parameters:**
- `latest` (boolean): If true, returns only the latest stats entry

**Response:**
```json
{
  "stats": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "YYYY-MM-DD",
      "weight": "WeightMeasurement",
      "bodyFatPercentage": "PercentageMeasurement",
      "muscleMass": "WeightMeasurement",
      "tapeMeasurements": {
        "neck": "DistanceMeasurement",
        "shoulders": "DistanceMeasurement",
        "chest": "DistanceMeasurement",
        "waist": "DistanceMeasurement",
        "hips": "DistanceMeasurement",
        "leftArm": "DistanceMeasurement",
        "rightArm": "DistanceMeasurement",
        "leftLeg": "DistanceMeasurement",
        "rightLeg": "DistanceMeasurement",
        "leftForearm": "DistanceMeasurement",
        "rightForearm": "DistanceMeasurement",
        "leftCalf": "DistanceMeasurement",
        "rightCalf": "DistanceMeasurement"
      }
    }
  ]
}
```

#### `POST /api/user/stats`
Create a new stats entry.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "YYYY-MM-DD",
  "weight": "WeightMeasurement",
  "bodyFatPercentage": "PercentageMeasurement",
  "muscleMass": "WeightMeasurement",
  "tapeMeasurements": { ... }
}
```

#### `GET /api/user/stats/[id]`
Get a specific stats entry.

**Authentication:** Required

#### `PUT /api/user/stats/[id]`
Update a stats entry.

**Authentication:** Required

#### `DELETE /api/user/stats/[id]`
Delete a stats entry.

**Authentication:** Required

### Images

#### `GET /api/user/images`
Get all user images or latest image.

**Authentication:** Required

**Query Parameters:**
- `latest` (boolean): If true, returns only the latest image

**Response:**
```json
{
  "images": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "YYYY-MM-DD",
      "imageUrl": "string",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/user/images`
Create a new image entry.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "YYYY-MM-DD",
  "imageUrl": "string",
  "notes": "string"
}
```

#### `GET /api/user/images/[id]`
Get a specific image.

**Authentication:** Required

#### `PUT /api/user/images/[id]`
Update an image entry.

**Authentication:** Required

#### `DELETE /api/user/images/[id]`
Delete an image entry.

**Authentication:** Required

## Train Endpoints

### Protocols

#### `GET /api/train/protocols`
Get all protocols (public).

**Authentication:** Not required

**Response:**
```json
{
  "protocols": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "duration": "LongTimeMeasurement",
      "workouts": []
    }
  ]
}
```

#### `POST /api/train/protocols`
Create a protocol.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "duration": "LongTimeMeasurement"
}
```

#### `GET /api/train/protocols/[id]`
Get a specific protocol.

**Authentication:** Not required

#### `PATCH /api/train/protocols/[id]`
Update a protocol.

**Authentication:** Required

#### `DELETE /api/train/protocols/[id]`
Delete a protocol.

**Authentication:** Required

### Protocol Instances

#### `GET /api/train/protocol-instances`
Get user's protocol instances.

**Authentication:** Required

**Query Parameters:**
- `protocolId` (string): Filter by protocol ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "instances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "protocolId": "uuid",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "complete": "boolean",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/protocol-instances`
Create a protocol instance.

**Authentication:** Required

**Request Body:**
```json
{
  "protocolId": "uuid",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "complete": "boolean",
  "notes": "string"
}
```

#### `GET /api/train/protocol-instances/[id]`
Get a specific protocol instance.

**Authentication:** Required

#### `PATCH /api/train/protocol-instances/[id]`
Update a protocol instance.

**Authentication:** Required

#### `DELETE /api/train/protocol-instances/[id]`
Delete a protocol instance (CASCADE deletes workout instances).

**Authentication:** Required

### Workouts

#### `GET /api/train/workouts`
Get user's workouts.

**Authentication:** Required

**Response:**
```json
{
  "workouts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "protocolId": "uuid",
      "name": "string",
      "description": "string",
      "workoutType": "strength" | "hypertrophy" | "endurance" | "power" | "skill" | "other",
      "order": "number",
      "blocks": []
    }
  ]
}
```

#### `POST /api/train/workouts`
Create a workout.

**Authentication:** Required

**Request Body:**
```json
{
  "protocolId": "uuid",
  "name": "string",
  "description": "string",
  "workoutType": "strength" | "hypertrophy" | "endurance" | "power" | "skill" | "other",
  "order": "number"
}
```

#### `GET /api/train/workouts/[id]`
Get a specific workout.

**Authentication:** Required

#### `PATCH /api/train/workouts/[id]`
Update a workout.

**Authentication:** Required

#### `DELETE /api/train/workouts/[id]`
Delete a workout (CASCADE deletes blocks and exercises).

**Authentication:** Required

### Workout Blocks

#### `GET /api/train/workouts/[id]/blocks`
Get all blocks for a workout.

**Authentication:** Required

**Response:**
```json
{
  "blocks": [
    {
      "id": "uuid",
      "workoutId": "uuid",
      "workoutBlockType": "warm-up" | "prep" | "main" | "accessory" | "finisher" | "cooldown" | "other",
      "name": "string",
      "description": "string",
      "order": "number",
      "circuit": "boolean",
      "estimatedDuration": "TimeMeasurement",
      "exercises": []
    }
  ]
}
```

#### `POST /api/train/workouts/[id]/blocks`
Create a new block.

**Authentication:** Required

**Request Body:**
```json
{
  "workoutBlockType": "warm-up" | "prep" | "main" | "accessory" | "finisher" | "cooldown" | "other",
  "name": "string",
  "description": "string",
  "order": "number",
  "circuit": "boolean",
  "estimatedDuration": "TimeMeasurement"
}
```

#### `GET /api/train/workouts/[id]/blocks/[blockId]`
Get a specific block.

**Authentication:** Required

#### `PATCH /api/train/workouts/[id]/blocks/[blockId]`
Update a block.

**Authentication:** Required

#### `DELETE /api/train/workouts/[id]/blocks/[blockId]`
Delete a block (CASCADE deletes exercises).

**Authentication:** Required

### Workout Block Exercises

#### `GET /api/train/workouts/[id]/blocks/[blockId]/exercises`
Get all exercises for a block.

**Authentication:** Required

**Response:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "workoutBlockId": "uuid",
      "exercise": {
        "id": "uuid",
        "name": "string",
        ...
      },
      "order": "number",
      "sets": "number",
      "measures": "ExerciseMeasures",
      "tempo": "string",
      "restTime": "RestTimer",
      "rpe": "RPE",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/workouts/[id]/blocks/[blockId]/exercises`
Add an exercise to a block.

**Authentication:** Required

**Request Body:**
```json
{
  "exercise": "uuid", // exercise ID
  "order": "number",
  "sets": "number",
  "measures": "ExerciseMeasures",
  "tempo": "string",
  "restTime": "RestTimer",
  "rpe": "RPE",
  "notes": "string"
}
```

#### `PATCH /api/train/workouts/[id]/blocks/[blockId]/exercises/[exerciseId]`
Update an exercise in a block.

**Authentication:** Required

#### `DELETE /api/train/workouts/[id]/blocks/[blockId]/exercises/[exerciseId]`
Remove an exercise from a block.

**Authentication:** Required

### Exercises

#### `GET /api/train/exercises`
Get all exercises or search exercises.

**Authentication:** Not required

**Query Parameters:**
- `q` (string): Search query

**Response:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "muscleGroups": {
        "primary": "uuid",
        "secondary": "uuid",
        "tertiary": "uuid"
      },
      "movementPattern": "upper push" | "upper pull" | "squat" | "hinge" | "lunge" | "hip thrust" | "isometric" | "locomotion" | "hip flexion" | "plyometric" | "other",
      "equipment": "barbell" | "dumbbell" | "kettlebell" | "machine" | "bodyweight" | "other",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "measures": "ExerciseMeasures",
      "imageUrl": "string",
      "videoUrl": "string"
    }
  ]
}
```

#### `POST /api/train/exercises`
Create an exercise.

**Authentication:** Required

**Request Body:** Exercise object (without id, createdAt, updatedAt)

#### `GET /api/train/exercises/[id]`
Get a specific exercise.

**Authentication:** Not required

#### `PATCH /api/train/exercises/[id]`
Update an exercise.

**Authentication:** Required

### Workout Instances

#### `GET /api/train/workout-instances`
Get user's workout instances.

**Authentication:** Required

**Query Parameters:**
- `workoutId` (string): Filter by workout ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "workoutInstances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "workoutId": "uuid",
      "protocolInstanceId": "uuid",
      "date": "YYYY-MM-DD",
      "complete": "boolean",
      "duration": "TimeMeasurement",
      "volume": "WorkMeasurement",
      "averagePower": "PowerMeasurement",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/workout-instances`
Create a workout instance.

**Authentication:** Required

**Request Body:**
```json
{
  "workoutId": "uuid",
  "protocolInstanceId": "uuid",
  "date": "YYYY-MM-DD",
  "complete": "boolean",
  "duration": "TimeMeasurement",
  "volume": "WorkMeasurement",
  "averagePower": "PowerMeasurement",
  "notes": "string"
}
```

#### `GET /api/train/workout-instances/[id]`
Get a specific workout instance.

**Authentication:** Required

#### `PATCH /api/train/workout-instances/[id]`
Update a workout instance.

**Authentication:** Required

#### `DELETE /api/train/workout-instances/[id]`
Delete a workout instance (CASCADE deletes block instances).

**Authentication:** Required

### Workout Block Instances

#### `GET /api/train/workout-block-instances`
Get user's workout block instances.

**Authentication:** Required

**Query Parameters:**
- `workoutInstanceId` (string): Filter by workout instance ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "instances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "workoutInstanceId": "uuid",
      "workoutBlockId": "uuid",
      "date": "YYYY-MM-DD",
      "complete": "boolean",
      "duration": "TimeMeasurement",
      "volume": "WorkMeasurement",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/workout-block-instances`
Create a workout block instance.

**Authentication:** Required

**Request Body:**
```json
{
  "workoutInstanceId": "uuid",
  "workoutBlockId": "uuid",
  "date": "YYYY-MM-DD",
  "complete": "boolean",
  "duration": "TimeMeasurement",
  "volume": "WorkMeasurement",
  "notes": "string"
}
```

#### `GET /api/train/workout-block-instances/[id]`
Get a specific workout block instance.

**Authentication:** Required

#### `PATCH /api/train/workout-block-instances/[id]`
Update a workout block instance.

**Authentication:** Required

#### `DELETE /api/train/workout-block-instances/[id]`
Delete a workout block instance (CASCADE deletes exercise instances).

**Authentication:** Required

### Performance

#### `GET /api/train/performance`
Get user's performance log.

**Authentication:** Required

**Response:**
```json
{
  "performance": [
    {
      "id": "uuid",
      "userId": "uuid",
      "workoutInstanceId": "uuid",
      "date": "YYYY-MM-DD",
      "averagePower": "PowerMeasurement",
      "totalVolume": "WorkMeasurement",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/performance`
Create a performance entry.

**Authentication:** Required

**Request Body:**
```json
{
  "workoutInstanceId": "uuid",
  "date": "YYYY-MM-DD",
  "averagePower": "PowerMeasurement",
  "totalVolume": "WorkMeasurement",
  "notes": "string"
}
```

### Projected 1RM

#### `GET /api/train/projected-1rm`
Get user's projected 1RM log.

**Authentication:** Required

**Query Parameters:**
- `exerciseId` (string): Filter by exercise ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "projected1RM": [
    {
      "id": "uuid",
      "userId": "uuid",
      "exerciseId": "uuid",
      "date": "YYYY-MM-DD",
      "projected1RM": "WeightMeasurement",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/train/projected-1rm`
Create a projected 1RM entry.

**Authentication:** Required

**Request Body:**
```json
{
  "exerciseId": "uuid",
  "date": "YYYY-MM-DD",
  "projected1RM": "WeightMeasurement",
  "notes": "string"
}
```

## Fuel Endpoints

### Meal Plans

#### `GET /api/fuel/meal-plans`
Get user's meal plans.

**Authentication:** Required

**Response:**
```json
{
  "mealPlans": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "string",
      "description": "string",
      "meals": []
    }
  ]
}
```

#### `POST /api/fuel/meal-plans`
Create a meal plan.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

#### `GET /api/fuel/meal-plans/[id]`
Get a specific meal plan.

**Authentication:** Required

#### `PATCH /api/fuel/meal-plans/[id]`
Update a meal plan.

**Authentication:** Required

#### `DELETE /api/fuel/meal-plans/[id]`
Delete a meal plan (CASCADE deletes meals).

**Authentication:** Required

### Meals

#### `GET /api/fuel/meals/[id]/portions`
Get all portions for a meal.

**Authentication:** Required

**Response:**
```json
{
  "portions": [
    {
      "portionedFoodId": "uuid",
      "order": "number",
      "portionedFood": {
        "id": "uuid",
        "food": "uuid",
        "calories": "number",
        "macros": "Macros",
        "micros": "Micros",
        "portionSize": "PortionMeasurement"
      }
    }
  ]
}
```

#### `POST /api/fuel/meals/[id]/portions`
Add a portioned food to a meal.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid",
  "order": "number"
}
```

#### `DELETE /api/fuel/meals/[id]/portions`
Remove a portioned food from a meal.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid"
}
```

### Meal Plan Instances

#### `GET /api/fuel/meal-plan-instances`
Get user's meal plan instances.

**Authentication:** Required

**Response:**
```json
{
  "mealPlanInstances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "mealPlanId": "uuid",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "complete": "boolean",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/fuel/meal-plan-instances`
Create a meal plan instance.

**Authentication:** Required

**Request Body:**
```json
{
  "mealPlanId": "uuid",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "complete": "boolean",
  "notes": "string"
}
```

#### `GET /api/fuel/meal-plan-instances/[id]`
Get a specific meal plan instance.

**Authentication:** Required

#### `PATCH /api/fuel/meal-plan-instances/[id]`
Update a meal plan instance.

**Authentication:** Required

#### `DELETE /api/fuel/meal-plan-instances/[id]`
Delete a meal plan instance (CASCADE deletes meal instances).

**Authentication:** Required

### Meal Instances

#### `GET /api/fuel/meal-instances`
Get user's meal instances.

**Authentication:** Required

**Query Parameters:**
- `mealPlanInstanceId` (string): Filter by meal plan instance ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "mealInstances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "mealInstanceId": "uuid",
      "mealId": "uuid",
      "date": "YYYY-MM-DD",
      "complete": "boolean",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/fuel/meal-instances`
Create a meal instance.

**Authentication:** Required

**Request Body:**
```json
{
  "mealPlanInstanceId": "uuid",
  "mealId": "uuid",
  "date": "YYYY-MM-DD",
  "complete": "boolean",
  "notes": "string"
}
```

#### `GET /api/fuel/meal-instances/[id]`
Get a specific meal instance.

**Authentication:** Required

#### `PATCH /api/fuel/meal-instances/[id]`
Update a meal instance.

**Authentication:** Required

#### `DELETE /api/fuel/meal-instances/[id]`
Delete a meal instance (CASCADE deletes portioned food instances).

**Authentication:** Required

### Foods

#### `GET /api/fuel/foods`
Get all foods or search foods.

**Authentication:** Not required

**Query Parameters:**
- `q` (string): Search query

**Response:**
```json
{
  "foods": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "imageUrl": "string"
    }
  ]
}
```

#### `POST /api/fuel/foods`
Create a food.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string"
}
```

#### `GET /api/fuel/foods/[id]`
Get a specific food.

**Authentication:** Not required

#### `PATCH /api/fuel/foods/[id]`
Update a food.

**Authentication:** Required

### Recipes

#### `GET /api/fuel/recipes`
Get all recipes (public).

**Authentication:** Not required

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "string",
      "text": "string",
      "imageUrl": "string",
      "macros": "Macros",
      "micros": "Micros",
      "calories": "CaloriesMeasurement",
      "ingredients": []
    }
  ]
}
```

#### `POST /api/fuel/recipes`
Create a recipe.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "text": "string",
  "imageUrl": "string",
  "macros": "Macros",
  "micros": "Micros",
  "calories": "CaloriesMeasurement"
}
```

#### `GET /api/fuel/recipes/[id]`
Get a specific recipe.

**Authentication:** Not required

#### `PATCH /api/fuel/recipes/[id]`
Update a recipe.

**Authentication:** Required

#### `DELETE /api/fuel/recipes/[id]`
Delete a recipe.

**Authentication:** Required

### Recipe Ingredients

#### `GET /api/fuel/recipes/[id]/ingredients`
Get all ingredients for a recipe (public).

**Authentication:** Not required

**Response:**
```json
{
  "ingredients": [
    {
      "portionedFoodId": "uuid",
      "order": "number",
      "portionedFood": {
        "id": "uuid",
        "food": "uuid",
        "calories": "number",
        "macros": "Macros",
        "micros": "Micros",
        "portionSize": "PortionMeasurement"
      }
    }
  ]
}
```

#### `POST /api/fuel/recipes/[id]/ingredients`
Add an ingredient to a recipe.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid",
  "order": "number"
}
```

#### `DELETE /api/fuel/recipes/[id]/ingredients`
Remove an ingredient from a recipe.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid"
}
```

### Grocery Lists

#### `GET /api/fuel/grocery-lists`
Get user's grocery lists.

**Authentication:** Required

**Response:**
```json
{
  "groceryLists": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "string",
      "description": "string",
      "foods": []
    }
  ]
}
```

#### `POST /api/fuel/grocery-lists`
Create a grocery list.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

#### `GET /api/fuel/grocery-lists/[id]`
Get a specific grocery list.

**Authentication:** Required

#### `PATCH /api/fuel/grocery-lists/[id]`
Update a grocery list.

**Authentication:** Required

#### `DELETE /api/fuel/grocery-lists/[id]`
Delete a grocery list (CASCADE deletes items).

**Authentication:** Required

### Grocery List Items

#### `GET /api/fuel/grocery-lists/[id]/items`
Get all items for a grocery list.

**Authentication:** Required

**Response:**
```json
{
  "items": [
    {
      "portionedFoodId": "uuid",
      "order": "number",
      "portionedFood": {
        "id": "uuid",
        "food": "uuid",
        "calories": "number",
        "macros": "Macros",
        "micros": "Micros",
        "portionSize": "PortionMeasurement"
      }
    }
  ]
}
```

#### `POST /api/fuel/grocery-lists/[id]/items`
Add an item to a grocery list.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid",
  "order": "number"
}
```

#### `DELETE /api/fuel/grocery-lists/[id]/items`
Remove an item from a grocery list.

**Authentication:** Required

**Request Body:**
```json
{
  "portionedFoodId": "uuid"
}
```

### Supplements

#### `GET /api/fuel/supplements`
Get all supplements (public).

**Authentication:** Not required

**Response:**
```json
{
  "supplements": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "dosage": "DosageMeasurement",
      "imageUrl": "string"
    }
  ]
}
```

#### `POST /api/fuel/supplements`
Create a supplement.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "dosage": "DosageMeasurement",
  "imageUrl": "string"
}
```

### Supplement Schedules

#### `GET /api/fuel/supplement-schedules`
Get user's supplement schedules.

**Authentication:** Required

**Response:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "userId": "uuid",
      "supplementId": "uuid",
      "scheduleType": "hourly" | "twice-daily" | "every-other-day" | "daily" | "weekly" | "bi-weekly" | "monthly" | "once" | "other",
      "description": "string",
      "supplements": []
    }
  ]
}
```

#### `POST /api/fuel/supplement-schedules`
Create a supplement schedule.

**Authentication:** Required

**Request Body:**
```json
{
  "supplementId": "uuid",
  "scheduleType": "hourly" | "twice-daily" | "every-other-day" | "daily" | "weekly" | "bi-weekly" | "monthly" | "once" | "other",
  "description": "string"
}
```

### Supplement Instances

#### `GET /api/fuel/supplement-instances`
Get user's supplement instances.

**Authentication:** Required

**Query Parameters:**
- `supplementScheduleId` (string): Filter by supplement schedule ID
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "instances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "supplementScheduleId": "uuid",
      "supplementId": "uuid",
      "dosage": "DosageMeasurement",
      "date": "YYYY-MM-DD",
      "complete": "boolean",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/fuel/supplement-instances`
Create a supplement instance.

**Authentication:** Required

**Request Body:**
```json
{
  "supplementScheduleId": "uuid",
  "supplementId": "uuid",
  "dosage": "DosageMeasurement",
  "date": "YYYY-MM-DD",
  "complete": "boolean",
  "notes": "string"
}
```

#### `PATCH /api/fuel/supplement-instances/[id]`
Update a supplement instance.

**Authentication:** Required

#### `DELETE /api/fuel/supplement-instances/[id]`
Delete a supplement instance.

**Authentication:** Required

### Water Intake

#### `GET /api/fuel/water-intake`
Get user's water intake log.

**Authentication:** Required

**Query Parameters:**
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "waterIntakes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "YYYY-MM-DD",
      "timestamp": "ISO timestamp",
      "amount": "LiquidMeasurement",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/fuel/water-intake`
Create a water intake entry.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "YYYY-MM-DD",
  "timestamp": "ISO timestamp",
  "amount": "LiquidMeasurement",
  "notes": "string"
}
```

#### `PATCH /api/fuel/water-intake/[id]`
Update a water intake entry.

**Authentication:** Required

#### `DELETE /api/fuel/water-intake/[id]`
Delete a water intake entry.

**Authentication:** Required

### Sleep

#### `GET /api/fuel/sleep`
Get user's sleep log.

**Authentication:** Required

**Query Parameters:**
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

**Response:**
```json
{
  "sleepInstances": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "YYYY-MM-DD",
      "sleepScore": "number",
      "duration": "LongTimeMeasurement",
      "bedtime": "ISO timestamp",
      "wakeTime": "ISO timestamp",
      "notes": "string"
    }
  ]
}
```

#### `POST /api/fuel/sleep`
Create a sleep instance.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "YYYY-MM-DD",
  "sleepScore": "number",
  "duration": "LongTimeMeasurement",
  "bedtime": "ISO timestamp",
  "wakeTime": "ISO timestamp",
  "notes": "string"
}
```

#### `GET /api/fuel/sleep/[id]`
Get a specific sleep instance.

**Authentication:** Required

#### `PATCH /api/fuel/sleep/[id]`
Update a sleep instance.

**Authentication:** Required

#### `DELETE /api/fuel/sleep/[id]`
Delete a sleep instance.

**Authentication:** Required

## Authentication Endpoints

### Login

#### `POST /api/auth/login`
Login endpoint (handled by Supabase).

**Authentication:** Not required

### Logout

#### `POST /api/auth/logout`
Logout endpoint (handled by Supabase).

**Authentication:** Required

## CASCADE Delete Behavior

The following deletions automatically cascade:

- **Protocol Instance** → deletes all **Workout Instances**
- **Workout Instance** → deletes all **Workout Block Instances**
- **Workout Block Instance** → deletes all **Workout Block Exercise Instances**
- **Meal Plan Instance** → deletes all **Meal Instances**
- **Meal Instance** → deletes all **Portioned Food Instances**
- **Workout** → deletes all **Workout Blocks** and **Workout Block Exercises**
- **Workout Block** → deletes all **Workout Block Exercises**
- **Meal Plan** → deletes all **Meals**
- **Grocery List** → deletes all **Grocery List Items**

## Error Codes

- `401 Unauthorized` - Authentication required or invalid
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

- All date fields use ISO 8601 format (`YYYY-MM-DD` for dates, full ISO timestamp for timestamps)
- All UUIDs are in standard UUID v4 format
- Measurement types (WeightMeasurement, TimeMeasurement, etc.) are JSONB objects - see type definitions in `src/types/measures.ts`
- Hydrated fields (e.g., `workouts` in Protocol, `blocks` in Workout) are returned as empty arrays and should be loaded separately via nested endpoints
- Query parameters for date filtering accept ISO date strings

