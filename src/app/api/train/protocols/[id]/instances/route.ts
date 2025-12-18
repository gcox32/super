import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserProtocolInstances, createProtocolInstance } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/instances - Get user's protocol instances for a specific protocol
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const activeOnly = getQueryParam(request.url, 'activeOnly') === 'true';
    const instances = await getUserProtocolInstances(userId, activeOnly);
    // Filter to only instances of this protocol
    const filteredInstances = instances.filter(instance => instance.protocolId === id);
    return { instances: filteredInstances };
  });
}

// POST /api/train/protocols/[id]/instances - Create a protocol instance for this protocol
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const instanceData = await parseBody(request);
    const protocolInstance = await createProtocolInstance(userId, {
      ...instanceData,
      protocolId: id,
    });
    return { protocolInstance };
  });
}

