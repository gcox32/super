import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserSleepInstances, createSleepInstance } from '@/lib/db/crud';

// GET /api/fuel/sleep - Get user's sleep log
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const sleepInstances = await getUserSleepInstances(userId, options);
    return { sleepInstances };
  });
}

// POST /api/fuel/sleep - Create a sleep instance
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const sleepData = await parseBody(request);
    const sleepInstance = await createSleepInstance(userId, sleepData);
    return { sleepInstance };
  });
}

