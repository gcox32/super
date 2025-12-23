import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserPreferences, upsertUserPreferences } from '@/lib/db/crud/user';

// GET /api/me/preferences - Get user preferences
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const preferences = await getUserPreferences(userId);
    return { preferences };
  });
}

// PATCH /api/me/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  return withAuth(async (userId) => {
    const updates = await parseBody(request);
    const preferences = await upsertUserPreferences(userId, updates);
    return { preferences };
  });
}

