import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserWorkoutInstances, createWorkoutInstance } from '@/lib/db/crud';

// GET /api/train/workouts/[workoutId]/instances - Get workout instances for a specific workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId } = await params;
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = { workoutId };
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const workoutInstances = await getUserWorkoutInstances(userId, options);
    return { workoutInstances };
  });
}

// POST /api/train/workouts/[workoutId]/instances - Create a workout instance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId } = await params;
    const instanceData = await parseBody(request);
    const workoutInstance = await createWorkoutInstance(userId, {
      ...instanceData,
      workoutId,
    });
    return { workoutInstance };
  });
}

