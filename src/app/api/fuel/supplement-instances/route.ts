import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserSupplementInstances, createSupplementInstance } from '@/lib/db/crud';

// GET /api/fuel/supplement-instances - Get user's supplement instances
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const supplementScheduleId = getQueryParam(request.url, 'supplementScheduleId');
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (supplementScheduleId) options.supplementScheduleId = supplementScheduleId;
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const instances = await getUserSupplementInstances(userId, options);
    return { instances };
  });
}

// POST /api/fuel/supplement-instances - Create a supplement instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody(request);
    const instance = await createSupplementInstance(userId, instanceData);
    return { instance };
  });
}

