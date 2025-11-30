import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateSleepInstance, deleteSleepInstance } from '@/lib/db/crud';

// PATCH /api/fuel/sleep/[id] - Update a sleep instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const sleepInstance = await updateSleepInstance(id, userId, updates);
    if (!sleepInstance) {
      return { error: 'Sleep instance not found' };
    }
    return { sleepInstance };
  });
}

// DELETE /api/fuel/sleep/[id] - Delete a sleep instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteSleepInstance(id, userId);
    if (!deleted) {
      return { error: 'Sleep instance not found' };
    }
    return { success: true };
  });
}

