import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserGroceryLists, createGroceryList } from '@/lib/db/crud';

// GET /api/fuel/grocery-lists - Get user's grocery lists
export async function GET() {
  return withAuth(async (userId) => {
    const groceryLists = await getUserGroceryLists(userId);
    return { groceryLists };
  });
}

// POST /api/fuel/grocery-lists - Create a grocery list
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const groceryListData = await parseBody(request);
    const groceryList = await createGroceryList(userId, groceryListData);
    return { groceryList };
  });
}

