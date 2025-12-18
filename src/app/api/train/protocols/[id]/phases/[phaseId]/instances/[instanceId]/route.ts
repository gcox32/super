import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhaseInstanceById, updatePhaseInstance, deletePhaseInstance } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/phases/[phaseId]/instances/[instanceId] - Get a specific phase instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const phaseInstance = await getPhaseInstanceById(instanceId, userId);
    if (!phaseInstance) {
      return { error: 'Phase instance not found' };
    }
    return { phaseInstance };
  });
}

// PATCH /api/train/protocols/[id]/phases/[phaseId]/instances/[instanceId] - Update a phase instance (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const updates = await parseBody(request);
    const phaseInstance = await updatePhaseInstance(instanceId, userId, updates);
    if (!phaseInstance) {
      return { error: 'Phase instance not found' };
    }
    return { phaseInstance };
  });
}

// DELETE /api/train/protocols/[id]/phases/[phaseId]/instances/[instanceId] - Delete a phase instance (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const deleted = await deletePhaseInstance(instanceId, userId);
    if (!deleted) {
      return { error: 'Phase instance not found' };
    }
    return { success: true };
  });
}

