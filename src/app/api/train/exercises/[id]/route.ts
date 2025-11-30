import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getExerciseById, updateExercise } from '@/lib/db/crud';

// GET /api/train/exercises/[id] - Get a specific exercise (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exercise = await getExerciseById(id);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    return NextResponse.json({ exercise });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/train/exercises/[id] - Update an exercise (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const updates = await parseBody(request);
    const exercise = await updateExercise(id, updates);
    if (!exercise) {
      return { error: 'Exercise not found' };
    }
    return { exercise };
  });
}

