import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhaseInstances, createPhaseInstance } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/instances/[instanceId]/phase-instances - Get phase instances for a protocol instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const phaseInstances = await getPhaseInstances(userId, { protocolInstanceId: instanceId });
    return { phaseInstances };
  });
}

// POST /api/train/protocols/[id]/instances/[instanceId]/phase-instances - Create a phase instance (requires auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const phaseInstanceData = await parseBody(request);
    const phaseInstance = await createPhaseInstance(userId, {
      ...phaseInstanceData,
      protocolInstanceId: instanceId,
    });
    return { phaseInstance };
  });
}

