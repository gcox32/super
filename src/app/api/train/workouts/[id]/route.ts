import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWorkoutById, updateWorkout, deleteWorkout, getWorkoutWithExercises } from '@/lib/db/crud';

// GET /api/train/workouts/[id] - Get a specific workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const includeDetails = searchParams.get('details') === 'true';

    let workout;
    if (includeDetails) {
      workout = await getWorkoutWithExercises(id, userId);
    } else {
      workout = await getWorkoutById(id, userId);
    }

    if (!workout) {
      return { error: 'Workout not found' };
    }
    return { workout };
  });
}

// PATCH /api/train/workouts/[id] - Update a workout
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const workout = await updateWorkout(id, userId, updates);
    if (!workout) {
      return { error: 'Workout not found' };
    }
    return { workout };
  });
}

// DELETE /api/train/workouts/[id] - Delete a workout (CASCADE deletes blocks and exercises)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteWorkout(id, userId);
    if (!deleted) {
      return { error: 'Workout not found' };
    }
    return { success: true };
  });
}

