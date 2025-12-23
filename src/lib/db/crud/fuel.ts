import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../index';

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
    ;

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
  updates: Partial<Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'meals'>>
): Promise<MealPlan | null> {
  const [updated] = await db
    .update(mealPlan)
    .set(updates)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    ;

  return (updated as MealPlan) || null;
}

export async function deleteMealPlan(mealPlanId: string, userId: string): Promise<boolean> {
  // CASCADE will handle meals
  // Check if the record exists first
  const [existing] = await db
    .select()
    .from(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .limit(1);
  
  if (!existing) return false;
  
  await db
    .delete(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)));
  
  return true;
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
    ;

  return newMeal as Meal;
}

export async function getMeals(mealPlanId: string): Promise<Meal[]> {
  const results = await db
    .select()
    .from(meal)
    .where(eq(meal.mealPlanId, mealPlanId))
    .orderBy(desc(meal.createdAt));
  
  return results.map(nullToUndefined) as Meal[];
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
    ;

  return (updated as Meal) || null;
}

export async function deleteMeal(mealId: string): Promise<boolean> {
  // CASCADE will handle meal_portions, meal_recipes
  await db.delete(meal).where(eq(meal.id, mealId));
  return true;
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
  }).returning();
}

export async function getMealPortions(mealId: string): Promise<Array<{ portionedFoodId: string; order: number; portionedFood: PortionedFood }>> {
  const portions = await db
    .select()
    .from(mealPortion)
    .where(eq(mealPortion.mealId, mealId))
    .orderBy(mealPortion.order);

  const portionedFoodIds = portions.map(p => p.portionedFoodId);
  const portionedFoods = await db
    .select()
    .from(portionedFood)
    .where(inArray(portionedFood.id, portionedFoodIds));

  const portionedFoodMap = new Map(portionedFoods.map(pf => [pf.id, pf]));

  return portions.map(p => {
    const pf = portionedFoodMap.get(p.portionedFoodId);
    if (!pf) throw new Error(`Portioned food ${p.portionedFoodId} not found`);
    return {
      portionedFoodId: p.portionedFoodId,
      order: p.order,
      portionedFood: {
        ...(pf as any),
        food: pf.foodId,
        calories: pf.calories ? Number(pf.calories) : undefined,
      } as PortionedFood,
    };
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
    ;

  return newFood as Food;
}

export async function getFoods(): Promise<Food[]> {
  const results = await db.select().from(food).orderBy(food.name);
  return results.map(nullToUndefined) as Food[];
}

export async function getFoodById(foodId: string): Promise<Food | null> {
  const [found] = await db.select().from(food).where(eq(food.id, foodId)).limit(1);

  return (found as Food) || null;
}

export async function searchFoods(query: string): Promise<Food[]> {
  const results = await db
    .select()
    .from(food)
    .where(eq(food.name, query))
    .orderBy(food.name);
  return results.map(nullToUndefined) as Food[];
}

export async function updateFood(
  foodId: string,
  updates: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Food | null> {
  const [updated] = await db
    .update(food)
    .set(updates)
    .where(eq(food.id, foodId))
    ;

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
      calories: portionedFoodData.calories?.toString() || null,
      macros: portionedFoodData.macros,
      micros: portionedFoodData.micros,
      portionSize: portionedFoodData.portionSize,
    })
    .returning();

  return {
    ...(newPortionedFood as any),
    food: portionedFoodData.food,
    calories: newPortionedFood.calories ? Number(newPortionedFood.calories) : undefined,
  } as PortionedFood;
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
    ...(found as any),
    food: found.foodId,
    calories: found.calories ? Number(found.calories) : undefined,
  } as PortionedFood;
}

export async function updatePortionedFood(
  portionedFoodId: string,
  updates: Partial<Omit<PortionedFood, 'id' | 'food' | 'createdAt' | 'updatedAt'>>
): Promise<PortionedFood | null> {
  // Convert calories to string if provided
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
    ...(updated as any),
    food: updated.foodId,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as PortionedFood;
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
    ;

  return newRecipe as Recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  const results = await db.select().from(recipe).orderBy(recipe.name);
  return results.map((r) => ({
    ...nullToUndefined(r),
    ingredients: [], // Ingredients are loaded separately via recipe_ingredient junction table
  })) as Recipe[];
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const [found] = await db.select().from(recipe).where(eq(recipe.id, recipeId)).limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    ingredients: [], // Ingredients are loaded separately via recipe_ingredient junction table
  } as Recipe;
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>>
): Promise<Recipe | null> {
  const [updated] = await db
    .update(recipe)
    .set(updates)
    .where(eq(recipe.id, recipeId))
    ;

  return (updated as Recipe) || null;
}

