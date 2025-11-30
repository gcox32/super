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

export const fuelSchema = pgSchema('fuel');

// Prescribed Elements
export const mealPlan = fuelSchema.table('meal_plan', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const meal = fuelSchema.table('meal', {
  id: uuid('id').defaultRandom().primaryKey(),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlan.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const food = fuelSchema.table('food', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const portionedFood = fuelSchema.table('portioned_food', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodId: uuid('food_id').notNull().references(() => food.id),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  portionSize: jsonb('portion_size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mealPortion = fuelSchema.table('meal_portion', {
  mealId: uuid('meal_id').notNull().references(() => meal.id),
  portionedFoodId: uuid('portioned_food_id').notNull().references(() => portionedFood.id),
  order: integer('order').notNull(),
}, (table) => ({
  pk: unique().on(table.mealId, table.portionedFoodId),
}));

export const recipe = fuelSchema.table('recipe', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  calories: jsonb('calories'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mealRecipe = fuelSchema.table('meal_recipe', {
  mealId: uuid('meal_id').notNull().references(() => meal.id),
  recipeId: uuid('recipe_id').notNull().references(() => recipe.id),
}, (table) => ({
  pk: unique().on(table.mealId, table.recipeId),
}));

export const recipeIngredient = fuelSchema.table('recipe_ingredient', {
  recipeId: uuid('recipe_id').notNull().references(() => recipe.id),
  portionedFoodId: uuid('portioned_food_id').notNull().references(() => portionedFood.id),
  order: integer('order').notNull(),
}, (table) => ({
  pk: unique().on(table.recipeId, table.portionedFoodId),
}));

export const groceryList = fuelSchema.table('grocery_list', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const groceryListItem = fuelSchema.table('grocery_list_item', {
  groceryListId: uuid('grocery_list_id').notNull().references(() => groceryList.id),
  portionedFoodId: uuid('portioned_food_id').notNull().references(() => portionedFood.id),
  order: integer('order').notNull(),
}, (table) => ({
  pk: unique().on(table.groceryListId, table.portionedFoodId),
}));

// Instances
export const mealPlanInstance = fuelSchema.table('meal_plan_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlan.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
});

export const mealInstance = fuelSchema.table('meal_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealPlanInstanceId: uuid('meal_plan_instance_id')
    .notNull()
    .references(() => mealPlanInstance.id),
  mealId: uuid('meal_id').notNull().references(() => meal.id),
  date: date('date').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
});

export const portionedFoodInstance = fuelSchema.table('portioned_food_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealInstanceId: uuid('meal_instance_id')
    .notNull()
    .references(() => mealInstance.id, { onDelete: 'cascade' }),
  foodId: uuid('food_id').notNull().references(() => food.id),
  portion: jsonb('portion').notNull(),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
});

// Supplements
export const supplement = fuelSchema.table('supplement', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supplementSchedule = fuelSchema.table('supplement_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  scheduleType: text('schedule_type', {
    enum: [
      'hourly',
      'twice-daily',
      'every-other-day',
      'daily',
      'weekly',
      'bi-weekly',
      'monthly',
      'once',
      'other',
    ],
  }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supplementInstance = fuelSchema.table('supplement_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  supplementScheduleId: uuid('supplement_schedule_id')
    .notNull()
    .references(() => supplementSchedule.id),
  supplementId: uuid('supplement_id').notNull().references(() => supplement.id),
  dosage: jsonb('dosage').notNull(),
  date: date('date').notNull(),
  complete: boolean('complete'),
  notes: text('notes'),
});

// Water & Sleep
export const waterIntakeLog = fuelSchema.table('water_intake_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const waterIntake = fuelSchema.table('water_intake', {
  id: uuid('id').defaultRandom().primaryKey(),
  waterIntakeLogId: uuid('water_intake_log_id').notNull().references(() => waterIntakeLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: date('date').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  amount: jsonb('amount').notNull(),
  notes: text('notes'),
});

export const sleepLog = fuelSchema.table('sleep_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const sleepInstance = fuelSchema.table('sleep_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  sleepLogId: uuid('sleep_log_id').notNull().references(() => sleepLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: date('date').notNull(),
  timeAsleep: jsonb('time_asleep'),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  sleepScore: numeric('sleep_score'),
  wakeCount: integer('wake_count'),
  timeAwake: jsonb('time_awake'),
  notes: text('notes'),
});

// Relations
export const mealPlanRelations = relations(mealPlan, ({ one, many }) => ({
  user: one(user, {
    fields: [mealPlan.userId],
    references: [user.id],
  }),
  meals: many(meal),
  instances: many(mealPlanInstance),
}));

export const mealRelations = relations(meal, ({ one, many }) => ({
  mealPlan: one(mealPlan, {
    fields: [meal.mealPlanId],
    references: [mealPlan.id],
  }),
  mealPortions: many(mealPortion),
  mealRecipes: many(mealRecipe),
  instances: many(mealInstance),
}));

export const foodRelations = relations(food, ({ many }) => ({
  portionedFoods: many(portionedFood),
  portionedFoodInstances: many(portionedFoodInstance),
}));

export const portionedFoodRelations = relations(portionedFood, ({ one, many }) => ({
  food: one(food, {
    fields: [portionedFood.foodId],
    references: [food.id],
  }),
  mealPortions: many(mealPortion),
  recipeIngredients: many(recipeIngredient),
  groceryListItems: many(groceryListItem),
}));

export const mealPortionRelations = relations(mealPortion, ({ one }) => ({
  meal: one(meal, {
    fields: [mealPortion.mealId],
    references: [meal.id],
  }),
  portionedFood: one(portionedFood, {
    fields: [mealPortion.portionedFoodId],
    references: [portionedFood.id],
  }),
}));

export const recipeRelations = relations(recipe, ({ many }) => ({
  mealRecipes: many(mealRecipe),
  ingredients: many(recipeIngredient),
}));

export const mealRecipeRelations = relations(mealRecipe, ({ one }) => ({
  meal: one(meal, {
    fields: [mealRecipe.mealId],
    references: [meal.id],
  }),
  recipe: one(recipe, {
    fields: [mealRecipe.recipeId],
    references: [recipe.id],
  }),
}));

export const recipeIngredientRelations = relations(recipeIngredient, ({ one }) => ({
  recipe: one(recipe, {
    fields: [recipeIngredient.recipeId],
    references: [recipe.id],
  }),
  portionedFood: one(portionedFood, {
    fields: [recipeIngredient.portionedFoodId],
    references: [portionedFood.id],
  }),
}));

export const groceryListRelations = relations(groceryList, ({ one, many }) => ({
  user: one(user, {
    fields: [groceryList.userId],
    references: [user.id],
  }),
  items: many(groceryListItem),
}));

export const groceryListItemRelations = relations(groceryListItem, ({ one }) => ({
  groceryList: one(groceryList, {
    fields: [groceryListItem.groceryListId],
    references: [groceryList.id],
  }),
  portionedFood: one(portionedFood, {
    fields: [groceryListItem.portionedFoodId],
    references: [portionedFood.id],
  }),
}));

export const mealPlanInstanceRelations = relations(mealPlanInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [mealPlanInstance.userId],
    references: [user.id],
  }),
  mealPlan: one(mealPlan, {
    fields: [mealPlanInstance.mealPlanId],
    references: [mealPlan.id],
  }),
  mealInstances: many(mealInstance),
}));

