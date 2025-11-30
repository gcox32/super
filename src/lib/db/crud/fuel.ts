import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../index';
import {
  mealPlan,
  meal,
  food,
  portionedFood,
  mealPortion,
  recipe,
  mealRecipe,
  recipeIngredient,
  groceryList,
  groceryListItem,
  mealPlanInstance,
  mealInstance,
  portionedFoodInstance,
  supplement,
  supplementSchedule,
  supplementInstance,
  waterIntakeLog,
  waterIntake,
  sleepLog,
  sleepInstance,
} from '../schema';
import type {
  MealPlan,
  Meal,
  Food,
  PortionedFood,
  Recipe,
  GroceryList,
  MealPlanInstance,
  MealInstance,
  PortionedFoodInstance,
  Supplement,
  SupplementSchedule,
  SupplementInstance,
  WaterIntake,
  SleepInstance,
} from '@/types/fuel';

// ============================================================================
// MEAL PLAN CRUD
// ============================================================================

export async function createMealPlan(
  userId: string,
  mealPlanData: Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'meals'>
): Promise<MealPlan> {
  const [newMealPlan] = await db
    .insert(mealPlan)
    .values({
      userId,
      name: mealPlanData.name,
      description: mealPlanData.description,
    })
    .returning();

  return newMealPlan as MealPlan;
}

export async function getUserMealPlans(userId: string): Promise<MealPlan[]> {
  return await db
    .select()
    .from(mealPlan)
    .where(eq(mealPlan.userId, userId))
    .orderBy(desc(mealPlan.createdAt));
}

