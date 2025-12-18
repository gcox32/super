import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  jsonb,
  timestamp,
  pgSchema,
  unique,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { MOVEMENT_PATTERNS, PLANES_OF_MOTION, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from '@/components/train/build/exercises/options';

export const trainSchema = pgSchema('train');

// Prescribed Elements
export const protocol = trainSchema.table('protocol', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  objectives: text('objectives').array().notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const phase = trainSchema.table('phase', {
  id: uuid('id').defaultRandom().primaryKey(),
  protocolId: uuid('protocol_id').notNull().references(() => protocol.id),
  name: text('name').notNull(),
  purpose: text('purpose'),
  imageUrl: text('image_url'),
  duration: jsonb('duration').notNull(),
  daysPerWeek: integer('days_per_week').notNull(),
  includes2ADays: boolean('includes_2a_days').notNull().default(false),
  workoutIds: text('workout_ids').array(),
  order: integer('order').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workout = trainSchema.table('workout', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  workoutType: text('workout_type', {
    enum: ['strength', 'hypertrophy', 'endurance', 'power', 'skill', 'other'],
  }).notNull(),
  name: text('name'),
  objectives: text('objectives').array(),
  description: text('description'),
  imageUrl: text('image_url'),
  estimatedDuration: integer('estimated_duration'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workoutBlock = trainSchema.table('workout_block', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id').notNull().references(() => workout.id),
  workoutBlockType: text('workout_block_type', {
    enum: ['warm-up', 'prep', 'main', 'accessory', 'finisher', 'cooldown', 'other'],
  }).notNull(),
  name: text('name'),
  description: text('description'),
  order: integer('order').notNull(),
  circuit: boolean('circuit').notNull().default(false),
  estimatedDuration: integer('estimated_duration'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exercise = trainSchema.table('exercise', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  movementPattern: text('movement_pattern', {
    enum: MOVEMENT_PATTERNS,
  }),
  muscleGroups: jsonb('muscle_groups').notNull(),
  planeOfMotion: text('plane_of_motion', {
    enum: PLANES_OF_MOTION,
  }),
  bilateral: boolean('bilateral'),
  equipment: text('equipment').array(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  workPowerConstants: jsonb('work_power_constants').notNull(),
  difficulty: text('difficulty', {
    enum: DIFFICULTY_LEVELS,
  }),
  parentExerciseId: uuid('parent_exercise_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workoutBlockExercise = trainSchema.table('workout_block_exercise', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutBlockId: uuid('workout_block_id').notNull().references(() => workoutBlock.id),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id),
  order: integer('order').notNull(),
  sets: integer('sets').notNull(),
  measures: jsonb('measures').notNull(),
  tempo: jsonb('tempo'),
  restTime: integer('rest_time'),
  rpe: integer('rpe'),
  notes: text('notes'),
});

// Instances
export const protocolInstance = trainSchema.table('protocol_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  protocolId: uuid('protocol_id').notNull().references(() => protocol.id),
  active: boolean('active').notNull().default(true),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  duration: jsonb('duration'),
  notes: text('notes'),
});

export const phaseInstance = trainSchema.table('phase_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  protocolInstanceId: uuid('protocol_instance_id').notNull().references(() => protocolInstance.id, { onDelete: 'cascade' }),
  phaseId: uuid('phase_id').notNull().references(() => phase.id),
  active: boolean('active').notNull().default(true),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  duration: jsonb('duration'),
  notes: text('notes'),
});

export const workoutInstance = trainSchema.table('workout_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  workoutId: uuid('workout_id').notNull().references(() => workout.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  complete: boolean('complete').notNull().default(false),
  duration: jsonb('duration'),
  volume: jsonb('volume'),
  work: jsonb('work'),
  averagePower: jsonb('average_power'),
  notes: text('notes'),
});

export const workoutBlockInstance = trainSchema.table('workout_block_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  workoutInstanceId: uuid('workout_instance_id')
    .notNull()
    .references(() => workoutInstance.id, { onDelete: 'cascade' }),
  workoutBlockId: uuid('workout_block_id').notNull().references(() => workoutBlock.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  complete: boolean('complete').notNull().default(false),
  duration: jsonb('duration'),
  volume: jsonb('volume'),
  notes: text('notes'),
});

export const workoutBlockExerciseInstance = trainSchema.table('workout_block_exercise_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  workoutBlockInstanceId: uuid('workout_block_instance_id')
    .notNull()
    .references(() => workoutBlockInstance.id, { onDelete: 'cascade' }),
  workoutBlockExerciseId: uuid('workout_block_exercise_id')
    .notNull()
    .references(() => workoutBlockExercise.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  complete: boolean('complete').notNull().default(false),
  personalBest: boolean('personal_best'),
  measures: jsonb('measures').notNull(),
  projected1RM: jsonb('projected_1rm'),
  rpe: integer('rpe'),
  notes: text('notes'),
});

// Logs
export const performanceLog = trainSchema.table('performance_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const performance = trainSchema.table('performance', {
  id: uuid('id').defaultRandom().primaryKey(),
  performanceLogId: uuid('performance_log_id').notNull().references(() => performanceLog.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  duration: jsonb('duration').notNull(),
  volume: jsonb('volume').notNull(),
  work: jsonb('work').notNull(),
  power: jsonb('power').notNull(),
  notes: text('notes'),
});

export const projected1RMLog = trainSchema.table('projected_1rm_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const projected1RM = trainSchema.table('projected_1rm', {
  id: uuid('id').defaultRandom().primaryKey(),
  projected1RMLogId: uuid('projected_1rm_log_id').notNull().references(() => projected1RMLog.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  exerciseId: uuid('exercise_id').notNull().references(() => exercise.id),
  projected1RM: jsonb('projected_1rm').notNull(),
  notes: text('notes'),
});

// Relations
export const protocolRelations = relations(protocol, ({ many }) => ({
  phases: many(phase),
}));

export const phaseRelations = relations(phase, ({ one, many }) => ({
  protocol: one(protocol, {
    fields: [phase.protocolId],
    references: [protocol.id],
  }),
  instances: many(phaseInstance),
}));

export const workoutRelations = relations(workout, ({ one, many }) => ({
  user: one(user, {
    fields: [workout.userId],
    references: [user.id],
  }),
  blocks: many(workoutBlock),
  instances: many(workoutInstance),
}));

export const workoutBlockRelations = relations(workoutBlock, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workoutBlock.workoutId],
    references: [workout.id],
  }),
  exercises: many(workoutBlockExercise),
  instances: many(workoutBlockInstance),
}));

export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  parentExercise: one(exercise, {
    fields: [exercise.parentExerciseId],
    references: [exercise.id],
    relationName: 'parentChild',
  }),
  childExercises: many(exercise, {
    relationName: 'parentChild',
  }),
  workoutBlockExercises: many(workoutBlockExercise),
  projected1RMs: many(projected1RM),
}));

