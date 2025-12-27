import { eq, and, desc, inArray, sql, ilike, isNull } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '../index';
import {
  mealPlan,
  mealWeek,
  meal,
  food,
  portionedFood,
  recipe,
  groceryList,
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
  MealWeek,
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

// Helper to convert null to undefined for optional fields
function nullToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === null && key !== 'id') {
      (result as any)[key] = undefined;
    }
  }
  return result;
}

// ============================================================================
// MEAL PLAN CRUD
// ============================================================================

export async function createMealPlan(
  userId: string,
  mealPlanData: Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'weeks' | 'meals'>
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
  const results = await db
    .select()
    .from(mealPlan)
    .where(eq(mealPlan.userId, userId))
    .orderBy(desc(mealPlan.createdAt));
  
  return results.map(nullToUndefined) as MealPlan[];
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
  updates: Partial<Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'weeks' | 'meals'>>
): Promise<MealPlan | null> {
  const [updated] = await db
    .update(mealPlan)
    .set(updates)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .returning();

  return (updated as MealPlan) || null;
}

export async function deleteMealPlan(mealPlanId: string, userId: string): Promise<boolean> {
  // CASCADE will handle meals and weeks
  const result = await db
    .delete(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)));
  
  return true;
}

// ============================================================================
// MEAL WEEK CRUD
// ============================================================================

export async function createMealWeek(
  mealPlanId: string,
  weekData: Omit<MealWeek, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'meals' | 'groceryList'>
): Promise<MealWeek> {
  const [newWeek] = await db
    .insert(mealWeek)
    .values({
      mealPlanId,
      weekNumber: weekData.weekNumber,
    })
    .returning();

  return {
    ...newWeek,
    meals: [], // Hydrated separately
  } as MealWeek;
}

export async function getMealWeeks(mealPlanId: string): Promise<MealWeek[]> {
  const results = await db
    .select()
    .from(mealWeek)
    .where(eq(mealWeek.mealPlanId, mealPlanId))
    .orderBy(mealWeek.weekNumber);
  
  return results.map(r => ({
    ...nullToUndefined(r),
    meals: [], // Hydrated separately
  })) as MealWeek[];
}

// ============================================================================
// MEAL CRUD
// ============================================================================

export async function createMeal(
  userId: string,
  mealData: Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>
): Promise<Meal> {
  const [newMeal] = await db
    .insert(meal)
    .values({
      userId,
      name: mealData.name,
      description: mealData.description,
      calories: mealData.calories?.toString() || null,
      macros: mealData.macros,
      micros: mealData.micros,
    })
    .returning();

  return {
    ...newMeal,
    userId: userId,
    calories: newMeal.calories ? Number(newMeal.calories) : undefined,
  } as Meal;
}

export async function getMeals(
  userId: string,
  mealPlanId?: string | null,
  page: number = 1,
  limit: number = 20
): Promise<{ meals: Meal[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  let whereClause = eq(meal.userId, userId);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(meal)
    .where(whereClause);

  if (mealPlanId) {
    whereClause = and(whereClause, eq(meal.mealPlanId, mealPlanId)) as any as SQL<unknown>;
  } else {
    whereClause = and(whereClause, isNull(meal.mealPlanId)) as any as SQL<unknown>;
  }

  const results = await db
    .select()
    .from(meal)
    .where(whereClause)
    .orderBy(desc(meal.createdAt))
    .limit(limit)
    .offset(offset);
  
  return {
    meals: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
      userId: r.userId,
    })) as Meal[],
    total: Number(count),
    page,
    limit,
  };
}

export async function getMealById(mealId: string): Promise<Meal | null> {
  const [found] = await db
    .select()
    .from(meal)
    .where(eq(meal.id, mealId))
    .limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    calories: found.calories ? Number(found.calories) : undefined,
  } as Meal;
}

