import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getUserStatsById, deleteUserStats } from '@/lib/db/crud';

// GET /api/user/stats/[id] - Get a specific stats entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const stats = await getUserStatsById(id, userId);
    if (!stats) {
      return { error: 'Stats not found' };
    }
    return { stats };
  });
}

// DELETE /api/user/stats/[id] - Delete a stats entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteUserStats(id, userId);
    if (!deleted) {
      return { error: 'Stats not found' };
    }
    return { success: true };
  });
}

