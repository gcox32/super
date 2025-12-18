import { NextRequest } from 'next/server';
import { withAuth, getQueryParam } from '@/lib/api/helpers';
import { getUserProtocolInstances } from '@/lib/db/crud/train';

// GET /api/train/protocols/instances - Get all user's protocol instances (across all protocols)
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const activeOnly = getQueryParam(request.url, 'activeOnly') === 'true';
    const instances = await getUserProtocolInstances(userId, activeOnly);
    return { instances };
  });
}

