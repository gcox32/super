# Database Setup Guide

## Quick Start: Using Supabase Dashboard

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run migrations in order**
   Run each migration file in sequence:

   **Migration 1: Initial Schema**
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Verify success ✅

   **Migration 2: Fuel Schema**
   - Copy the contents of `supabase/migrations/002_fuel_schema.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify success ✅

   **Migration 3: Triggers and Functions**
   - Copy the contents of `supabase/migrations/003_triggers_and_functions.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify success ✅

   **Migration 4: Row Level Security**
   - Copy the contents of `supabase/migrations/004_row_level_security.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify success ✅

4. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see tables in schemas: `public`, `train`, `fuel`, `anatomy`

## Verify Setup

After running migrations, verify everything is set up correctly:

1. **Check tables exist:**
   ```sql
   SELECT table_schema, table_name 
   FROM information_schema.tables 
   WHERE table_schema IN ('public', 'train', 'fuel', 'anatomy')
   ORDER BY table_schema, table_name;
   ```

2. **Check RLS is enabled:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname IN ('public', 'train', 'fuel', 'anatomy')
   ORDER BY schemaname, tablename;
   ```

3. **Test connection:**
   Make sure your `POSTGRES_URL` environment variable is set:
   ```bash
   echo $POSTGRES_URL
   ```

## Environment Variables

Make sure you have these set in your `.env.local`:

```env
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings → API.

## Troubleshooting

### Migration fails with "relation already exists"
- Some tables might already exist. You can either:
  - Drop existing tables and re-run migrations
  - Skip the CREATE TABLE statements for existing tables

### RLS policies not working
- Make sure you ran migration `004_row_level_security.sql`
- Verify RLS is enabled: `SELECT * FROM pg_tables WHERE rowsecurity = true;`

### Connection errors
- Verify your `POSTGRES_URL` is correct
- Check that your IP is allowed in Supabase dashboard (Settings → Database → Connection Pooling)