export async function getRecipeIngredients(recipeId: string): Promise<Array<{ portionedFoodId: string; order: number; portionedFood: PortionedFood }>> {
  const ingredients = await db
    .select()
    .from(recipeIngredient)
    .where(eq(recipeIngredient.recipeId, recipeId))
    .orderBy(recipeIngredient.order);

  const portionedFoodIds = ingredients.map(i => i.portionedFoodId);
  const portionedFoods = await db
    .select()
    .from(portionedFood)
    .where(inArray(portionedFood.id, portionedFoodIds));

  const portionedFoodMap = new Map(portionedFoods.map(pf => [pf.id, pf]));

  return ingredients.map(i => {
    const pf = portionedFoodMap.get(i.portionedFoodId);
    if (!pf) throw new Error(`Portioned food ${i.portionedFoodId} not found`);
    return {
      portionedFoodId: i.portionedFoodId,
      order: i.order,
      portionedFood: {
        ...(pf as any),
        food: pf.foodId,
        calories: pf.calories ? Number(pf.calories) : undefined,
      } as PortionedFood,
    };
  });
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
  }).returning();
}

export async function removeIngredientFromRecipe(
  recipeId: string,
  portionedFoodId: string
): Promise<void> {
  await db
    .delete(recipeIngredient)
    .where(
      and(
        eq(recipeIngredient.recipeId, recipeId),
        eq(recipeIngredient.portionedFoodId, portionedFoodId)
      )
    );
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
    ;

  return newList as GroceryList;
}

export async function getUserGroceryLists(userId: string): Promise<GroceryList[]> {
  const results = await db
    .select()
    .from(groceryList)
    .where(eq(groceryList.userId, userId))
    .orderBy(desc(groceryList.createdAt));
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    foods: [], // Foods are loaded separately via grocery_list_item junction table
  })) as GroceryList[];
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

export async function getGroceryListItems(listId: string): Promise<Array<{ portionedFoodId: string; order: number; portionedFood: PortionedFood }>> {
  const items = await db
    .select()
    .from(groceryListItem)
    .where(eq(groceryListItem.groceryListId, listId))
    .orderBy(groceryListItem.order);

  const portionedFoodIds = items.map(i => i.portionedFoodId);
  const portionedFoods = await db
    .select()
    .from(portionedFood)
    .where(inArray(portionedFood.id, portionedFoodIds));

  const portionedFoodMap = new Map(portionedFoods.map(pf => [pf.id, pf]));

  return items.map(i => {
    const pf = portionedFoodMap.get(i.portionedFoodId);
    if (!pf) throw new Error(`Portioned food ${i.portionedFoodId} not found`);
    return {
      portionedFoodId: i.portionedFoodId,
      order: i.order,
      portionedFood: {
        ...(pf as any),
        food: pf.foodId,
        calories: pf.calories ? Number(pf.calories) : undefined,
      } as PortionedFood,
    };
  });
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
  }).returning();
}

export async function removePortionedFoodFromGroceryList(
  listId: string,
  portionedFoodId: string
): Promise<void> {
  await db
    .delete(groceryListItem)
    .where(
      and(
        eq(groceryListItem.groceryListId, listId),
        eq(groceryListItem.portionedFoodId, portionedFoodId)
      )
    );
}

export async function deleteGroceryList(listId: string, userId: string): Promise<boolean> {
  // CASCADE will handle grocery_list_items
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
  // Convert Date objects to strings for database
  const dbUpdates: any = { ...updates };
  if (updates.startDate) dbUpdates.startDate = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.endDate = updates.endDate ?? null;
  
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
  // CASCADE will handle meal_instances
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
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return { ...newInstance, date: new Date(newInstance.date), timestamp: newInstance.timestamp ? new Date(newInstance.timestamp) : null } as MealInstance;
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

  // Convert date strings to Date objects
  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
  })) as MealInstance[];

  // Filter by date range if provided
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
  const [updated] = await db
    .update(mealInstance)
    .set(updates)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)))
    ;

  return (updated as MealInstance) || null;
}

export async function deleteMealInstance(instanceId: string, userId: string): Promise<boolean> {
  // CASCADE will handle portioned_food_instances
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
    ;

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
    ;

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
    ;

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
    ;

  return newSchedule as SupplementSchedule;
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

  // Convert date strings to Date objects
  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as SupplementInstance[];

  // Filter by date range if provided
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
  // Try to find first
  const [existing] = await db
    .select()
    .from(waterIntakeLog)
    .where(eq(waterIntakeLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  // Try to insert, handle potential race condition/duplicate
  try {
    const [newLog] = await db.insert(waterIntakeLog).values({ userId }).returning();
    return newLog.id;
  } catch (e: any) {
    // If duplicate key error, fetch again
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

  // Convert date strings to Date objects
  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
  })) as WaterIntake[];

  // Filter by date range if provided
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
  // Try to find first
  const [existing] = await db
    .select()
    .from(sleepLog)
    .where(eq(sleepLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  // Try to insert, handle potential race condition/duplicate
  try {
    const [newLog] = await db.insert(sleepLog).values({ userId }).returning();
    return newLog.id;
  } catch (e: any) {
    // If duplicate key error, fetch again
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
      date: sleepData.date instanceof Date ? sleepData.date.toISOString().split('T')[0] : sleepData.date,
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

  // Convert date strings to Date objects and numeric strings to numbers
  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    sleepScore: r.sleepScore ? Number(r.sleepScore) : undefined,
  })) as unknown as SleepInstance[];

  // Filter by date range if provided
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
  // Convert Date objects to strings and numbers to strings for database
  const dbUpdates: any = { ...updates };
  if (updates.date) {
    dbUpdates.date = updates.date instanceof Date 
      ? updates.date.toISOString().split('T')[0] 
      : updates.date;
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
