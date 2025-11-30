import { pgTable, uuid, text, pgSchema } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const anatomySchema = pgSchema('anatomy');

export const muscleGroup = anatomySchema.table('muscle_group', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const muscle = anatomySchema.table('muscle', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  muscleGroupId: uuid('muscle_group_id').notNull().references(() => muscleGroup.id),
  scientificName: text('scientific_name'),
});

export const muscleGroupRelations = relations(muscleGroup, ({ many }) => ({
  muscles: many(muscle),
}));

export const muscleRelations = relations(muscle, ({ one }) => ({
  muscleGroup: one(muscleGroup, {
    fields: [muscle.muscleGroupId],
    references: [muscleGroup.id],
  }),
}));

