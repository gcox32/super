import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getWorkoutInstanceById } from '@/lib/db/crud';

// GET /api/train/workouts/instances/[id] - Get a specific workout instance by ID (direct lookup)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const workoutInstance = await getWorkoutInstanceById(id, userId);
    if (!workoutInstance) {
      const error: any = new Error('Workout instance not found');
      error.status = 404;
      throw error;
    }
    return { workoutInstance };
  });
}