export async function getMealPlanById(
  mealPlanId: string,
  userId: string
): Promise<MealPlan | null> {
  const [found] = await db
    .select()
    .from(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .limit(1);

  return (found as MealPlan) || null;
}

export async function updateMealPlan(
  mealPlanId: string,
  userId: string,
  updates: Partial<Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'meals'>>
): Promise<MealPlan | null> {
  const [updated] = await db
    .update(mealPlan)
    .set(updates)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .returning();

  return (updated as MealPlan) || null;
}

export async function deleteMealPlan(mealPlanId: string, userId: string): Promise<boolean> {
  // CASCADE will handle meals
  const result = await db
    .delete(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// MEAL CRUD
// ============================================================================

export async function createMeal(
  mealPlanId: string,
  mealData: Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>
): Promise<Meal> {
  const [newMeal] = await db
    .insert(meal)
    .values({
      mealPlanId,
      name: mealData.name,
      description: mealData.description,
    })
    .returning();

  return newMeal as Meal;
}

export async function getMeals(mealPlanId: string): Promise<Meal[]> {
  return await db
    .select()
    .from(meal)
    .where(eq(meal.mealPlanId, mealPlanId))
    .orderBy(desc(meal.createdAt));
}

export async function getMealById(mealId: string): Promise<Meal | null> {
  const [found] = await db
    .select()
    .from(meal)
    .where(eq(meal.id, mealId))
    .limit(1);

  return (found as Meal) || null;
}

export async function updateMeal(
  mealId: string,
  updates: Partial<Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>>
): Promise<Meal | null> {
  const [updated] = await db
    .update(meal)
    .set(updates)
    .where(eq(meal.id, mealId))
    .returning();

  return (updated as Meal) || null;
}

export async function deleteMeal(mealId: string): Promise<boolean> {
  // CASCADE will handle meal_portions, meal_recipes
  const result = await db.delete(meal).where(eq(meal.id, mealId));
  return result.rowCount !== null && result.rowCount > 0;
}

// Add portioned food to meal
export async function addPortionedFoodToMeal(
  mealId: string,
  portionedFoodId: string,
  order: number
): Promise<void> {
  await db.insert(mealPortion).values({
    mealId,
    portionedFoodId,
    order,
  });
}

export async function removePortionedFoodFromMeal(
  mealId: string,
  portionedFoodId: string
): Promise<void> {
  await db
    .delete(mealPortion)
    .where(
      and(
        eq(mealPortion.mealId, mealId),
        eq(mealPortion.portionedFoodId, portionedFoodId)
      )
    );
}

// ============================================================================
// FOOD CRUD
// ============================================================================

export async function createFood(
  foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Food> {
  const [newFood] = await db
    .insert(food)
    .values({
      name: foodData.name,
      description: foodData.description,
      imageUrl: foodData.imageUrl,
    })
    .returning();

  return newFood as Food;
}

export async function getFoods(): Promise<Food[]> {
  return await db.select().from(food).orderBy(food.name);
}

export async function getFoodById(foodId: string): Promise<Food | null> {
  const [found] = await db.select().from(food).where(eq(food.id, foodId)).limit(1);

  return (found as Food) || null;
}

export async function searchFoods(query: string): Promise<Food[]> {
  return await db
    .select()
    .from(food)
    .where(eq(food.name, query))
    .orderBy(food.name);
}

export async function updateFood(
  foodId: string,
  updates: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Food | null> {
  const [updated] = await db
    .update(food)
    .set(updates)
    .where(eq(food.id, foodId))
    .returning();

  return (updated as Food) || null;
}

// ============================================================================
// PORTIONED FOOD CRUD
// ============================================================================

export async function createPortionedFood(
  portionedFoodData: Omit<PortionedFood, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PortionedFood> {
  const [newPortionedFood] = await db
    .insert(portionedFood)
    .values({
      foodId: portionedFoodData.food,
      calories: portionedFoodData.calories,
      macros: portionedFoodData.macros,
      micros: portionedFoodData.micros,
      portionSize: portionedFoodData.portionSize,
    })
    .returning();

  return {
    ...(newPortionedFood as PortionedFood),
    food: portionedFoodData.food,
  };
}

export async function getPortionedFoodById(portionedFoodId: string): Promise<PortionedFood | null> {
  const [found] = await db
    .select()
    .from(portionedFood)
    .where(eq(portionedFood.id, portionedFoodId))
    .limit(1);

  if (!found) return null;

  const [foodData] = await db
    .select()
    .from(food)
    .where(eq(food.id, found.foodId))
    .limit(1);

  return {
    ...(found as PortionedFood),
    food: found.foodId,
  };
}

export async function updatePortionedFood(
  portionedFoodId: string,
  updates: Partial<Omit<PortionedFood, 'id' | 'food' | 'createdAt' | 'updatedAt'>>
): Promise<PortionedFood | null> {
  const [updated] = await db
    .update(portionedFood)
    .set(updates)
    .where(eq(portionedFood.id, portionedFoodId))
    .returning();

  if (!updated) return null;

  return {
    ...(updated as PortionedFood),
    food: updated.foodId,
  };
}

// ============================================================================
// RECIPE CRUD
// ============================================================================

export async function createRecipe(
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>
): Promise<Recipe> {
  const [newRecipe] = await db
    .insert(recipe)
    .values({
      name: recipeData.name,
      text: recipeData.text,
      imageUrl: recipeData.imageUrl,
      macros: recipeData.macros,
      micros: recipeData.micros,
      calories: recipeData.calories,
    })
    .returning();

  return newRecipe as Recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  return await db.select().from(recipe).orderBy(recipe.name);
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const [found] = await db.select().from(recipe).where(eq(recipe.id, recipeId)).limit(1);

  return (found as Recipe) || null;
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>>
): Promise<Recipe | null> {
  const [updated] = await db
    .update(recipe)
    .set(updates)
    .where(eq(recipe.id, recipeId))
    .returning();

  return (updated as Recipe) || null;
}

export async function addIngredientToRecipe(
  recipeId: string,
  portionedFoodId: string,
  order: number
): Promise<void> {
  await db.insert(recipeIngredient).values({
    recipeId,
    portionedFoodId,
    order,
  });
}

// ============================================================================
// GROCERY LIST CRUD
// ============================================================================

export async function createGroceryList(
  userId: string,
  groceryListData: Omit<GroceryList, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'foods'>
): Promise<GroceryList> {
  const [newList] = await db
    .insert(groceryList)
    .values({
      userId,
      name: groceryListData.name,
      description: groceryListData.description,
    })
    .returning();

  return newList as GroceryList;
}

export async function getUserGroceryLists(userId: string): Promise<GroceryList[]> {
  return await db
    .select()
    .from(groceryList)
    .where(eq(groceryList.userId, userId))
    .orderBy(desc(groceryList.createdAt));
}

export async function getGroceryListById(
  listId: string,
  userId: string
): Promise<GroceryList | null> {
  const [found] = await db
    .select()
    .from(groceryList)
    .where(and(eq(groceryList.id, listId), eq(groceryList.userId, userId)))
    .limit(1);

  return (found as GroceryList) || null;
}

export async function addPortionedFoodToGroceryList(
  listId: string,
  portionedFoodId: string,
  order: number
): Promise<void> {
  await db.insert(groceryListItem).values({
    groceryListId: listId,
    portionedFoodId,
    order,
  });
}

export async function deleteGroceryList(listId: string, userId: string): Promise<boolean> {
  // CASCADE will handle grocery_list_items
  const result = await db
    .delete(groceryList)
    .where(and(eq(groceryList.id, listId), eq(groceryList.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// MEAL PLAN INSTANCE CRUD
// ============================================================================

export async function createMealPlanInstance(
  userId: string,
  instanceData: Omit<MealPlanInstance, 'id' | 'userId'>
): Promise<MealPlanInstance> {
  const [newInstance] = await db
    .insert(mealPlanInstance)
    .values({
      userId,
      mealPlanId: instanceData.mealPlanId,
      startDate: instanceData.startDate,
      endDate: instanceData.endDate,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as MealPlanInstance;
}

export async function getUserMealPlanInstances(userId: string): Promise<MealPlanInstance[]> {
  return await db
    .select()
    .from(mealPlanInstance)
    .where(eq(mealPlanInstance.userId, userId))
    .orderBy(desc(mealPlanInstance.startDate));
}

export async function updateMealPlanInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealPlanInstance, 'id' | 'userId' | 'mealPlanId'>>
): Promise<MealPlanInstance | null> {
  const [updated] = await db
    .update(mealPlanInstance)
    .set(updates)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)))
    .returning();

  return (updated as MealPlanInstance) || null;
}

export async function deleteMealPlanInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle meal_instances
  const result = await db
    .delete(mealPlanInstance)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// MEAL INSTANCE CRUD
// ============================================================================

export async function createMealInstance(
  userId: string,
  instanceData: Omit<MealInstance, 'id' | 'userId'>
): Promise<MealInstance> {
  const [newInstance] = await db
    .insert(mealInstance)
    .values({
      userId,
      mealPlanInstanceId: instanceData.mealPlanInstanceId,
      mealId: instanceData.mealId,
      date: instanceData.date,
      timestamp: instanceData.timestamp,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as MealInstance;
}

export async function getUserMealInstances(
  userId: string,
  options?: { mealPlanInstanceId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<MealInstance[]> {
  let query = db.select().from(mealInstance).where(eq(mealInstance.userId, userId));

  if (options?.mealPlanInstanceId) {
    query = query.where(
      and(
        eq(mealInstance.userId, userId),
        eq(mealInstance.mealPlanInstanceId, options.mealPlanInstanceId)
      )
    );
  }

  const results = await query.orderBy(desc(mealInstance.date));

  // Filter by date range if provided
  if (options?.dateFrom || options?.dateTo) {
    return results.filter((instance) => {
      const instanceDate = new Date(instance.date);
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return results;
}

export async function updateMealInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealInstance, 'id' | 'userId' | 'mealPlanInstanceId' | 'mealId' | 'date'>>
): Promise<MealInstance | null> {
  const [updated] = await db
    .update(mealInstance)
    .set(updates)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)))
    .returning();

  return (updated as MealInstance) || null;
}

export async function deleteMealInstance(instanceId: string, userId: string): Promise<boolean> {
  // CASCADE will handle portioned_food_instances
  const result = await db
    .delete(mealInstance)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// PORTIONED FOOD INSTANCE CRUD
// ============================================================================

export async function createPortionedFoodInstance(
  userId: string,
  instanceData: Omit<PortionedFoodInstance, 'id' | 'userId'>
): Promise<PortionedFoodInstance> {
  const [newInstance] = await db
    .insert(portionedFoodInstance)
    .values({
      userId,
      mealInstanceId: instanceData.mealInstanceId,
      foodId: instanceData.foodId,
      portion: instanceData.portion,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as PortionedFoodInstance;
}

export async function getPortionedFoodInstances(
  mealInstanceId: string
): Promise<PortionedFoodInstance[]> {
  return await db
    .select()
    .from(portionedFoodInstance)
    .where(eq(portionedFoodInstance.mealInstanceId, mealInstanceId));
}

export async function updatePortionedFoodInstance(
  instanceId: string,
  userId: string,
  updates: Partial<
    Omit<PortionedFoodInstance, 'id' | 'userId' | 'mealInstanceId' | 'foodId' | 'portion'>
  >
): Promise<PortionedFoodInstance | null> {
  const [updated] = await db
    .update(portionedFoodInstance)
    .set(updates)
    .where(
      and(eq(portionedFoodInstance.id, instanceId), eq(portionedFoodInstance.userId, userId))
    )
    .returning();

  return (updated as PortionedFoodInstance) || null;
}

export async function deletePortionedFoodInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(portionedFoodInstance)
    .where(
      and(eq(portionedFoodInstance.id, instanceId), eq(portionedFoodInstance.userId, userId))
    );

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// SUPPLEMENT CRUD
// ============================================================================

export async function createSupplement(
  supplementData: Omit<Supplement, 'id'>
): Promise<Supplement> {
  const [newSupplement] = await db
    .insert(supplement)
    .values({
      name: supplementData.name,
      description: supplementData.description,
      imageUrl: supplementData.imageUrl,
    })
    .returning();

  return newSupplement as Supplement;
}

export async function getSupplements(): Promise<Supplement[]> {
  return await db.select().from(supplement).orderBy(supplement.name);
}

// ============================================================================
// SUPPLEMENT SCHEDULE CRUD
// ============================================================================

export async function createSupplementSchedule(
  userId: string,
  scheduleData: Omit<SupplementSchedule, 'id' | 'userId' | 'supplements'>
): Promise<SupplementSchedule> {
  const [newSchedule] = await db
    .insert(supplementSchedule)
    .values({
      userId,
      name: scheduleData.name,
      scheduleType: scheduleData.scheduleType,
      description: scheduleData.description,
    })
    .returning();

  return newSchedule as SupplementSchedule;
}

export async function getUserSupplementSchedules(userId: string): Promise<SupplementSchedule[]> {
  return await db
    .select()
    .from(supplementSchedule)
    .where(eq(supplementSchedule.userId, userId))
    .orderBy(desc(supplementSchedule.createdAt));
}

export async function createSupplementInstance(
  userId: string,
  instanceData: Omit<SupplementInstance, 'id' | 'userId'>
): Promise<SupplementInstance> {
  const [newInstance] = await db
    .insert(supplementInstance)
    .values({
      userId,
      supplementScheduleId: instanceData.supplementScheduleId,
      supplementId: instanceData.supplementId,
      dosage: instanceData.dosage,
      date: instanceData.date,
      complete: instanceData.complete,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as SupplementInstance;
}

export async function getUserSupplementInstances(
  userId: string,
  options?: { supplementScheduleId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<SupplementInstance[]> {
  let query = db
    .select()
    .from(supplementInstance)
    .where(eq(supplementInstance.userId, userId));

  if (options?.supplementScheduleId) {
    query = query.where(
      and(
        eq(supplementInstance.userId, userId),
        eq(supplementInstance.supplementScheduleId, options.supplementScheduleId)
      )
    );
  }

  const results = await query.orderBy(desc(supplementInstance.date));

  // Filter by date range if provided
  if (options?.dateFrom || options?.dateTo) {
    return results.filter((instance) => {
      const instanceDate = new Date(instance.date);
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return results;
}

// ============================================================================
// WATER INTAKE CRUD
// ============================================================================

export async function getOrCreateWaterIntakeLog(userId: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(waterIntakeLog)
    .where(eq(waterIntakeLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [newLog] = await db.insert(waterIntakeLog).values({ userId }).returning();
  return newLog.id;
}

export async function createWaterIntake(
  userId: string,
  intakeData: Omit<WaterIntake, 'id' | 'userId'>
): Promise<WaterIntake> {
  const waterIntakeLogId = await getOrCreateWaterIntakeLog(userId);

  const [newIntake] = await db
    .insert(waterIntake)
    .values({
      waterIntakeLogId,
      userId,
      date: intakeData.date,
      timestamp: intakeData.timestamp,
      amount: intakeData.amount,
      notes: intakeData.notes,
    })
    .returning();

  return newIntake as WaterIntake;
}

export async function getUserWaterIntakes(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date }
): Promise<WaterIntake[]> {
  const waterIntakeLogId = await getOrCreateWaterIntakeLog(userId);

  const results = await db
    .select()
    .from(waterIntake)
    .where(eq(waterIntake.waterIntakeLogId, waterIntakeLogId))
    .orderBy(desc(waterIntake.date));

  // Filter by date range if provided
  if (options?.dateFrom || options?.dateTo) {
    return results.filter((intake) => {
      const intakeDate = new Date(intake.date);
      if (options.dateFrom && intakeDate < options.dateFrom) return false;
      if (options.dateTo && intakeDate > options.dateTo) return false;
      return true;
    });
  }

  return results;
}

// ============================================================================
// SLEEP CRUD
// ============================================================================

export async function getOrCreateSleepLog(userId: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(sleepLog)
    .where(eq(sleepLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [newLog] = await db.insert(sleepLog).values({ userId }).returning();
  return newLog.id;
}

export async function createSleepInstance(
  userId: string,
  sleepData: Omit<SleepInstance, 'id' | 'userId'>
): Promise<SleepInstance> {
  const sleepLogId = await getOrCreateSleepLog(userId);

  const [newSleep] = await db
    .insert(sleepInstance)
    .values({
      sleepLogId,
      userId,
      date: sleepData.date,
      timeAsleep: sleepData.timeAsleep,
      startTime: sleepData.startTime,
      endTime: sleepData.endTime,
      sleepScore: sleepData.sleepScore,
      wakeCount: sleepData.wakeCount,
      timeAwake: sleepData.timeAwake,
      notes: sleepData.notes,
    })
    .returning();

  return newSleep as SleepInstance;
}

export async function getUserSleepInstances(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date }
): Promise<SleepInstance[]> {
  const sleepLogId = await getOrCreateSleepLog(userId);

  const results = await db
    .select()
    .from(sleepInstance)
    .where(eq(sleepInstance.sleepLogId, sleepLogId))
    .orderBy(desc(sleepInstance.date));

  // Filter by date range if provided
  if (options?.dateFrom || options?.dateTo) {
    return results.filter((instance) => {
      const instanceDate = new Date(instance.date);
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return results;
}

export async function updateSleepInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<SleepInstance, 'id' | 'userId' | 'sleepLogId' | 'date'>>
): Promise<SleepInstance | null> {
  const [updated] = await db
    .update(sleepInstance)
    .set(updates)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)))
    .returning();

  return (updated as SleepInstance) || null;
}

export async function deleteSleepInstance(instanceId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(sleepInstance)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

