import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getProtocols, createProtocol } from '@/lib/db/crud';

// GET /api/train/protocols - Get all protocols (public)
export async function GET() {
  try {
    const protocols = await getProtocols();
    return NextResponse.json({ protocols });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/protocols - Create a protocol (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const protocolData = await parseBody(request);
    const protocol = await createProtocol(protocolData);
    return { protocol };
  });
}

