import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserProfile, createUserProfile, updateUserProfile, getUserById } from '@/lib/db/crud';

// GET /api/user/profile - Get current user's profile
export async function GET() {
  return withAuth(async (userId) => {
    const profile = await getUserProfile(userId);
    if (!profile) {
      return { profile: null };
    }
    return { profile };
  });
}

// POST /api/user/profile - Create user profile
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const profileData = await parseBody(request);

    // Ensure we always have an email value for the profile row
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await createUserProfile(userId, {
      ...profileData,
      email: user.email,
    });
    return { profile };
  });
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  return withAuth(async (userId) => {
    const updates = await parseBody(request);
    const profile = await updateUserProfile(userId, updates);
    if (!profile) {
      return { error: 'Profile not found' };
    }
    return { profile };
  });
}