export const workoutBlockExerciseRelations = relations(workoutBlockExercise, ({ one, many }) => ({
  workoutBlock: one(workoutBlock, {
    fields: [workoutBlockExercise.workoutBlockId],
    references: [workoutBlock.id],
  }),
  exercise: one(exercise, {
    fields: [workoutBlockExercise.exerciseId],
    references: [exercise.id],
  }),
  instances: many(workoutBlockExerciseInstance),
}));

export const protocolInstanceRelations = relations(protocolInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [protocolInstance.userId],
    references: [user.id],
  }),
  protocol: one(protocol, {
    fields: [protocolInstance.protocolId],
    references: [protocol.id],
  }),
  phaseInstances: many(phaseInstance),
}));

export const phaseInstanceRelations = relations(phaseInstance, ({ one }) => ({
  user: one(user, {
    fields: [phaseInstance.userId],
    references: [user.id],
  }),
  protocolInstance: one(protocolInstance, {
    fields: [phaseInstance.protocolInstanceId],
    references: [protocolInstance.id],
  }),
  phase: one(phase, {
    fields: [phaseInstance.phaseId],
    references: [phase.id],
  }),
}));

export const workoutInstanceRelations = relations(workoutInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [workoutInstance.userId],
    references: [user.id],
  }),
  workout: one(workout, {
    fields: [workoutInstance.workoutId],
    references: [workout.id],
  }),
  blockInstances: many(workoutBlockInstance),
}));

export const workoutBlockInstanceRelations = relations(workoutBlockInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [workoutBlockInstance.userId],
    references: [user.id],
  }),
  workoutInstance: one(workoutInstance, {
    fields: [workoutBlockInstance.workoutInstanceId],
    references: [workoutInstance.id],
  }),
  workoutBlock: one(workoutBlock, {
    fields: [workoutBlockInstance.workoutBlockId],
    references: [workoutBlock.id],
  }),
  exerciseInstances: many(workoutBlockExerciseInstance),
}));

export const workoutBlockExerciseInstanceRelations = relations(
  workoutBlockExerciseInstance,
  ({ one }) => ({
    user: one(user, {
      fields: [workoutBlockExerciseInstance.userId],
      references: [user.id],
    }),
    workoutBlockInstance: one(workoutBlockInstance, {
      fields: [workoutBlockExerciseInstance.workoutBlockInstanceId],
      references: [workoutBlockInstance.id],
    }),
    workoutBlockExercise: one(workoutBlockExercise, {
      fields: [workoutBlockExerciseInstance.workoutBlockExerciseId],
      references: [workoutBlockExercise.id],
    }),
  }),
);

export const performanceLogRelations = relations(performanceLog, ({ one, many }) => ({
  user: one(user, {
    fields: [performanceLog.userId],
    references: [user.id],
  }),
  performances: many(performance),
}));

export const performanceRelations = relations(performance, ({ one }) => ({
  performanceLog: one(performanceLog, {
    fields: [performance.performanceLogId],
    references: [performanceLog.id],
  }),
}));

export const projected1RMLogRelations = relations(projected1RMLog, ({ one, many }) => ({
  user: one(user, {
    fields: [projected1RMLog.userId],
    references: [user.id],
  }),
  projected1RMs: many(projected1RM),
}));

export const projected1RMRelations = relations(projected1RM, ({ one }) => ({
  projected1RMLog: one(projected1RMLog, {
    fields: [projected1RM.projected1RMLogId],
    references: [projected1RMLog.id],
  }),
  exercise: one(exercise, {
    fields: [projected1RM.exerciseId],
    references: [exercise.id],
  }),
}));

