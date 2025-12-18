import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutInstanceById, updateWorkoutInstance, deleteWorkoutInstance } from '@/lib/db/crud';

// GET /api/train/workouts/[workoutId]/instances/[id] - Get a specific workout instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const workoutInstance = await getWorkoutInstanceById(id, userId);
    if (!workoutInstance) {
      // Throw an error that withAuth will catch and convert to 404
      const error: any = new Error('Workout instance not found');
      error.status = 404;
      throw error;
    }
    
    // Return plain object - withAuth will wrap it in NextResponse.json()
    return { workoutInstance };
  });
}

// PATCH /api/train/workouts/[workoutId]/instances/[id] - Update a workout instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; id: string }> }
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

// DELETE /api/train/workouts/[workoutId]/instances/[id] - Delete a workout instance (CASCADE deletes block instances)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; id: string }> }
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

