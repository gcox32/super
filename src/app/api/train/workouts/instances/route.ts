import { NextRequest } from 'next/server';
import { withAuth, getQueryParam } from '@/lib/api/helpers';
import { getUserWorkoutInstances } from '@/lib/db/crud';

// GET /api/train/workouts/instances - Get all user's workout instances (across all workouts)
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

