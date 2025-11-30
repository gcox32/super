import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserProtocolInstances, createProtocolInstance } from '@/lib/db/crud';

// GET /api/train/protocol-instances - Get user's protocol instances
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const activeOnly = getQueryParam(request.url, 'activeOnly') === 'true';
    const instances = await getUserProtocolInstances(userId, activeOnly);
    return { instances };
  });
}

// POST /api/train/protocol-instances - Create a protocol instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody(request);
    const protocolInstance = await createProtocolInstance(userId, instanceData);
    return { protocolInstance };
  });
}

