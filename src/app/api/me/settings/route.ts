import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserSettings, upsertUserSettings } from '@/lib/db/crud/user';

// GET /api/me/settings - Get user settings
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const settings = await getUserSettings(userId);
    return { settings };
  });
}

// PATCH /api/me/settings - Update user settings
export async function PATCH(request: NextRequest) {
  return withAuth(async (userId) => {
    const updates = await parseBody(request);
    const settings = await upsertUserSettings(userId, updates);
    return { settings };
  });
}

