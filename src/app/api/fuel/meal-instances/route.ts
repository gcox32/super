import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserMealInstances, createMealInstance } from '@/lib/db/crud';

// GET /api/fuel/meal-instances - Get user's meal instances
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealPlanInstanceId = getQueryParam(request.url, 'mealPlanInstanceId');
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (mealPlanInstanceId) options.mealPlanInstanceId = mealPlanInstanceId;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const mealInstances = await getUserMealInstances(userId, options);
    return { mealInstances };
  });
}

// POST /api/fuel/meal-instances - Create a new meal instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealInstanceData = await parseBody(request);
    const mealInstance = await createMealInstance(userId, mealInstanceData);
    return { mealInstance };
  });
}

