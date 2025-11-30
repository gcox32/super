import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getGroceryListById, deleteGroceryList } from '@/lib/db/crud';

// GET /api/fuel/grocery-lists/[id] - Get a specific grocery list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const groceryList = await getGroceryListById(id, userId);
    if (!groceryList) {
      return { error: 'Grocery list not found' };
    }
    return { groceryList };
  });
}

// DELETE /api/fuel/grocery-lists/[id] - Delete a grocery list (CASCADE deletes items)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteGroceryList(id, userId);
    if (!deleted) {
      return { error: 'Grocery list not found' };
    }
    return { success: true };
  });
}

