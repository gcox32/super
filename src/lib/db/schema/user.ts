import { pgTable, uuid, text, boolean, date, jsonb, timestamp, pgSchema, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { exercise } from './train';
import { muscleGroup } from './anatomy';

export const publicSchema = pgSchema('public');

// Note: user.id references auth.users.id from Supabase auth
// This is handled via foreign key constraint in SQL migrations
export const user = publicSchema.table('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userProfile = publicSchema.table('user_profile', {
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

export const userGoal = publicSchema.table('user_goal', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name'),
  description: text('description'),
  duration: jsonb('duration'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userStatsLog = publicSchema.table('user_stats_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const userStats = publicSchema.table('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  statsLogId: uuid('stats_log_id').notNull().references(() => userStatsLog.id),
  height: jsonb('height'),
  weight: jsonb('weight'),
  bodyFatPercentage: jsonb('body_fat_percentage'),
  muscleMass: jsonb('muscle_mass'),
  date: date('date').notNull(),
});

export const tapeMeasurement = publicSchema.table('tape_measurement', {
  id: uuid('id').defaultRandom().primaryKey(),
  userStatsId: uuid('user_stats_id').notNull().unique().references(() => userStats.id),
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

export const userImageLog = publicSchema.table('user_image_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const userImage = publicSchema.table('user_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  imageLogId: uuid('image_log_id').notNull().references(() => userImageLog.id),
  date: date('date').notNull(),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
});

export const userProfileKeyExercise = publicSchema.table('user_profile_key_exercise', {
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfile.id),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id),
}, (table) => ({
  pk: unique().on(table.userProfileId, table.exerciseId),
}));

// Relations
export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(userProfile),
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

export const userGoalRelations = relations(userGoal, ({ one }) => ({
  user: one(user, {
    fields: [userGoal.userId],
    references: [user.id],
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

