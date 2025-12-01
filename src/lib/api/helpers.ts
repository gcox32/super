import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/db/auth';

/**
 * Wrapper for API routes that require authentication
 */
export async function withAuth<T>(
  handler: (userId: string) => Promise<T>
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    const result = await handler(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse JSON body from request
 */
export async function parseBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
}

