import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateProtocolInstance, deleteProtocolInstance } from '@/lib/db/crud';

// PATCH /api/train/protocol-instances/[id] - Update a protocol instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const protocolInstance = await updateProtocolInstance(id, userId, updates);
    if (!protocolInstance) {
      return { error: 'Protocol instance not found' };
    }
    return { protocolInstance };
  });
}

// DELETE /api/train/protocol-instances/[id] - Delete a protocol instance (CASCADE deletes workout instances)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteProtocolInstance(id, userId);
    if (!deleted) {
      return { error: 'Protocol instance not found' };
    }
    return { success: true };
  });
}

