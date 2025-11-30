import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateWorkoutInstance, deleteWorkoutInstance } from '@/lib/db/crud';

// PATCH /api/train/workout-instances/[id] - Update a workout instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const workoutInstance = await updateWorkoutInstance(id, userId, updates);
    if (!workoutInstance) {
      return { error: 'Workout instance not found' };
    }
    return { workoutInstance };
  });
}

// DELETE /api/train/workout-instances/[id] - Delete a workout instance (CASCADE deletes block instances)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteWorkoutInstance(id, userId);
    if (!deleted) {
      return { error: 'Workout instance not found' };
    }
    return { success: true };
  });
}