export async function searchMeals(query: string, page: number = 1, limit: number = 20): Promise<{ meals: Meal[]; total: number; page: number; limit: number }> {
  // Use simple ILIKE search for now
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(meal)
    .where(ilike(meal.name, `%${query}%`));

  const results = await db.select().from(meal).orderBy(meal.name).limit(limit).offset(offset);
  return {
    meals: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
    })) as Meal[],
    total: Number(count),
    page,
    limit,
  };
}

export async function updateMeal(
  mealId: string,
  updates: Partial<Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>>
): Promise<Meal | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(meal)
    .set(dbUpdates)
    .where(eq(meal.id, mealId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Meal;
}

export async function deleteMeal(mealId: string): Promise<boolean> {
  await db.delete(meal).where(eq(meal.id, mealId));
  return true;
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
      servingSize: foodData.servingSize,
      calories: foodData.calories?.toString() || null,
      macros: foodData.macros,
      micros: foodData.micros,
      imageUrl: foodData.imageUrl,
    })
    .returning();

  return {
    ...newFood,
    calories: newFood.calories ? Number(newFood.calories) : undefined,
  } as Food;
}

export async function getFoods(
  page: number = 1, 
  limit: number = 20
): Promise<{ foods: Food[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(food);

  const results = await db.select().from(food).orderBy(food.name).limit(limit).offset(offset);
  return {
    foods: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
    })) as Food[],
    total: Number(count),
    page,
    limit,
  };
}

export async function getFoodById(foodId: string): Promise<Food | null> {
  const [found] = await db.select().from(food).where(eq(food.id, foodId)).limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    calories: found.calories ? Number(found.calories) : undefined,
  } as Food;
}

export async function searchFoods(
  query: string, 
  page: number = 1, 
  limit: number = 20
): Promise<{ foods: Food[]; total: number; page: number; limit: number }> {
  // Use simple ILIKE search for now
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(food)
    .where(ilike(food.name, `%${query}%`));

  const results = await db
    .select()
    .from(food)
    // .where(ilike(food.name, `%${query}%`)) // Using simple eq for now as Drizzle might not have ilike imported
    // Actually, let's assume we can filter in JS if not using ilike helper
    .orderBy(food.name);

  return {
    foods: results
      .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
      .map((r) => ({
        ...nullToUndefined(r),
        calories: r.calories ? Number(r.calories) : undefined,
      })) as Food[],
    total: Number(count),
    page,
    limit,
  };
}

