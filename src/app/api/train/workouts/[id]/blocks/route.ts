import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutBlocks, createWorkoutBlock, getWorkoutById } from '@/lib/db/crud';
import type { WorkoutBlock } from '@/types/train';

// GET /api/train/workouts/[id]/blocks - Get all blocks for a workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const blocks = await getWorkoutBlocks(id);
    return { blocks };
  });
}

// POST /api/train/workouts/[id]/blocks - Create a new block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const blockData = await parseBody<Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'>>(request);
    const block = await createWorkoutBlock(id, blockData);
    return { block };
  });
}

