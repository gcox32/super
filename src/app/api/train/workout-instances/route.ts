import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserWorkoutInstances, createWorkoutInstance } from '@/lib/db/crud';

// GET /api/train/workout-instances - Get user's workout instances
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const workoutId = getQueryParam(request.url, 'workoutId');
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (workoutId) options.workoutId = workoutId;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const workoutInstances = await getUserWorkoutInstances(userId, options);
    return { workoutInstances };
  });
}

// POST /api/train/workout-instances - Create a workout instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody(request);
    const workoutInstance = await createWorkoutInstance(userId, instanceData);
    return { workoutInstance };
  });
}

