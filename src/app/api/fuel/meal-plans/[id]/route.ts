import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getMealPlanById, updateMealPlan, deleteMealPlan } from '@/lib/db/crud';

// GET /api/fuel/meal-plans/[id] - Get a specific meal plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const mealPlan = await getMealPlanById(id, userId);
    if (!mealPlan) {
      return { error: 'Meal plan not found' };
    }
    return { mealPlan };
  });
}

// PATCH /api/fuel/meal-plans/[id] - Update a meal plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const mealPlan = await updateMealPlan(id, userId, updates);
    if (!mealPlan) {
      return { error: 'Meal plan not found' };
    }
    return { mealPlan };
  });
}

// DELETE /api/fuel/meal-plans/[id] - Delete a meal plan (CASCADE deletes meals)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteMealPlan(id, userId);
    if (!deleted) {
      return { error: 'Meal plan not found' };
    }
    return { success: true };
  });
}

