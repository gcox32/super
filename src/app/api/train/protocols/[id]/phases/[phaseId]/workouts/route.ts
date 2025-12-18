import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhaseWorkouts, updatePhase } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/phases/[phaseId]/workouts - Get workouts for a phase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  try {
    const { phaseId } = await params;
    const workouts = await getPhaseWorkouts(phaseId);
    return NextResponse.json({ workouts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/protocols/[id]/phases/[phaseId]/workouts - Set workoutIds for a phase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  return withAuth(async () => {
    const { phaseId } = await params;
    const { workoutIds } = await parseBody(request);
    
    if (!Array.isArray(workoutIds)) {
      return { error: 'workoutIds must be an array' };
    }

    const updatedPhase = await updatePhase(phaseId, { workoutIds });
    if (!updatedPhase) {
      return { error: 'Phase not found' };
    }
    return { phase: updatedPhase };
  });
}

