# Database Migrations

This directory contains SQL migration scripts for setting up the database schema in Supabase.

## Quick Start: Fresh Database Setup

For **new database setups**, use the consolidated schema file:

**`000_complete_schema.sql`** - Complete database schema initialization
- Contains all tables, indexes, triggers, and RLS policies in their final state
- Incorporates all changes from migrations 001-024
- Use this for fresh database installations instead of running migrations sequentially

## Migration Files (For Existing Databases)

For existing databases, run migrations in numerical order:

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

5. **005_add_parent_exercise.sql** - Adds parent exercise relationship

6. **006_add_variable_equipment.sql** - Adds 'variable' to equipment types

7. **007_fix_search_path.sql** - Fixes trigger function search path

8. **008_fix_rls_performance.sql** - Optimizes RLS policies for performance

9. **009_remove_wbei_duration.sql** - Removes duration from workout block exercise instance

10. **010_change_instance_dates_to_timestamp.sql** - Changes instance dates to timestamptz

11. **011_add_created_at_to_wbei.sql** - Adds created_at to workout block exercise instance

12. **012_remove_wbei_date_from_wbei.sql** - Removes date column from workout block exercise instance

13. **013_add_arm_leg_length_to_user_stats.sql** - Adds arm/leg length to user stats

14. **014_add_phase_between_protocol_and_workout.sql** - Adds Phase entity between Protocol and Workout

15. **015_add_phase_instance.sql** - Adds PhaseInstance table

16. **016_add_image_url_to_protocol_phase_workout.sql** - Adds image_url to protocol, phase, and workout

17. **017_replace_phase_workout_with_workout_ids.sql** - Replaces phase_workout junction table with workout_ids array

18. **018_add_components_to_user_goal.sql** - Adds components to user goal

19. **019_add_scoring_type_to_workout_block_exercise.sql** - Adds scoring_type to workout block exercise

20. **020_add_equipment_and_workout_types.sql** - Adds equipment and workout types

21. **021_update_scoring_type.sql** - Updates scoring_type check constraint to include 'height' and 'pace'

22. **022_create_goal_component_tables.sql** - Creates user_goal_component and user_goal_criteria tables

23. **023_add_user_preferences.sql** - Adds user_preferences table

24. **024_separate_settings.sql** - Separates user_settings from user_preferences

## Running Migrations

### Fresh Database Setup (Recommended)

For a **new database**, use the consolidated schema:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run `000_complete_schema.sql`
4. Verify that all tables, indexes, triggers, and policies are created

### Existing Database Migration

For **existing databases**, use Supabase CLI to run migrations sequentially:

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

This will run migrations 001-024 in order.

### Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in numerical order (001, 002, 003, ...)
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

- `POSTGRES_URL` - Your Supabase PostgreSQL connection string
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
