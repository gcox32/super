import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getWorkoutBlockInstances, createWorkoutBlockInstance } from '@/lib/db/crud';
import type { WorkoutBlockInstance } from '@/types/train';

// GET /api/train/workouts/[workoutId]/blocks/[blockId]/instances - Get block instances for a specific block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { blockId } = await params;
    const workoutInstanceId = getQueryParam(request.url, 'workoutInstanceId');
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = { workoutBlockId: blockId };
    if (workoutInstanceId) options.workoutInstanceId = workoutInstanceId;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const instances = await getWorkoutBlockInstances(userId, options);
    return { instances };
  });
}

// POST /api/train/workouts/[workoutId]/blocks/[blockId]/instances - Create a workout block instance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { blockId } = await params;
    const instanceData = await parseBody<Omit<WorkoutBlockInstance, 'id' | 'userId'>>(request);
    const instance = await createWorkoutBlockInstance(userId, {
      ...instanceData,
      workoutBlockId: blockId,
    });
    return { instance };
  });
}