export async function updateFood(
  foodId: string,
  updates: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Food | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(food)
    .set(dbUpdates)
    .where(eq(food.id, foodId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Food;
}

export async function deleteFood(foodId: string): Promise<boolean> {
  await db.delete(food).where(eq(food.id, foodId));
  return true;
}

// ============================================================================
// PORTIONED FOOD CRUD (Unified for Meal, Recipe, GroceryList)
// ============================================================================

export async function createPortionedFood(
  parentId: { mealId?: string; },
  portionedFoodData: PortionedFood
): Promise<PortionedFood> {
  const [newPortionedFood] = await db
    .insert(portionedFood)
    .values({
      foodId: portionedFoodData.foodId,
      mealId: parentId.mealId,
      portion: portionedFoodData.portion,
      calories: portionedFoodData.calories?.toString() || null,
      macros: portionedFoodData.macros,
      micros: portionedFoodData.micros,
    })
    .returning();

  return {
    ...newPortionedFood,
    calories: newPortionedFood.calories ? Number(newPortionedFood.calories) : undefined,
  } as PortionedFood;
}

export async function getPortionedFoods(
  parentId: { mealId?: string; recipeId?: string; groceryListId?: string }
): Promise<PortionedFood[]> {
  let whereClause;
  if (parentId.mealId) whereClause = eq(portionedFood.mealId, parentId.mealId);
  else if (parentId.recipeId) whereClause = eq(portionedFood.recipeId, parentId.recipeId);
  else if (parentId.groceryListId) whereClause = eq(portionedFood.groceryListId, parentId.groceryListId);
  else return [];

  const results = await db
    .select()
    .from(portionedFood)
    .where(whereClause);

  return results.map((r) => ({
    ...nullToUndefined(r),
    calories: r.calories ? Number(r.calories) : undefined,
  })) as PortionedFood[];
}

export async function updatePortionedFood(
  portionedFoodId: string,
  updates: Partial<Omit<PortionedFood, 'id' | 'foodId' | 'createdAt' | 'updatedAt'>>
): Promise<PortionedFood | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(portionedFood)
    .set(dbUpdates)
    .where(eq(portionedFood.id, portionedFoodId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as PortionedFood;
}

export async function deletePortionedFood(portionedFoodId: string): Promise<boolean> {
  await db.delete(portionedFood).where(eq(portionedFood.id, portionedFoodId));
  return true;
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
    })
    .returning();

  return {
    ...newRecipe,
    calories: newRecipe.calories ? Number(newRecipe.calories) : undefined,
  } as Recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  const results = await db.select().from(recipe).orderBy(recipe.name);
  return results.map(r => ({
    ...nullToUndefined(r),
    ingredients: r.ingredients ? (r.ingredients as PortionedFood[]) : [],
    calories: r.calories ? Number(r.calories) : undefined,
  })) as Recipe[];
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const [found] = await db.select().from(recipe).where(eq(recipe.id, recipeId)).limit(1);
  if (!found) return null;
  return {
    ...nullToUndefined(found),
    ingredients: found.ingredients ? (found.ingredients as PortionedFood[]) : [],
    calories: found.calories ? Number(found.calories) : undefined,
  } as Recipe;
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>>
): Promise<Recipe | null> {
  const [updated] = await db
    .update(recipe)
    .set({
      ...updates,
      calories: updates.calories?.toString() || null,
      macros: updates.macros,
      micros: updates.micros,
    })
    .where(eq(recipe.id, recipeId))
    .returning();

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Recipe;
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
      mealWeekId: groceryListData.mealWeekId,
    })
    .returning();

  return newList as GroceryList;
}

export async function getUserGroceryLists(userId: string): Promise<GroceryList[]> {
  const results = await db
    .select()
    .from(groceryList)
    .where(eq(groceryList.userId, userId))
    .orderBy(desc(groceryList.createdAt));
  
  return results.map(r => ({ ...nullToUndefined(r), foods: [] })) as GroceryList[];
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

export async function deleteGroceryList(listId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(groceryList)
    .where(and(eq(groceryList.id, listId), eq(groceryList.userId, userId)));
  
  return true;
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
      endDate: instanceData.endDate ?? null,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newInstance,
    startDate: new Date(newInstance.startDate),
    endDate: newInstance.endDate ? new Date(newInstance.endDate) : null,
  } as MealPlanInstance;
}

export async function getUserMealPlanInstances(userId: string): Promise<MealPlanInstance[]> {
  const results = await db
    .select()
    .from(mealPlanInstance)
    .where(eq(mealPlanInstance.userId, userId))
    .orderBy(desc(mealPlanInstance.startDate));
  
  return results.map((r) => ({
    ...r,
    startDate: new Date(r.startDate),
    endDate: r.endDate ? new Date(r.endDate) : null,
  })) as MealPlanInstance[];
}

export async function updateMealPlanInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealPlanInstance, 'id' | 'userId' | 'mealPlanId'>>
): Promise<MealPlanInstance | null> {
  const dbUpdates: any = { ...updates };
  
  const [updated] = await db
    .update(mealPlanInstance)
    .set(dbUpdates)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    startDate: new Date(updated.startDate),
    endDate: updated.endDate ? new Date(updated.endDate) : null,
  } as MealPlanInstance;
}

