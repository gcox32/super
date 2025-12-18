import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getPhases, createPhase } from '@/lib/db/crud/train';

// GET /api/train/protocols/[id]/phases - Get phases for a protocol
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const phases = await getPhases(id);
    return NextResponse.json({ phases });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/protocols/[id]/phases - Create a phase for a protocol (requires auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const phaseData = await parseBody(request);
    const phase = await createPhase({
      ...phaseData,
      protocolId: id,
    });
    return { phase };
  });
}

