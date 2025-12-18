import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  getUserImages,
  createUserImage,
  getLatestUserImage,
} from '@/lib/db/crud';
import { getQueryParam } from '@/lib/api/helpers';

// GET /api/user/images - Get all user images (or latest if ?latest=true)
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const latest = getQueryParam(request.url, 'latest') === 'true';

    if (latest) {
      const image = await getLatestUserImage(userId);
      return { image };
    }

    const images = await getUserImages(userId);
    return { images };
  });
}

// POST /api/user/images - Create a new image entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const imageData = await parseBody(request);
    const image = await createUserImage(userId, imageData);
    return { image };
  });
}

