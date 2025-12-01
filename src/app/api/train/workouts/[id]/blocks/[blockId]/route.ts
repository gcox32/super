import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutBlockById, updateWorkoutBlock, deleteWorkoutBlock, getWorkoutById } from '@/lib/db/crud';
import type { WorkoutBlock } from '@/types/train';

// GET /api/train/workouts/[id]/blocks/[blockId] - Get a specific block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, blockId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block) {
      return { error: 'Block not found' };
    }

    // Verify block belongs to workout
    if (block.workoutId !== id) {
      return { error: 'Block does not belong to this workout' };
    }

    return { block };
  });
}

// PATCH /api/train/workouts/[id]/blocks/[blockId] - Update a block
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, blockId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== id) {
      return { error: 'Block not found' };
    }

    const updates = await parseBody<Partial<Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'>>>(request);
    const updated = await updateWorkoutBlock(blockId, updates);
    if (!updated) {
      return { error: 'Failed to update block' };
    }
    return { block: updated };
  });
}

// DELETE /api/train/workouts/[id]/blocks/[blockId] - Delete a block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, blockId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== id) {
      return { error: 'Block not found' };
    }

    await deleteWorkoutBlock(blockId);
    return { success: true };
  });
}

