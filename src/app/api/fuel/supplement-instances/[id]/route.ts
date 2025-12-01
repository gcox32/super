import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getSupplementInstanceById, updateSupplementInstance, deleteSupplementInstance } from '@/lib/db/crud';
import type { SupplementInstance } from '@/types/fuel';

// PATCH /api/fuel/supplement-instances/[id] - Update a supplement instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const instance = await getSupplementInstanceById(id, userId);
    if (!instance) {
      return { error: 'Supplement instance not found' };
    }

    const updates = await parseBody<Partial<Omit<SupplementInstance, 'id' | 'userId' | 'supplementScheduleId' | 'supplementId' | 'date'>>>(request);
    const updated = await updateSupplementInstance(id, userId, updates);
    if (!updated) {
      return { error: 'Failed to update supplement instance' };
    }
    return { instance: updated };
  });
}

// DELETE /api/fuel/supplement-instances/[id] - Delete a supplement instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const instance = await getSupplementInstanceById(id, userId);
    if (!instance) {
      return { error: 'Supplement instance not found' };
    }

    await deleteSupplementInstance(id, userId);
    return { success: true };
  });
}

