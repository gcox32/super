import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getProtocolById, updateProtocol, deleteProtocol } from '@/lib/db/crud';

// GET /api/train/protocols/[id] - Get a specific protocol (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const protocol = await getProtocolById(id);
    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }
    return NextResponse.json({ protocol });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/train/protocols/[id] - Update a protocol (requires auth)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const updates = await parseBody(request);
    const protocol = await updateProtocol(id, updates);
    if (!protocol) {
      return { error: 'Protocol not found' };
    }
    return { protocol };
  });
}

// DELETE /api/train/protocols/[id] - Delete a protocol (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const deleted = await deleteProtocol(id);
    if (!deleted) {
      return { error: 'Protocol not found' };
    }
    return { success: true };
  });
}

