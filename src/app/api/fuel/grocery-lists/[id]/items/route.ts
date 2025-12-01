import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getGroceryListItems, addPortionedFoodToGroceryList, removePortionedFoodFromGroceryList, getGroceryListById } from '@/lib/db/crud';

// GET /api/fuel/grocery-lists/[id]/items - Get all items for a grocery list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const list = await getGroceryListById(id, userId);
    if (!list) {
      return { error: 'Grocery list not found' };
    }

    const items = await getGroceryListItems(id);
    return { items };
  });
}

// POST /api/fuel/grocery-lists/[id]/items - Add an item to a grocery list
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const list = await getGroceryListById(id, userId);
    if (!list) {
      return { error: 'Grocery list not found' };
    }

    const { portionedFoodId, order } = await parseBody<{ portionedFoodId: string; order: number }>(request);
    await addPortionedFoodToGroceryList(id, portionedFoodId, order);
    return { success: true };
  });
}

// DELETE /api/fuel/grocery-lists/[id]/items - Remove an item from a grocery list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const list = await getGroceryListById(id, userId);
    if (!list) {
      return { error: 'Grocery list not found' };
    }

    const { portionedFoodId } = await parseBody<{ portionedFoodId: string }>(request);
    await removePortionedFoodFromGroceryList(id, portionedFoodId);
    return { success: true };
  });
}

