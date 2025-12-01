import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateWorkoutBlockExercise, deleteWorkoutBlockExercise, getWorkoutBlockById, getWorkoutById } from '@/lib/db/crud';
import type { WorkoutBlockExercise } from '@/types/train';

// PATCH /api/train/workouts/[id]/blocks/[blockId]/exercises/[exerciseId] - Update an exercise in a block
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string; exerciseId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, blockId, exerciseId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== id) {
      return { error: 'Block not found' };
    }

    const updates = await parseBody<Partial<Omit<WorkoutBlockExercise, 'id' | 'workoutBlockId' | 'exercise'>>>(request);
    const updated = await updateWorkoutBlockExercise(exerciseId, updates);
    if (!updated) {
      return { error: 'Exercise not found' };
    }
    return { exercise: updated };
  });
}

// DELETE /api/train/workouts/[id]/blocks/[blockId]/exercises/[exerciseId] - Remove an exercise from a block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string; exerciseId: string }> }
) {
  return withAuth(async (userId) => {
    const { id, blockId, exerciseId } = await params;
    
    // Verify workout belongs to user
    const workout = await getWorkoutById(id, userId);
    if (!workout) {
      return { error: 'Workout not found' };
    }

    const block = await getWorkoutBlockById(blockId);
    if (!block || block.workoutId !== id) {
      return { error: 'Block not found' };
    }

    await deleteWorkoutBlockExercise(exerciseId);
    return { success: true };
  });
}