export async function deleteMealPlanInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(mealPlanInstance)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)));

  return true;
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
      timestamp: instanceData.timestamp ?? null,
      complete: instanceData.complete ?? false,
      calories: instanceData.calories?.toString() || null,
      macros: instanceData.macros,
      micros: instanceData.micros,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return { 
    ...newInstance, 
    date: new Date(newInstance.date), 
    timestamp: newInstance.timestamp ? new Date(newInstance.timestamp) : null,
    calories: newInstance.calories ? Number(newInstance.calories) : undefined,
  } as MealInstance;
}

export async function getUserMealInstances(
  userId: string,
  options?: { mealPlanInstanceId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<MealInstance[]> {
  let whereClause = eq(mealInstance.userId, userId);
  
  if (options?.mealPlanInstanceId) {
    whereClause = and(
      eq(mealInstance.userId, userId),
      eq(mealInstance.mealPlanInstanceId, options.mealPlanInstanceId)
    ) as any;
  }

  const results = await db
    .select()
    .from(mealInstance)
    .where(whereClause)
    .orderBy(desc(mealInstance.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
    calories: r.calories ? Number(r.calories) : undefined,
  })) as MealInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function updateMealInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealInstance, 'id' | 'userId' | 'mealPlanInstanceId' | 'mealId' | 'date'>>
): Promise<MealInstance | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(mealInstance)
    .set(dbUpdates)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
    timestamp: updated.timestamp ? new Date(updated.timestamp) : null,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as MealInstance;
}

export async function deleteMealInstance(instanceId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(mealInstance)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)));

  return true;
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
  const results = await db
    .select()
    .from(portionedFoodInstance)
    .where(eq(portionedFoodInstance.mealInstanceId, mealInstanceId));
  
  return results as PortionedFoodInstance[];
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

  return true;
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
  const results = await db.select().from(supplement).orderBy(supplement.name);
  return results.map(nullToUndefined) as Supplement[];
}

// ============================================================================
// SUPPLEMENT SCHEDULE CRUD
// ============================================================================

export async function createSupplementSchedule(
  userId: string,
  scheduleData: SupplementSchedule
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

  return {
    ...newSchedule,
    supplements: scheduleData.supplements,
  } as SupplementSchedule;
}

export async function getUserSupplementSchedules(userId: string): Promise<SupplementSchedule[]> {
  const results = await db
    .select()
    .from(supplementSchedule)
    .where(eq(supplementSchedule.userId, userId))
    .orderBy(desc(supplementSchedule.createdAt));
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    supplements: [], // Supplements are loaded separately via supplement_instance junction table
  })) as SupplementSchedule[];
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
      complete: instanceData.complete ?? null,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return { ...newInstance, date: new Date(newInstance.date) } as SupplementInstance;
}