export const mealInstanceRelations = relations(mealInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [mealInstance.userId],
    references: [user.id],
  }),
  mealPlanInstance: one(mealPlanInstance, {
    fields: [mealInstance.mealPlanInstanceId],
    references: [mealPlanInstance.id],
  }),
  meal: one(meal, {
    fields: [mealInstance.mealId],
    references: [meal.id],
  }),
  portionedFoodInstances: many(portionedFoodInstance),
}));

export const portionedFoodInstanceRelations = relations(portionedFoodInstance, ({ one }) => ({
  user: one(user, {
    fields: [portionedFoodInstance.userId],
    references: [user.id],
  }),
  mealInstance: one(mealInstance, {
    fields: [portionedFoodInstance.mealInstanceId],
    references: [mealInstance.id],
  }),
  food: one(food, {
    fields: [portionedFoodInstance.foodId],
    references: [food.id],
  }),
}));

export const supplementRelations = relations(supplement, ({ many }) => ({
  instances: many(supplementInstance),
}));

export const supplementScheduleRelations = relations(supplementSchedule, ({ one, many }) => ({
  user: one(user, {
    fields: [supplementSchedule.userId],
    references: [user.id],
  }),
  instances: many(supplementInstance),
}));

export const supplementInstanceRelations = relations(supplementInstance, ({ one }) => ({
  user: one(user, {
    fields: [supplementInstance.userId],
    references: [user.id],
  }),
  supplementSchedule: one(supplementSchedule, {
    fields: [supplementInstance.supplementScheduleId],
    references: [supplementSchedule.id],
  }),
  supplement: one(supplement, {
    fields: [supplementInstance.supplementId],
    references: [supplement.id],
  }),
}));

export const waterIntakeLogRelations = relations(waterIntakeLog, ({ one, many }) => ({
  user: one(user, {
    fields: [waterIntakeLog.userId],
    references: [user.id],
  }),
  waterIntakes: many(waterIntake),
}));

export const waterIntakeRelations = relations(waterIntake, ({ one }) => ({
  waterIntakeLog: one(waterIntakeLog, {
    fields: [waterIntake.waterIntakeLogId],
    references: [waterIntakeLog.id],
  }),
  user: one(user, {
    fields: [waterIntake.userId],
    references: [user.id],
  }),
}));

export const sleepLogRelations = relations(sleepLog, ({ one, many }) => ({
  user: one(user, {
    fields: [sleepLog.userId],
    references: [user.id],
  }),
  sleepInstances: many(sleepInstance),
}));

export const sleepInstanceRelations = relations(sleepInstance, ({ one }) => ({
  sleepLog: one(sleepLog, {
    fields: [sleepInstance.sleepLogId],
    references: [sleepLog.id],
  }),
  user: one(user, {
    fields: [sleepInstance.userId],
    references: [user.id],
  }),
}));

