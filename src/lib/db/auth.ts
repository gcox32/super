import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { user } from './schema';

/**
 * Get the current authenticated user from Supabase auth
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    return null;
  }

  // Get the user record from our database
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, authUser.id))
    .limit(1);

  return dbUser || null;
}

/**
 * Get the current user ID from Supabase auth
 * Throws if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error('Unauthorized');
  }

  return authUser.id;
}

