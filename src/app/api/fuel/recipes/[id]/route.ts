import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getRecipeById, updateRecipe } from '@/lib/db/crud';

// GET /api/fuel/recipes/[id] - Get a specific recipe (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ recipe });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/fuel/recipes/[id] - Update a recipe (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const updates = await parseBody(request);
    const recipe = await updateRecipe(id, updates);
    if (!recipe) {
      return { error: 'Recipe not found' };
    }
    return { recipe };
  });
}

