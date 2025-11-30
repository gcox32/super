import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserMealPlans, createMealPlan } from '@/lib/db/crud';

// GET /api/fuel/meal-plans - Get user's meal plans
export async function GET() {
  return withAuth(async (userId) => {
    const mealPlans = await getUserMealPlans(userId);
    return { mealPlans };
  });
}

// POST /api/fuel/meal-plans - Create a new meal plan
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealPlanData = await parseBody(request);
    const mealPlan = await createMealPlan(userId, mealPlanData);
    return { mealPlan };
  });
}

