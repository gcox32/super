import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutBlocks, createWorkoutBlock, getWorkoutById } from '@/lib/db/crud';
import type { WorkoutBlock } from '@/types/train';

// GET /api/train/workouts/[workoutId]/blocks - Get all blocks for a workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(workoutId, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const blocks = await getWorkoutBlocks(workoutId);
    return { blocks };
  });
}

// POST /api/train/workouts/[workoutId]/blocks - Create a new block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  return withAuth(async (userId) => {
    const { workoutId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(workoutId, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const blockData = await parseBody<Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'>>(request);
    const block = await createWorkoutBlock(workoutId, blockData);
    return { block };
  });
}

