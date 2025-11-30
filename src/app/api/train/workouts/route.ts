import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserWorkouts, createWorkout } from '@/lib/db/crud';

// GET /api/train/workouts - Get user's workouts
export async function GET() {
  return withAuth(async (userId) => {
    const workouts = await getUserWorkouts(userId);
    return { workouts };
  });
}

// POST /api/train/workouts - Create a new workout
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const workoutData = await parseBody(request);
    const workout = await createWorkout(userId, workoutData);
    return { workout };
  });
}

