import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getProtocolInstanceById, updateProtocolInstance, deleteProtocolInstance } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/instances/[instanceId] - Get a specific protocol instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const protocolInstance = await getProtocolInstanceById(instanceId, userId);
    if (!protocolInstance) {
      return { error: 'Protocol instance not found' };
    }
    return { protocolInstance };
  });
}

// PATCH /api/train/protocols/[id]/instances/[instanceId] - Update a protocol instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const updates = await parseBody(request);
    const protocolInstance = await updateProtocolInstance(instanceId, userId, updates);
    if (!protocolInstance) {
      return { error: 'Protocol instance not found' };
    }
    return { protocolInstance };
  });
}

// DELETE /api/train/protocols/[id]/instances/[instanceId] - Delete a protocol instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const deleted = await deleteProtocolInstance(instanceId, userId);
    if (!deleted) {
      return { error: 'Protocol instance not found' };
    }
    return { success: true };
  });
}

