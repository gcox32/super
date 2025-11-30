import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserMealPlanInstances, createMealPlanInstance } from '@/lib/db/crud';

// GET /api/fuel/meal-plan-instances - Get user's meal plan instances
export async function GET() {
  return withAuth(async (userId) => {
    const mealPlanInstances = await getUserMealPlanInstances(userId);
    return { mealPlanInstances };
  });
}

// POST /api/fuel/meal-plan-instances - Create a new meal plan instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody(request);
    const mealPlanInstance = await createMealPlanInstance(userId, instanceData);
    return { mealPlanInstance };
  });
}

