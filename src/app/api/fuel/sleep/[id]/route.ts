import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateSleepInstance, deleteSleepInstance, getSleepInstanceById } from '@/lib/db/crud';

// GET /api/fuel/sleep/[id] - Get a sleep instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const sleepInstance = await getSleepInstanceById(id, userId);
    if (!sleepInstance) {
      return { error: 'Sleep instance not found', status: 404 };
    }
    return { sleepInstance };
  });
}

// PATCH /api/fuel/sleep/[id] - Update a sleep instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);

    // Convert strings to Date objects
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.startTime) updates.startTime = new Date(updates.startTime);
    if (updates.endTime) updates.endTime = new Date(updates.endTime);

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
