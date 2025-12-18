import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutBlockExercises, createWorkoutBlockExercise, getWorkoutBlockById, getWorkoutById } from '@/lib/db/crud';
import type { WorkoutBlockExercise } from '@/types/train';

// GET /api/train/workouts/[workoutId]/blocks/[blockId]/exercises - Get all exercises for a block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId, blockId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(workoutId, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== workoutId) {
      return { error: 'Block not found' };
    }

    const exercises = await getWorkoutBlockExercises(blockId);
    return { exercises };
  });
}

// POST /api/train/workouts/[workoutId]/blocks/[blockId]/exercises - Add an exercise to a block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId, blockId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(workoutId, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== workoutId) {
      return { error: 'Block not found' };
    }

    const exerciseData = await parseBody<Omit<WorkoutBlockExercise, 'id' | 'exercise'> & { exercise: string }>(request);
    const exercise = await createWorkoutBlockExercise(blockId, exerciseData);
    return { exercise };
  });
}

