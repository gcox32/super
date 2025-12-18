import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import {
  getWorkoutBlockExerciseInstances,
  createWorkoutBlockExerciseInstance,
} from '@/lib/db/crud';
import type { WorkoutBlockExerciseInstance } from '@/types/train';

// GET /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances - Get exercise instances for a specific exercise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string }> }
) {
  return withAuth(async () => {
    const { exerciseId } = await params;
    const workoutBlockInstanceId = getQueryParam(
      request.url,
      'workoutBlockInstanceId'
    );
    if (!workoutBlockInstanceId) {
      throw new Error('workoutBlockInstanceId is required');
    }

    const instances = await getWorkoutBlockExerciseInstances(
      workoutBlockInstanceId
    );
    // Filter to instances for this specific exercise
    const filteredInstances = instances.filter(
      (inst: any) => inst.workoutBlockExerciseId === exerciseId
    );
    return { instances: filteredInstances };
  });
}

// POST /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances - Create an exercise instance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string }> }
) {
  return withAuth(async (userId) => {
    const { exerciseId } = await params;
    const instanceData = await parseBody<
      Omit<WorkoutBlockExerciseInstance, 'id' | 'userId'>
    >(request);
    const instance = await createWorkoutBlockExerciseInstance(
      userId,
      {
        ...instanceData,
        workoutBlockExerciseId: exerciseId,
      }
    );
    return { instance };
  });
}


