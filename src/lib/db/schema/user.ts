import { pgTable, uuid, text, boolean, date, jsonb, timestamp, unique, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { exercise } from './train';

// Note: user.id references auth.users.id from Supabase auth
// This is handled via foreign key constraint in SQL migrations
export const user = pgTable('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userProfile = pgTable('user_profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  gender: text('gender', { enum: ['male', 'female'] }),
  birthDate: date('birth_date'),
  dailyWaterRecommendation: jsonb('daily_water_recommendation'),
  activityLevel: text('activity_level', {
    enum: ['sedentary', 'lightly active', 'moderately active', 'very active', 'extra active'],
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
  bodyFatStrategy: text('body_fat_strategy').default('weighted_mean'),
  preferredWeightUnit: text('preferred_weight_unit', { enum: ['kg', 'lb'] }).default('lb'),
  preferredLengthUnit: text('preferred_length_unit', { enum: ['cm', 'in'] }).default('in'),
  bodyFatMaxDaysOld: integer('body_fat_max_days_old').default(30),
  // sleepReminder moved to user_settings
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
  sleepReminder: boolean('sleep_reminder').default(false),
  // Placeholders for future settings
  sessionReminders: boolean('session_reminders').default(true),
  mealReminders: boolean('meal_reminders').default(false),
  progressUpdates: boolean('progress_updates').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userGoal = pgTable('user_goal', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name'),
  description: text('description'),
  // Deprecated: components are now in user_goal_component table
  components: jsonb('components'), 
  duration: jsonb('duration'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userGoalComponent = pgTable('user_goal_component', {
  id: uuid('id').defaultRandom().primaryKey(),
  goalId: uuid('goal_id').notNull().references(() => userGoal.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { 
    enum: ['bodyweight', 'bodycomposition', 'tape', 'strength', 'time', 'repetitions', 'skill', 'other'] 
  }),
  priority: integer('priority').notNull().default(1),
  complete: boolean('complete').notNull().default(false),
  exerciseId: uuid('exercise_id').references(() => exercise.id), // For strength, time, repetitions
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userGoalCriteria = pgTable('user_goal_criteria', {
  id: uuid('id').defaultRandom().primaryKey(),
  componentId: uuid('component_id').notNull().references(() => userGoalComponent.id, { onDelete: 'cascade' }),
  // Updated to include exercise measures. We use a broader check or just text since enum is getting large/dynamic.
  // The application layer validates against GoalComponentType | ExerciseMeasureType
  type: text('type'), 
  conditional: text('conditional', { 
    enum: ['equals', 'greater than', 'less than', 'greater than or equal to', 'less than or equal to', 'not equal to'] 
  }).notNull(),
  value: jsonb('value').notNull(), // Stores value + unit
  initialValue: jsonb('initial_value'), // Stores value + unit
  measurementSite: text('measurement_site'), // For tape measurements
});

export const userStatsLog = pgTable('user_stats_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  statsLogId: uuid('stats_log_id').notNull().references(() => userStatsLog.id),
  height: jsonb('height'),
  weight: jsonb('weight'),
  armLength: jsonb('arm_length'),
  legLength: jsonb('leg_length'),
  bodyFatPercentage: jsonb('body_fat_percentage'),
  muscleMass: jsonb('muscle_mass'),
  date: date('date').notNull(),
});

export const tapeMeasurement = pgTable('tape_measurement', {
  id: uuid('id').defaultRandom().primaryKey(),
  userStatsId: uuid('user_stats_id').notNull().unique().references(() => userStats.id),
  date: date('date').notNull(),
  neck: jsonb('neck'),
  shoulders: jsonb('shoulders'),
  chest: jsonb('chest'),
  waist: jsonb('waist'),
  hips: jsonb('hips'),
  leftArm: jsonb('left_arm'),
  rightArm: jsonb('right_arm'),
  leftLeg: jsonb('left_leg'),
  rightLeg: jsonb('right_leg'),
  leftForearm: jsonb('left_forearm'),
  rightForearm: jsonb('right_forearm'),
  leftCalf: jsonb('left_calf'),
  rightCalf: jsonb('right_calf'),
});

export const userImageLog = pgTable('user_image_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const userImage = pgTable('user_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  imageLogId: uuid('image_log_id').notNull().references(() => userImageLog.id),
  date: date('date').notNull(),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
});

export const userProfileKeyExercise = pgTable('user_profile_key_exercise', {
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfile.id),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id),
}, (table) => ({
  pk: unique().on(table.userProfileId, table.exerciseId),
}));

// Relations
export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(userProfile),
  preferences: one(userPreferences),
  settings: one(userSettings),
  goals: many(userGoal),
  statsLog: one(userStatsLog),
  imageLog: one(userImageLog),
}));

export const userProfileRelations = relations(userProfile, ({ one, many }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
  keyExercises: many(userProfileKeyExercise),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));

export const userGoalRelations = relations(userGoal, ({ one, many }) => ({
  user: one(user, {
    fields: [userGoal.userId],
    references: [user.id],
  }),
  components: many(userGoalComponent),
}));

export const userGoalComponentRelations = relations(userGoalComponent, ({ one, many }) => ({
  goal: one(userGoal, {
    fields: [userGoalComponent.goalId],
    references: [userGoal.id],
  }),
  exercise: one(exercise, {
    fields: [userGoalComponent.exerciseId],
    references: [exercise.id],
  }),
  criteria: many(userGoalCriteria),
}));

export const userGoalCriteriaRelations = relations(userGoalCriteria, ({ one }) => ({
  component: one(userGoalComponent, {
    fields: [userGoalCriteria.componentId],
    references: [userGoalComponent.id],
  }),
}));

export const userStatsLogRelations = relations(userStatsLog, ({ one, many }) => ({
  user: one(user, {
    fields: [userStatsLog.userId],
    references: [user.id],
  }),
  stats: many(userStats),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  statsLog: one(userStatsLog, {
    fields: [userStats.statsLogId],
    references: [userStatsLog.id],
  }),
  tapeMeasurement: one(tapeMeasurement),
}));

export const tapeMeasurementRelations = relations(tapeMeasurement, ({ one }) => ({
  userStats: one(userStats, {
    fields: [tapeMeasurement.userStatsId],
    references: [userStats.id],
  }),
}));

export const userImageLogRelations = relations(userImageLog, ({ one, many }) => ({
  user: one(user, {
    fields: [userImageLog.userId],
    references: [user.id],
  }),
  images: many(userImage),
}));

export const userImageRelations = relations(userImage, ({ one }) => ({
  imageLog: one(userImageLog, {
    fields: [userImage.imageLogId],
    references: [userImageLog.id],
  }),
}));
