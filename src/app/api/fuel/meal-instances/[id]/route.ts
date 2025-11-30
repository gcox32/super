import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateMealInstance, deleteMealInstance } from '@/lib/db/crud';

// PATCH /api/fuel/meal-instances/[id] - Update a meal instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    const mealInstance = await updateMealInstance(id, userId, updates);
    if (!mealInstance) {
      return { error: 'Meal instance not found' };
    }
    return { mealInstance };
  });
}

// DELETE /api/fuel/meal-instances/[id] - Delete a meal instance (CASCADE deletes portioned food instances)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteMealInstance(id, userId);
    if (!deleted) {
      return { error: 'Meal instance not found' };
    }
    return { success: true };
  });
}

