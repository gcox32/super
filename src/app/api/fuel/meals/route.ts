import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { createMeal, getMeals, searchMeals } from '@/lib/db/crud/fuel';

// GET /api/fuel/meals - Get all meals
export async function GET(request: NextRequest) {
    return withAuth(async (userId) => {
      
        const query = getQueryParam(request.url, 'q');
        const pageParam = getQueryParam(request.url, 'page');
        const limitParam = getQueryParam(request.url, 'limit');

        const page = pageParam ? parseInt(pageParam) : 1;
        const limit = limitParam ? parseInt(limitParam) : 20;

        if (query) {
          const { meals, total } = await searchMeals(query, page, limit);
          return { meals, total, page, limit };
        }
        
        const { meals, total } = await getMeals(userId, null, page, limit);
        return { meals, total, page, limit };
    });
}

// POST /api/fuel/meals - Create a new meal
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newMeal = await createMeal(userId, body);
    return newMeal;
  });
}
