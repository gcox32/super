import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getUserImageById, deleteUserImage } from '@/lib/db/crud';

// GET /api/user/images/[id] - Get a specific image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const image = await getUserImageById(id, userId);
    if (!image) {
      return { error: 'Image not found' };
    }
    return { image };
  });
}

// DELETE /api/user/images/[id] - Delete an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteUserImage(id, userId);
    if (!deleted) {
      return { error: 'Image not found' };
    }
    return { success: true };
  });
}

