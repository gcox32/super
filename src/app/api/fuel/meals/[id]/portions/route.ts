import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getMealPortions, addPortionedFoodToMeal, removePortionedFoodFromMeal, getMealById, getMealPlanById } from '@/lib/db/crud';

// GET /api/fuel/meals/[id]/portions - Get all portions for a meal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const meal = await getMealById(id);
    if (!meal) {
      return { error: 'Meal not found' };
    }

    // Verify meal plan belongs to user
    const mealPlan = await getMealPlanById(meal.mealPlanId, userId);
    if (!mealPlan) {
      return { error: 'Meal plan not found' };
    }

    const portions = await getMealPortions(id);
    return { portions };
  });
}

// POST /api/fuel/meals/[id]/portions - Add a portioned food to a meal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const meal = await getMealById(id);
    if (!meal) {
      return { error: 'Meal not found' };
    }

    // Verify meal plan belongs to user
    const mealPlan = await getMealPlanById(meal.mealPlanId, userId);
    if (!mealPlan) {
      return { error: 'Meal plan not found' };
    }

    const { portionedFoodId, order } = await parseBody<{ portionedFoodId: string; order: number }>(request);
    await addPortionedFoodToMeal(id, portionedFoodId, order);
    return { success: true };
  });
}

// DELETE /api/fuel/meals/[id]/portions - Remove a portioned food from a meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const meal = await getMealById(id);
    if (!meal) {
      return { error: 'Meal not found' };
    }

    // Verify meal plan belongs to user
    const mealPlan = await getMealPlanById(meal.mealPlanId, userId);
    if (!mealPlan) {
      return { error: 'Meal plan not found' };
    }

    const { portionedFoodId } = await parseBody<{ portionedFoodId: string }>(request);
    await removePortionedFoodFromMeal(id, portionedFoodId);
    return { success: true };
  });
}

