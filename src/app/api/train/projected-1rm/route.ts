import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserProjected1RMs, createProjected1RM } from '@/lib/db/crud';

// GET /api/train/projected-1rm - Get user's projected 1RM log
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const exerciseId = getQueryParam(request.url, 'exerciseId');
    const projected1RMs = await getUserProjected1RMs(userId, exerciseId || undefined);
    return { projected1RMs };
  });
}

// POST /api/train/projected-1rm - Create a projected 1RM entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const projected1RMData = await parseBody(request);
    const projected1RM = await createProjected1RM(userId, projected1RMData);
    return { projected1RM };
  });
}

