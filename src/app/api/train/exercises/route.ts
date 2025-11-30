import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getExercises, createExercise, searchExercises } from '@/lib/db/crud';

// GET /api/train/exercises - Get all exercises (public, no auth required for read)
export async function GET(request: NextRequest) {
  try {
    const query = getQueryParam(request.url, 'q');
    
    if (query) {
      const exercises = await searchExercises(query);
      return NextResponse.json({ exercises });
    }

    const exercises = await getExercises();
    return NextResponse.json({ exercises });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/exercises - Create an exercise (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const exerciseData = await parseBody(request);
    const exercise = await createExercise(exerciseData);
    return { exercise };
  });
}

