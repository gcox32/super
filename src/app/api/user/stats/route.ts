import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  getUserStats,
  createUserStats,
  getLatestUserStats,
  getUserStatsById,
  deleteUserStats,
} from '@/lib/db/crud';
import { getQueryParam } from '@/lib/api/helpers';

// GET /api/user/stats - Get all user stats (or latest if ?latest=true)
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const latest = getQueryParam(request.url, 'latest') === 'true';

    if (latest) {
      const stats = await getLatestUserStats(userId);
      return { stats };
    }

    const stats = await getUserStats(userId);
    return { stats };
  });
}

// POST /api/user/stats - Create a new stats entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const statsData = await parseBody(request);
    const stats = await createUserStats(userId, statsData);
    return { stats };
  });
}

