import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getFoods, createFood, searchFoods } from '@/lib/db/crud';
import type { Food } from '@/types/fuel';

// GET /api/fuel/foods - Get all foods (public, no auth required for read)
export async function GET(request: NextRequest) {
  try {
    const query = getQueryParam(request.url, 'q');
    
    if (query) {
      const foods = await searchFoods(query);
      return NextResponse.json({ foods });
    }

    const foods = await getFoods();
    return NextResponse.json({ foods });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fuel/foods - Create a food (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const foodData = await parseBody<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>(request);
    const food = await createFood(foodData);
    return { food };
  });
}

