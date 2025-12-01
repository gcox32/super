import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from environment variables
const connectionString = process.env.POSTGRES_URL!;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };

