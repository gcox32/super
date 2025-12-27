import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { createFood, getFoods, searchFoods } from '@/lib/db/crud/fuel';

// GET /api/fuel/foods - Get all foods
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const query = getQueryParam(request.url, 'q');
    const pageParam = getQueryParam(request.url, 'page');
    const limitParam = getQueryParam(request.url, 'limit');

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;
    if (query) {
      const { foods, total } = await searchFoods(query, page, limit);
      return { foods, total, page, limit };
    }

    const { foods, total } = await getFoods(page, limit);
    return { foods, total, page, limit };
  });
}

// POST /api/fuel/foods - Create a new food
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newFood = await createFood(body);
    return newFood;
  });
}

