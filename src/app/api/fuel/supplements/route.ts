import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getSupplements, createSupplement } from '@/lib/db/crud';

// GET /api/fuel/supplements - Get all supplements (public)
export async function GET() {
  try {
    const supplements = await getSupplements();
    return NextResponse.json({ supplements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/fuel/supplements - Create a supplement (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const supplementData = await parseBody(request);
    const supplement = await createSupplement(supplementData);
    return { supplement };
  });
}

