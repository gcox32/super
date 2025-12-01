import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getWorkoutBlockInstances, createWorkoutBlockInstance } from '@/lib/db/crud';
import type { WorkoutBlockInstance } from '@/types/train';

// GET /api/train/workout-block-instances - Get user's workout block instances
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const workoutInstanceId = getQueryParam(request.url, 'workoutInstanceId');
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (workoutInstanceId) options.workoutInstanceId = workoutInstanceId;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const instances = await getWorkoutBlockInstances(userId, options);
    return { instances };
  });
}

// POST /api/train/workout-block-instances - Create a workout block instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody<Omit<WorkoutBlockInstance, 'id' | 'userId'>>(request);
    const instance = await createWorkoutBlockInstance(userId, instanceData);
    return { instance };
  });
}

