import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhaseById, updatePhase, deletePhase } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/phases/[phaseId] - Get a specific phase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  try {
    const { phaseId } = await params;
    const phase = await getPhaseById(phaseId);
    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    return NextResponse.json({ phase });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/train/protocols/[id]/phases/[phaseId] - Update a phase (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  return withAuth(async () => {
    const { phaseId } = await params;
    const updates = await parseBody(request);
    const phase = await updatePhase(phaseId, updates);
    if (!phase) {
      return { error: 'Phase not found' };
    }
    return { phase };
  });
}

// DELETE /api/train/protocols/[id]/phases/[phaseId] - Delete a phase (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  return withAuth(async () => {
    const { phaseId } = await params;
    const deleted = await deletePhase(phaseId);
    if (!deleted) {
      return { error: 'Phase not found' };
    }
    return { success: true };
  });
}

