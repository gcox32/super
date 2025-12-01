import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWaterIntakeById, updateWaterIntake, deleteWaterIntake } from '@/lib/db/crud';
import type { WaterIntake } from '@/types/fuel';

// PATCH /api/fuel/water-intake/[id] - Update a water intake entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const intake = await getWaterIntakeById(id, userId);
    if (!intake) {
      return { error: 'Water intake not found' };
    }

    const updates = await parseBody<Partial<Omit<WaterIntake, 'id' | 'userId' | 'date'>>>(request);
    const updated = await updateWaterIntake(id, userId, updates);
    if (!updated) {
      return { error: 'Failed to update water intake' };
    }
    return { intake: updated };
  });
}

// DELETE /api/fuel/water-intake/[id] - Delete a water intake entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const intake = await getWaterIntakeById(id, userId);
    if (!intake) {
      return { error: 'Water intake not found' };
    }

    await deleteWaterIntake(id, userId);
    return { success: true };
  });
}