export async function getUserSupplementInstances(
  userId: string,
  options?: { supplementScheduleId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<SupplementInstance[]> {
  let whereClause = eq(supplementInstance.userId, userId);
  
  if (options?.supplementScheduleId) {
    whereClause = and(
      eq(supplementInstance.userId, userId),
      eq(supplementInstance.supplementScheduleId, options.supplementScheduleId)
    ) as any;
  }

  const results = await db
    .select()
    .from(supplementInstance)
    .where(whereClause)
    .orderBy(desc(supplementInstance.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as SupplementInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getSupplementInstanceById(
  instanceId: string,
  userId: string
): Promise<SupplementInstance | null> {
  const [found] = await db
    .select()
    .from(supplementInstance)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return { ...found, date: new Date(found.date) } as SupplementInstance;
}

export async function updateSupplementInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<SupplementInstance, 'id' | 'userId' | 'supplementScheduleId' | 'supplementId' | 'date'>>
): Promise<SupplementInstance | null> {
  const [updated] = await db
    .update(supplementInstance)
    .set(updates)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return { ...updated, date: new Date(updated.date) } as SupplementInstance;
}

export async function deleteSupplementInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(supplementInstance)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)));

  return true;
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

  try {
    const [newLog] = await db.insert(waterIntakeLog).values({ userId }).returning();
    return newLog.id;
  } catch (e: any) {
    if (e.code === '23505') {
      const [retry] = await db
        .select()
        .from(waterIntakeLog)
        .where(eq(waterIntakeLog.userId, userId))
        .limit(1);
      
      if (retry) return retry.id;
    }
    throw e;
  }
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
      timestamp: intakeData.timestamp ?? null,
      amount: intakeData.amount,
      notes: intakeData.notes ?? null,
    } as any)
    .returning();

  return { ...newIntake, date: new Date(newIntake.date), timestamp: newIntake.timestamp ? new Date(newIntake.timestamp) : null } as WaterIntake;
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

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
  })) as WaterIntake[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((intake) => {
      const intakeDate = intake.date;
      if (options.dateFrom && intakeDate < options.dateFrom) return false;
      if (options.dateTo && intakeDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getWaterIntakeById(
  intakeId: string,
  userId: string
): Promise<WaterIntake | null> {
  const [found] = await db
    .select()
    .from(waterIntake)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    timestamp: found.timestamp ? new Date(found.timestamp) : null,
  } as WaterIntake;
}

export async function updateWaterIntake(
  intakeId: string,
  userId: string,
  updates: Partial<Omit<WaterIntake, 'id' | 'userId' | 'date'>>
): Promise<WaterIntake | null> {
  const [updated] = await db
    .update(waterIntake)
    .set(updates)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
    timestamp: updated.timestamp ? new Date(updated.timestamp) : null,
  } as WaterIntake;
}

export async function deleteWaterIntake(
  intakeId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(waterIntake)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)));

  return true;
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

  try {
    const [newLog] = await db.insert(sleepLog).values({ userId }).returning();
    return newLog.id;
  } catch (e: any) {
    if (e.code === '23505') {
      const [retry] = await db
        .select()
        .from(sleepLog)
        .where(eq(sleepLog.userId, userId))
        .limit(1);
      
      if (retry) return retry.id;
    }
    throw e;
  }
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
      timeAsleep: sleepData.timeAsleep ?? null,
      startTime: sleepData.startTime ?? null,
      endTime: sleepData.endTime ?? null,
      sleepScore: sleepData.sleepScore?.toString() ?? null,
      wakeCount: sleepData.wakeCount ?? null,
      timeAwake: sleepData.timeAwake ?? null,
      notes: sleepData.notes ?? null,
    } as any)
    .returning();

  return { 
    ...newSleep, 
    date: new Date(newSleep.date),
    sleepScore: newSleep.sleepScore ? Number(newSleep.sleepScore) : undefined,
  } as unknown as SleepInstance;
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

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    sleepScore: r.sleepScore ? Number(r.sleepScore) : undefined,
  })) as unknown as SleepInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getSleepInstanceById(
  instanceId: string,
  userId: string
): Promise<SleepInstance | null> {
  const [found] = await db
    .select()
    .from(sleepInstance)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    sleepScore: found.sleepScore ? Number(found.sleepScore) : undefined,
  } as unknown as SleepInstance;
}

export async function updateSleepInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<SleepInstance, 'id' | 'userId' | 'sleepLogId'>>
): Promise<SleepInstance | null> {
  const dbUpdates: any = { ...updates };
  if (updates.date) {
    dbUpdates.date = updates.date;
  }
  if (updates.sleepScore !== undefined) {
    dbUpdates.sleepScore = updates.sleepScore?.toString() ?? null;
  }
  
  const [updated] = await db
    .update(sleepInstance)
    .set(dbUpdates)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
    sleepScore: updated.sleepScore ? Number(updated.sleepScore) : undefined,
  } as unknown as SleepInstance;
}

export async function deleteSleepInstance(instanceId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(sleepInstance)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)));

  return true;
}
