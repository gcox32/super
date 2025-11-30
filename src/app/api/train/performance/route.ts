import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserPerformances, createPerformance } from '@/lib/db/crud';

// GET /api/train/performance - Get user's performance log
export async function GET() {
  return withAuth(async (userId) => {
    const performances = await getUserPerformances(userId);
    return { performances };
  });
}

// POST /api/train/performance - Create a performance entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const performanceData = await parseBody(request);
    const performance = await createPerformance(userId, performanceData);
    return { performance };
  });
}

