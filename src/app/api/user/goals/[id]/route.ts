import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserGoalById, updateUserGoal, deleteUserGoal } from '@/lib/db/crud';

// GET /api/user/goals/[id] - Get a specific goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await getUserGoalById(id, userId);
    if (!goal) {
      return { error: 'Goal not found' };
    }
    return { goal };
  });
}

// PATCH /api/user/goals/[id] - Update a goal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const goal = await updateUserGoal(id, userId, updates);
    if (!goal) {
      return { error: 'Goal not found' };
    }
    return { goal };
  });
}

// DELETE /api/user/goals/[id] - Delete a goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteUserGoal(id, userId);
    if (!deleted) {
      return { error: 'Goal not found' };
    }
    return { success: true };
  });
}

