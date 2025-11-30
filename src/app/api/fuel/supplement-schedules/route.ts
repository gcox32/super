import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserSupplementSchedules, createSupplementSchedule } from '@/lib/db/crud';

// GET /api/fuel/supplement-schedules - Get user's supplement schedules
export async function GET() {
  return withAuth(async (userId) => {
    const schedules = await getUserSupplementSchedules(userId);
    return { schedules };
  });
}

// POST /api/fuel/supplement-schedules - Create a supplement schedule
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const scheduleData = await parseBody(request);
    const schedule = await createSupplementSchedule(userId, scheduleData);
    return { schedule };
  });
}

