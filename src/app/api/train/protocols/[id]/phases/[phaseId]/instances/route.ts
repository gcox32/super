import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhaseInstances, createPhaseInstance } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/phases/[phaseId]/instances - Get phase instances for a specific phase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  return withAuth(async (userId) => {
    const { phaseId } = await params;
    const phaseInstances = await getPhaseInstances(userId, { phaseId });
    return { phaseInstances };
  });
}

// POST /api/train/protocols/[id]/phases/[phaseId]/instances - Create a phase instance for this phase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  return withAuth(async (userId) => {
    const { phaseId } = await params;
    const phaseInstanceData = await parseBody(request);
    const phaseInstance = await createPhaseInstance(userId, {
      ...phaseInstanceData,
      phaseId,
    });
    return { phaseInstance };
  });
}

