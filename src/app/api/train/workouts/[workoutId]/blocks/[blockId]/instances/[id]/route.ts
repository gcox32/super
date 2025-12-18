import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutBlockInstanceById, updateWorkoutBlockInstance, deleteWorkoutBlockInstance } from '@/lib/db/crud';
import type { WorkoutBlockInstance } from '@/types/train';

// GET /api/train/workouts/[workoutId]/blocks/[blockId]/instances/[id] - Get a specific workout block instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const instance = await getWorkoutBlockInstanceById(id, userId);
    if (!instance) {
      return { error: 'Workout block instance not found' };
    }
    return { instance };
  });
}

// PATCH /api/train/workouts/[workoutId]/blocks/[blockId]/instances/[id] - Update a workout block instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const instance = await getWorkoutBlockInstanceById(id, userId);
    if (!instance) {
      return { error: 'Workout block instance not found' };
    }

    const updates = await parseBody<Partial<Omit<WorkoutBlockInstance, 'id' | 'userId' | 'workoutBlockId' | 'workoutInstanceId' | 'date'>>>(request);
    const updated = await updateWorkoutBlockInstance(id, userId, updates);
    if (!updated) {
      return { error: 'Failed to update workout block instance' };
    }
    return { instance: updated };
  });
}

// DELETE /api/train/workouts/[workoutId]/blocks/[blockId]/instances/[id] - Delete a workout block instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const instance = await getWorkoutBlockInstanceById(id, userId);
    if (!instance) {
      return { error: 'Workout block instance not found' };
    }

    await deleteWorkoutBlockInstance(id, userId);
    return { success: true };
  });
}

