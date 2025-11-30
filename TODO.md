# TODO

## Database
- [ ] Determine relational database schema based on types in `src/types/`; leverage supabase.
- [ ] Leverage Drizzle for ORM, supabase interaction
- [ ] Associate auth user in supabase with `User` record in database.
- [ ] Write scripts to generate initial schemas and tables (e.g. `train.protocol`, `eat.food` etc.).

## Backend
- [ ] Write CRUD functions to Create, Remove, Update, and Delete records from tables, making sure to `CASCADE` and aggregate where appropriate (e.g. deleting a record from `train.workout_instance` would delete the corresponding `train.workout_block_instance` records and their corresponding `train.workout_block_exercise_instance` records).
- [ ] Write backend API routes to trigger these CRUD functions

## Frontend 

### Train
UI needed for creation, reading (getting or listing), updating, and deleting training related data

#### Perscribed Elements
These are the elements of the taxonomy "in the abstract"
- [ ] Workout Protocols (made up of multiple Workouts)
- [ ] Workouts (made up of multiple Workout Blocks)
- [ ] Workout Blocks (made up of multiple Exercises)
- [ ] Exercise

#### Executed or Scheduled Instances of Elements
- [ ] Workout Protocol Instance (i.e. has a start date and a specific user)
- [ ] Workout Instance (i.e. has a date and belongs to an active Protocol)
- [ ] Workout Block Instance (i.e. belongs to a specific scheduled or completed Workout)
- [ ] Exercise Instance (i.e. has a set scheme of sets, reps, weight etc)

### Fuel

#### Perscribed Elements
- [ ] Meal Plan (made up of multiple Meals)
- [ ] Meal (made up of multiple Portioned Foods)
- [ ] Portioned Food (a Food record with a corresponding measure, such as "100 grams")

#### Completed or Scheduled Instances of Elements
- [ ] Meal Plan Instance (i.e. has a start date and a specific user)
- [ ] Meal Instance (i.e. belongs to a specific Meal Plan)
- [ ] Portioned Food Instance (i.e. belongs to a specific Meal)

#### Recipes
Recipes are mostly plain text that are made up of Foods and can be associated with Meals or Meal Plans. Because the base unit is again Portioned Food, a Recipe can also be summarized by its composite Macros and Micros

#### Grocery Lists
Grocery Lists are the aggregate Portioned Foods from multiple Meals (which are made up of multiple Portioned Foods). Such an aggregation will save a ton of time, taking us from Meal Plan all the way to corresponding Foods and portions in a click.

#### Supplements and Supplement Schedule
Supplements, Water Intake, and Sleep work a bit differently: the user is either to schedule out (on a regular cadence) and/or track these things or not. For example, any one day could have a Sleep Instance recorded, or Water Intake, but there wouldn't need to be any creating/building/planning ahead of that in order to mark that it happened the way it did later.

### Log
There are multiple types of Logs for a given User.
#### 


### Me



