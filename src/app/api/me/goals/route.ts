import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  getUserGoals,
  createUserGoal,
  getUserGoalById,
  updateUserGoal,
  deleteUserGoal,
} from '@/lib/db/crud';

// GET /api/user/goals - Get all user goals
export async function GET() {
  return withAuth(async (userId) => {
    const goals = await getUserGoals(userId);
    return { goals };
  });
}

// POST /api/user/goals - Create a new goal
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const goalData = await parseBody(request);
    const goal = await createUserGoal(userId, goalData);
    return { goal };
  });
}

