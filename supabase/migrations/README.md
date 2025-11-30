# Database Migrations

This directory contains SQL migration scripts for setting up the database schema in Supabase.

## Migration Files

1. **001_initial_schema.sql** - Creates the initial database schema including:
   - Public schema (user domain)
   - Anatomy schema (reference data)
   - Train schema (training and exercise data)

2. **002_fuel_schema.sql** - Creates the fuel schema for:
   - Meal plans and meals
   - Foods and portioned foods
   - Recipes
   - Grocery lists
   - Meal instances
   - Supplements
   - Water intake and sleep tracking

3. **003_triggers_and_functions.sql** - Sets up:
   - `updated_at` timestamp triggers for all tables

4. **004_row_level_security.sql** - Configures:
   - Row Level Security (RLS) policies
   - User access policies (users can only access their own data)
   - Public read access for reference data (exercises, foods, muscle groups)

## Running Migrations

### Using Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001, 002, 003, 004)
4. Verify that all tables, indexes, and policies are created

### Using Drizzle Kit

You can also generate migrations from the Drizzle schema:

```bash
npx drizzle-kit generate:pg
```

This will generate migration files in the `drizzle` directory based on your schema files in `src/lib/db/schema/`.

## Important Notes

- **Order matters**: Run migrations in numerical order (001, 002, 003, 004)
- **RLS is enabled**: All tables have Row Level Security enabled. Users can only access their own data.
- **Foreign keys**: The `user.id` field references `auth.users.id` from Supabase Auth
- **Cascade deletes**: Instance tables have CASCADE delete rules to maintain referential integrity
- **JSONB fields**: Measurements, macros, micros, and other complex data are stored as JSONB

## Environment Variables

Make sure you have the following environment variables set:

- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Verifying the Schema

After running migrations, you can verify the schema by:

1. Checking the Supabase dashboard → Database → Tables
2. Running a query to list all tables:
   ```sql
   SELECT table_schema, table_name 
   FROM information_schema.tables 
   WHERE table_schema IN ('public', 'train', 'fuel', 'anatomy')
   ORDER BY table_schema, table_name;
   ```

