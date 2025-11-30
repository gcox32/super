import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getFoodById, updateFood } from '@/lib/db/crud';

// GET /api/fuel/foods/[id] - Get a specific food (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const food = await getFoodById(id);
    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }
    return NextResponse.json({ food });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/fuel/foods/[id] - Update a food (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const updates = await parseBody(request);
    const food = await updateFood(id, updates);
    if (!food) {
      return { error: 'Food not found' };
    }
    return { food };
  });
}

