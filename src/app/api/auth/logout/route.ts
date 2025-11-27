import { NextResponse } from 'next/server';

export async function POST() {
  // Logout is primarily handled client-side via localStorage
  // This endpoint exists for consistency and potential future server-side cleanup
  return NextResponse.json({ success: true });
}
