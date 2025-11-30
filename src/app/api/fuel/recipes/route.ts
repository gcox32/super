import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getRecipes, createRecipe } from '@/lib/db/crud';

// GET /api/fuel/recipes - Get all recipes (public)
export async function GET() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json({ recipes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fuel/recipes - Create a recipe (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const recipeData = await parseBody(request);
    const recipe = await createRecipe(recipeData);
    return { recipe };
  });
}

