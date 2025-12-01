import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getRecipeIngredients, addIngredientToRecipe, removeIngredientFromRecipe, getRecipeById } from '@/lib/db/crud';

// GET /api/fuel/recipes/[id]/ingredients - Get all ingredients for a recipe (public)
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

    const ingredients = await getRecipeIngredients(id);
    return NextResponse.json({ ingredients });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fuel/recipes/[id]/ingredients - Add an ingredient to a recipe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return { error: 'Recipe not found' };
    }

    const { portionedFoodId, order } = await parseBody<{ portionedFoodId: string; order: number }>(request);
    await addIngredientToRecipe(id, portionedFoodId, order);
    return { success: true };
  });
}

// DELETE /api/fuel/recipes/[id]/ingredients - Remove an ingredient from a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return { error: 'Recipe not found' };
    }

    const { portionedFoodId } = await parseBody<{ portionedFoodId: string }>(request);
    await removeIngredientFromRecipe(id, portionedFoodId);
    return { success: true };
  });
}

