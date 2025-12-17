import { eq, and, desc, inArray, sql, ilike } from 'drizzle-orm';
import { db } from '../index';
import { calculateOutput } from '@/lib/log/train/work-power';
import { getLatestUserStats } from './user';
import type { WeightMeasurement, WorkMeasurement, PowerMeasurement } from '@/types/measures';

// Helper to convert null to undefined for optional fields
function nullToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === null && key !== 'id') {
      (result as any)[key] = undefined;
    }
  }
  return result;
}
import {
  protocol,
  protocolWorkout,
  workout,
  workoutBlock,
  workoutBlockExercise,
  exercise,
  protocolInstance,
  workoutInstance,
  workoutBlockInstance,
  workoutBlockExerciseInstance,
  performanceLog,
  performance,
  projected1RMLog,
  projected1RM,
} from '../schema';
import type {
  Protocol,
  Workout,
  WorkoutBlock,
  WorkoutBlockExercise,
  Exercise,
  ProtocolInstance,
  WorkoutInstance,
  WorkoutBlockInstance,
  WorkoutBlockExerciseInstance,
  Performance,
  Projected1RM,
} from '@/types/train';

// ============================================================================
// PROTOCOL CRUD
// ============================================================================

export async function createProtocol(
  protocolData: Omit<Protocol, 'id' | 'createdAt' | 'updatedAt' | 'workouts'>
): Promise<Protocol> {
  const [newProtocol] = await db
    .insert(protocol)
    .values({
      name: protocolData.name,
      objectives: protocolData.objectives,
      description: protocolData.description,
      duration: protocolData.duration,
      daysPerWeek: protocolData.daysPerWeek,
      includes2ADays: protocolData.includes2ADays,
      notes: protocolData.notes,
    })
    .returning();

  return {
    ...newProtocol,
    description: newProtocol.description ?? undefined,
    notes: newProtocol.notes ?? undefined,
  } as Protocol;
}

export async function setProtocolWorkouts(
  protocolId: string,
  workoutIds: string[]
): Promise<void> {
  return await db.transaction(async (tx) => {
    // Remove existing associations
    await tx
      .delete(protocolWorkout)
      .where(eq(protocolWorkout.protocolId, protocolId));

    if (workoutIds.length > 0) {
      // Create new associations
      await tx.insert(protocolWorkout).values(
        workoutIds.map((workoutId, index) => ({
          protocolId,
          workoutId,
          order: index + 1,
        }))
      );
    }
  });
}

export async function getProtocols(): Promise<Protocol[]> {
  const results = await db.select().from(protocol).orderBy(desc(protocol.createdAt));
  return results.map((r) => ({
    ...r,
    description: r.description ?? undefined,
    notes: r.notes ?? undefined,
  })) as Protocol[];
}

export async function getProtocolById(protocolId: string): Promise<Protocol | null> {
  const [found] = await db
    .select()
    .from(protocol)
    .where(eq(protocol.id, protocolId))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    description: found.description ?? undefined,
    notes: found.notes ?? undefined,
  } as Protocol;
}

export async function updateProtocol(
  protocolId: string,
  updates: Partial<Omit<Protocol, 'id' | 'createdAt' | 'updatedAt' | 'workouts'>>
): Promise<Protocol | null> {
  const [updated] = await db
    .update(protocol)
    .set(updates)
    .where(eq(protocol.id, protocolId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    description: updated.description ?? undefined,
    notes: updated.notes ?? undefined,
  } as Protocol;
}

export async function deleteProtocol(protocolId: string): Promise<boolean> {
  await db.delete(protocol).where(eq(protocol.id, protocolId));
  return true;
}

// ============================================================================
// WORKOUT CRUD
// ============================================================================

export type CreateWorkoutBlockExerciseInput = Omit<WorkoutBlockExercise, 'id' | 'exercise'> & { exerciseId: string };

export type CreateWorkoutBlockInput = Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'> & {
  exercises: CreateWorkoutBlockExerciseInput[];
};

export type CreateWorkoutInput = Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'blocks'> & {
  blocks: CreateWorkoutBlockInput[];
};

export async function createFullWorkout(
  userId: string,
  workoutData: CreateWorkoutInput
): Promise<Workout> {
  return await db.transaction(async (tx) => {
    // 1. Create Workout
    const [newWorkout] = await tx
      .insert(workout)
      .values({
        userId,
        workoutType: workoutData.workoutType,
        name: workoutData.name,
        objectives: workoutData.objectives,
        description: workoutData.description,
        estimatedDuration: workoutData.estimatedDuration,
      })
      .returning();

    const createdBlocks: WorkoutBlock[] = [];

    // 2. Create Blocks
    for (const blockData of workoutData.blocks) {
      const [newBlock] = await tx
        .insert(workoutBlock)
        .values({
          workoutId: newWorkout.id,
          workoutBlockType: blockData.workoutBlockType,
          name: blockData.name,
          description: blockData.description,
          order: blockData.order,
          circuit: blockData.circuit ?? false,
          estimatedDuration: blockData.estimatedDuration,
        })
        .returning();

      const createdExercises: WorkoutBlockExercise[] = [];

      // 3. Create Block Exercises
      for (const exerciseData of blockData.exercises) {
        const [newExercise] = await tx
          .insert(workoutBlockExercise)
          .values({
            workoutBlockId: newBlock.id,
            exerciseId: exerciseData.exerciseId,
            order: exerciseData.order,
            sets: exerciseData.sets,
            measures: exerciseData.measures,
            tempo: exerciseData.tempo,
            restTime: exerciseData.restTime,
            rpe: exerciseData.rpe,
            notes: exerciseData.notes,
          })
          .returning();

        // We need to fetch the full exercise object to match the type
        const [fullExercise] = await tx
            .select()
            .from(exercise)
            .where(eq(exercise.id, exerciseData.exerciseId))
            .limit(1);
            
        if (!fullExercise) {
            throw new Error(`Exercise ${exerciseData.exerciseId} not found`);
        }

        createdExercises.push({
            ...(newExercise as any),
            exercise: fullExercise as Exercise,
        } as WorkoutBlockExercise);
      }

      createdBlocks.push({
        ...nullToUndefined(newBlock),
        exercises: createdExercises,
      } as WorkoutBlock);
    }

    return {
      ...nullToUndefined(newWorkout),
      blocks: createdBlocks,
    } as Workout;
  });
}

export async function createWorkout(
  userId: string,
  workoutData: Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'blocks'>
): Promise<Workout> {
  const [newWorkout] = await db
    .insert(workout)
    .values({
      userId,
      workoutType: workoutData.workoutType,
      name: workoutData.name,
      objectives: workoutData.objectives,
      description: workoutData.description,
      estimatedDuration: workoutData.estimatedDuration,
    })
    .returning();

  return {
    ...nullToUndefined(newWorkout),
    blocks: [],
  } as Workout;
}

export async function getUserWorkouts(userId: string): Promise<Workout[]> {
  const results = await db
    .select()
    .from(workout)
    .where(eq(workout.userId, userId))
    .orderBy(desc(workout.createdAt));
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    blocks: [], // Blocks are loaded separately via workout_block junction table
  })) as Workout[];
}

export async function getProtocolWorkouts(protocolId: string): Promise<Workout[]> {
  // Get workout IDs from protocol_workout junction table, ordered by order field
  const protocolWorkouts = await db
    .select()
    .from(protocolWorkout)
    .where(eq(protocolWorkout.protocolId, protocolId))
    .orderBy(protocolWorkout.order);

  if (protocolWorkouts.length === 0) {
    return [];
  }

  const workoutIds = protocolWorkouts.map((pw) => pw.workoutId);
  const workouts = await db
    .select()
    .from(workout)
    .where(inArray(workout.id, workoutIds));

  // Create a map to preserve order from protocol_workout
  const workoutMap = new Map(workouts.map((w) => [w.id, w]));
  
  // Return workouts in the order specified by protocol_workout.order
  return protocolWorkouts
    .map((pw) => workoutMap.get(pw.workoutId))
    .filter((w): w is typeof workouts[0] => w !== undefined)
    .map((r) => ({
      ...nullToUndefined(r),
      blocks: [], // Blocks are loaded separately
    })) as Workout[];
}

export async function getWorkoutById(
  workoutId: string,
  userId: string
): Promise<Workout | null> {
  const [found] = await db
    .select()
    .from(workout)
    .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    blocks: [],
  } as Workout;
}

export async function getWorkoutWithExercises(
  workoutId: string,
  userId: string
): Promise<Workout | null> {
  const result = await db.query.workout.findFirst({
    where: (w, { eq, and }) => and(eq(w.id, workoutId), eq(w.userId, userId)),
    with: {
      blocks: {
        orderBy: (b, { asc }) => [asc(b.order)],
        with: {
          exercises: {
            orderBy: (e, { asc }) => [asc(e.order)],
            with: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  if (!result) return null;

  // Transform result to ensure nulls are undefined where appropriate
  // and structure matches Workout interface
  return {
    ...nullToUndefined(result),
    blocks: result.blocks.map((b) => ({
      ...nullToUndefined(b),
      exercises: b.exercises.map((e) => ({
        ...nullToUndefined(e),
        exercise: nullToUndefined(e.exercise),
      })),
    })),
  } as Workout;
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  updates: Partial<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'blocks'>>
): Promise<Workout | null> {
  const [updated] = await db
    .update(workout)
    .set(updates)
    .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...nullToUndefined(updated),
    blocks: [],
  } as Workout;
}

export async function deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
  // CASCADE will handle workout_blocks, workout_block_exercises, etc.
  const result = await db
    .delete(workout)
    .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)));

  return true;
}

// ============================================================================
// WORKOUT BLOCK CRUD
// ============================================================================

export async function createWorkoutBlock(
  workoutId: string,
  blockData: Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'>
): Promise<WorkoutBlock> {
  const [newBlock] = await db
    .insert(workoutBlock)
    .values({
      workoutId,
      workoutBlockType: blockData.workoutBlockType,
      name: blockData.name,
      description: blockData.description,
      order: blockData.order,
      circuit: blockData.circuit ?? false,
      estimatedDuration: blockData.estimatedDuration,
    })
    .returning();

  return {
    ...nullToUndefined(newBlock),
    exercises: [],
  } as WorkoutBlock;
}

export async function getWorkoutBlocks(workoutId: string): Promise<WorkoutBlock[]> {
  const results = await db
    .select()
    .from(workoutBlock)
    .where(eq(workoutBlock.workoutId, workoutId))
    .orderBy(workoutBlock.order);
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    exercises: [], // Exercises are loaded separately via workout_block_exercise junction table
  })) as WorkoutBlock[];
}

export async function getWorkoutBlockById(blockId: string): Promise<WorkoutBlock | null> {
  const [found] = await db
    .select()
    .from(workoutBlock)
    .where(eq(workoutBlock.id, blockId))
    .limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    exercises: [],
  } as WorkoutBlock;
}

export async function updateWorkoutBlock(
  blockId: string,
  updates: Partial<Omit<WorkoutBlock, 'id' | 'workoutId' | 'createdAt' | 'updatedAt' | 'exercises'>>
): Promise<WorkoutBlock | null> {
  const [updated] = await db
    .update(workoutBlock)
    .set(updates)
    .where(eq(workoutBlock.id, blockId))
    .returning();

  if (!updated) return null;

  return {
    ...nullToUndefined(updated),
    exercises: [],
  } as WorkoutBlock;
}

export async function deleteWorkoutBlock(blockId: string): Promise<boolean> {
  // CASCADE will handle workout_block_exercises
  await db.delete(workoutBlock).where(eq(workoutBlock.id, blockId));
  return true;
}

// ============================================================================
// WORKOUT BLOCK EXERCISE CRUD
// ============================================================================

export async function createWorkoutBlockExercise(
  blockId: string,
  exerciseData: Omit<WorkoutBlockExercise, 'id' | 'exercise'> & { exercise: Exercise | string }
): Promise<WorkoutBlockExercise> {
  // Handle both Exercise object and exercise ID string
  const exerciseId = typeof exerciseData.exercise === 'string' 
    ? exerciseData.exercise 
    : exerciseData.exercise.id;

  const [newExercise] = await db
    .insert(workoutBlockExercise)
    .values({
      workoutBlockId: blockId,
      exerciseId,
      order: exerciseData.order,
      sets: exerciseData.sets,
      measures: exerciseData.measures,
      tempo: exerciseData.tempo,
      restTime: exerciseData.restTime,
      rpe: exerciseData.rpe,
      notes: exerciseData.notes,
    })
    .returning();

  // Fetch the full exercise to return
  const [fullExercise] = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, exerciseId))
    .limit(1);

  if (!fullExercise) {
    throw new Error('Exercise not found');
  }

  return {
    ...(newExercise as any),
    exercise: fullExercise as Exercise,
  } as WorkoutBlockExercise;
}

export async function getWorkoutBlockExercises(blockId: string): Promise<WorkoutBlockExercise[]> {
  const exercises = await db
    .select()
    .from(workoutBlockExercise)
    .where(eq(workoutBlockExercise.workoutBlockId, blockId))
    .orderBy(workoutBlockExercise.order);

  // Fetch full exercise details for each
  const exerciseIds = exercises.map((e) => e.exerciseId);
  const fullExercises = await db
    .select()
    .from(exercise)
    .where(inArray(exercise.id, exerciseIds));

  const exerciseMap = new Map(fullExercises.map((e) => [e.id, e]));

  return exercises.map((e) => {
    const fullExercise = exerciseMap.get(e.exerciseId);
    if (!fullExercise) {
      throw new Error(`Exercise ${e.exerciseId} not found`);
    }
    return {
      ...(e as any),
      exercise: fullExercise as Exercise,
    } as WorkoutBlockExercise;
  });
}

export async function updateWorkoutBlockExercise(
  exerciseId: string,
  updates: Partial<Omit<WorkoutBlockExercise, 'id' | 'workoutBlockId' | 'exercise'>>
): Promise<WorkoutBlockExercise | null> {
  const [updated] = await db
    .update(workoutBlockExercise)
    .set(updates)
    .where(eq(workoutBlockExercise.id, exerciseId))
    .returning();

  if (!updated) return null;

  // Fetch full exercise
  const [fullExercise] = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, updated.exerciseId))
    .limit(1);

  if (!fullExercise) {
    throw new Error(`Exercise ${updated.exerciseId} not found`);
  }

  return {
    ...(updated as any),
    exercise: fullExercise as Exercise,
  } as WorkoutBlockExercise;
}

export async function deleteWorkoutBlockExercise(exerciseId: string): Promise<boolean> {
  const result = await db
    .delete(workoutBlockExercise)
    .where(eq(workoutBlockExercise.id, exerciseId));

  return true;
}

// ============================================================================
// EXERCISE CRUD
// ============================================================================

export async function createExercise(
  exerciseData: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Exercise> {
  const [newExercise] = await db
    .insert(exercise)
    .values({
      name: exerciseData.name,
      description: exerciseData.description,
      movementPattern: exerciseData.movementPattern,
      muscleGroups: exerciseData.muscleGroups,
      planeOfMotion: exerciseData.planeOfMotion,
      bilateral: exerciseData.bilateral,
      equipment: exerciseData.equipment,
      imageUrl: exerciseData.imageUrl,
      videoUrl: exerciseData.videoUrl,
      workPowerConstants: exerciseData.workPowerConstants,
      difficulty: exerciseData.difficulty,
    })
    .returning();

  return nullToUndefined(newExercise) as Exercise;
}

export async function getExercises(
  page: number = 1,
  limit: number = 20
): Promise<{ exercises: Exercise[]; total: number }> {
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(exercise);

  const results = await db
    .select()
    .from(exercise)
    .orderBy(exercise.name)
    .limit(limit)
    .offset(offset);

  return {
    exercises: results.map(nullToUndefined) as Exercise[],
    total: Number(count),
  };
}

export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const [found] = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, exerciseId))
    .limit(1);

  if (!found) return null;

  return nullToUndefined(found) as Exercise;
}

export async function searchExercises(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ exercises: Exercise[]; total: number }> {
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(exercise)
    .where(ilike(exercise.name, `%${query}%`));
  
  const results = await db
    .select()
    .from(exercise)
    .where(ilike(exercise.name, `%${query}%`))
    .orderBy(exercise.name)
    .limit(limit)
    .offset(offset);
  
  return {
    exercises: results.map(nullToUndefined) as Exercise[],
    total: Number(count),
  };
}

export async function updateExercise(
  exerciseId: string,
  updates: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Exercise | null> {
  const [updated] = await db
    .update(exercise)
    .set(updates)
    .where(eq(exercise.id, exerciseId))
    .returning();

  if (!updated) return null;

  return nullToUndefined(updated) as Exercise;
}

export async function deleteExercise(exerciseId: string): Promise<boolean> {
  await db.delete(exercise).where(eq(exercise.id, exerciseId));
  return true;
}

// ============================================================================
// PROTOCOL INSTANCE CRUD
// ============================================================================

export async function createProtocolInstance(
  userId: string,
  instanceData: Omit<ProtocolInstance, 'id' | 'userId'>
): Promise<ProtocolInstance> {
  const [newInstance] = await db
    .insert(protocolInstance)
    .values({
      userId,
      protocolId: instanceData.protocolId,
      active: instanceData.active ?? true,
      startDate: instanceData.startDate,
      endDate: instanceData.endDate,
      complete: instanceData.complete ?? false,
      duration: instanceData.duration,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newInstance,
    startDate: new Date(newInstance.startDate),
    endDate: newInstance.endDate ? new Date(newInstance.endDate) : null,
  } as ProtocolInstance;
}

export async function getUserProtocolInstances(
  userId: string,
  activeOnly = false
): Promise<ProtocolInstance[]> {
  let whereClause = eq(protocolInstance.userId, userId);
  
  if (activeOnly) {
    whereClause = and(
      eq(protocolInstance.userId, userId),
      eq(protocolInstance.active, true)
    ) as any;
  }

  const results = await db
    .select()
    .from(protocolInstance)
    .where(whereClause)
    .orderBy(desc(protocolInstance.startDate));

  return results.map((r) => ({
    ...r,
    startDate: new Date(r.startDate),
    endDate: r.endDate ? new Date(r.endDate) : null,
  })) as ProtocolInstance[];
}

export async function updateProtocolInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<ProtocolInstance, 'id' | 'userId' | 'protocolId'>>
): Promise<ProtocolInstance | null> {
  // Convert Date objects to strings for database
  const dbUpdates: any = { ...updates };
  if (updates.startDate) dbUpdates.startDate = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.endDate = updates.endDate ?? null;

  const [updated] = await db
    .update(protocolInstance)
    .set(dbUpdates)
    .where(and(eq(protocolInstance.id, instanceId), eq(protocolInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    startDate: new Date(updated.startDate),
    endDate: updated.endDate ? new Date(updated.endDate) : null,
  } as ProtocolInstance;
}

export async function deleteProtocolInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle workout_instances
  const result = await db
    .delete(protocolInstance)
    .where(and(eq(protocolInstance.id, instanceId), eq(protocolInstance.userId, userId)));

  return true;
}

// ============================================================================
// WORKOUT INSTANCE CRUD
// ============================================================================

export async function createWorkoutInstance(
  userId: string,
  instanceData: Omit<WorkoutInstance, 'id' | 'userId'>
): Promise<WorkoutInstance> {
  // Convert date string to Date object if needed (from JSON parsing)
  const dateValue = typeof instanceData.date === 'string' 
    ? new Date(instanceData.date) 
    : instanceData.date;

  const [newInstance] = await db
    .insert(workoutInstance)
    .values({
      userId,
      workoutId: instanceData.workoutId,
      date: dateValue,
      complete: instanceData.complete ?? false,
      duration: instanceData.duration,
      volume: instanceData.volume,
      work: instanceData.work,
      averagePower: instanceData.averagePower,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  // Calculate and update metrics (similar to bodyfat calculation for user stats)
  const metrics = await calculateWorkoutInstanceMetrics(newInstance.id, userId);
  const updateData: any = {};
  if (metrics.work !== undefined) updateData.work = metrics.work;
  if (metrics.averagePower !== undefined) updateData.averagePower = metrics.averagePower;
  if (metrics.volume !== undefined) updateData.volume = metrics.volume;
  
  if (Object.keys(updateData).length > 0) {
    await db
      .update(workoutInstance)
      .set(updateData)
      .where(eq(workoutInstance.id, newInstance.id));
  }

  // Fetch the updated instance
  const updated = await db.query.workoutInstance.findFirst({
    where: (wi, { eq }) => eq(wi.id, newInstance.id),
  });

  return {
    ...(updated || newInstance),
    date: new Date((updated || newInstance).date),
  } as WorkoutInstance;
}

export async function getUserWorkoutInstances(
  userId: string,
  options?: { workoutId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<WorkoutInstance[]> {
  const results = await db.query.workoutInstance.findMany({
    where: (wi, { and, eq, gte, lte }) => {
      const conditions = [eq(wi.userId, userId)];
      if (options?.workoutId) conditions.push(eq(wi.workoutId, options.workoutId));
      // Convert dates to strings for comparison if needed, or rely on driver. 
      // Assuming 'date' column stores timestamp.
      if (options?.dateFrom) conditions.push(gte(wi.date, options.dateFrom));
      if (options?.dateTo) conditions.push(lte(wi.date, options.dateTo));
      return and(...conditions);
    },
    orderBy: (wi, { desc }) => [desc(wi.date)],
    with: {
      workout: true,
    },
  });

  return results.map((r) => ({
    ...nullToUndefined(r),
    date: new Date(r.date),
    workout: r.workout ? { ...nullToUndefined(r.workout), createdAt: new Date(r.workout.createdAt), updatedAt: new Date(r.workout.updatedAt) } : undefined,
  })) as WorkoutInstance[];
}

export async function getWorkoutInstanceById(
  instanceId: string,
  userId: string
): Promise<WorkoutInstance | null> {
  // 1. Fetch the main instance and block instances
  const instance = await db.query.workoutInstance.findFirst({
    where: (wi, { and, eq }) => and(eq(wi.id, instanceId), eq(wi.userId, userId)),
    with: {
      workout: true,
      blockInstances: {
        with: {
          workoutBlock: true,
        },
      },
    },
  });

  if (!instance) return null;

  // 2. Fetch exercise instances for all blocks
  const blockInstanceIds = instance.blockInstances.map((b) => b.id);
  
  let allExerciseInstances: any[] = [];
  
  if (blockInstanceIds.length > 0) {
    allExerciseInstances = await db.query.workoutBlockExerciseInstance.findMany({
      where: (wbei, { inArray }) => inArray(wbei.workoutBlockInstanceId, blockInstanceIds),
      with: {
        workoutBlockExercise: {
          with: {
            exercise: true
          }
        }
      }
    });
  }

  // 3. Stitch them together
  const blockInstancesMap = new Map();
  instance.blockInstances.forEach((bi) => {
    blockInstancesMap.set(bi.id, { 
      ...bi, 
      exerciseInstances: [] 
    });
  });

  allExerciseInstances.forEach((ei) => {
    const block = blockInstancesMap.get(ei.workoutBlockInstanceId);
    if (block) {
      block.exerciseInstances.push(ei);
    }
  });

  // 4. Transform and sort
  const blockInstances = Array.from(blockInstancesMap.values()).map((bi: any) => ({
    ...nullToUndefined(bi),
    date: new Date(bi.date),
    workoutBlock: bi.workoutBlock ? nullToUndefined(bi.workoutBlock) : undefined,
    exerciseInstances: bi.exerciseInstances.map((ei: any) => ({
      ...nullToUndefined(ei),
      created_at: new Date(ei.created_at),
      workoutBlockExercise: ei.workoutBlockExercise ? {
        ...nullToUndefined(ei.workoutBlockExercise),
        exercise: ei.workoutBlockExercise.exercise ? nullToUndefined(ei.workoutBlockExercise.exercise) : undefined
      } : undefined
    })).sort((a: any, b: any) => {
      // Sort by order from definition first, then by created_at for sets within the same exercise
      const orderA = a.workoutBlockExercise?.order ?? 0;
      const orderB = b.workoutBlockExercise?.order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same exercise, sort by created_at
      const createdA = a.created_at?.getTime() ?? 0;
      const createdB = b.created_at?.getTime() ?? 0;
      return createdA - createdB;
    })
  })).sort((a: any, b: any) => {
    // Sort by order from definition if available
    const orderA = a.workoutBlock?.order ?? 0;
    const orderB = b.workoutBlock?.order ?? 0;
    return orderA - orderB;
  });

  return {
    ...nullToUndefined(instance),
    date: new Date(instance.date),
    workout: instance.workout ? { ...nullToUndefined(instance.workout), createdAt: new Date(instance.workout.createdAt), updatedAt: new Date(instance.workout.updatedAt) } : undefined,
    blockInstances
  } as WorkoutInstance;
}

/**
 * Calculate work, averagePower, and volume for a workout instance
 * Similar to how bodyfat is calculated for user stats
 */
async function calculateWorkoutInstanceMetrics(
  instanceId: string,
  userId: string
): Promise<{
  work?: WorkMeasurement;
  averagePower?: PowerMeasurement;
  volume?: WeightMeasurement;
}> {
  // Get the workout instance with all exercise instances
  const instance = await getWorkoutInstanceById(instanceId, userId);
  if (!instance || !instance.blockInstances) {
    return {};
  }

  // Collect all exercise instances
  const allExerciseInstances: WorkoutBlockExerciseInstance[] = [];
  instance.blockInstances.forEach((blockInstance) => {
    if (blockInstance.exerciseInstances) {
      allExerciseInstances.push(...blockInstance.exerciseInstances);
    }
  });

  // If no exercise instances, return empty
  if (allExerciseInstances.length === 0) {
    return {};
  }

  // Get latest user stats for work/power calculation
  const userStats = await getLatestUserStats(userId);
  if (!userStats) {
    // Can't calculate work/power without user stats, but can still calculate volume
    return calculateVolumeOnly(allExerciseInstances);
  }

  // Calculate work and averagePower
  let work: WorkMeasurement | undefined;
  let averagePower: PowerMeasurement | undefined;

  try {
    const result = calculateOutput(userStats, allExerciseInstances, instance.duration || null);
    work = result.allWork;
    // averagePower is only returned if duration is provided
    averagePower = 'averagePower' in result ? result.averagePower : undefined;
  } catch (error) {
    // If calculation fails (e.g., missing stats), just calculate volume
    console.warn('Failed to calculate work/power:', error);
  }

  // Calculate volume (sets * reps * externalLoad)
  const volume = calculateVolume(allExerciseInstances);

  return {
    work,
    averagePower,
    volume,
  };
}

/**
 * Calculate volume from exercise instances
 * Volume = sum of (reps * externalLoad) for each exercise instance
 */
function calculateVolume(
  exerciseInstances: WorkoutBlockExerciseInstance[]
): WeightMeasurement | undefined {
  let totalVolumeKg = 0;
  let hasVolume = false;

  exerciseInstances.forEach((instance) => {
    const reps = instance.measures?.reps || 0;
    const externalLoad = instance.measures?.externalLoad;

    if (reps > 0 && externalLoad?.value) {
      hasVolume = true;
      // Convert to kg for calculation
      let loadKg = externalLoad.value;
      if (externalLoad.unit === 'lbs') {
        loadKg = loadKg * 0.453592; // Convert lbs to kg
      }
      totalVolumeKg += reps * loadKg;
    }
  });

  if (!hasVolume) {
    return undefined;
  }

  // Return in kg (standard unit for volume)
  return {
    value: totalVolumeKg,
    unit: 'kg',
  };
}

/**
 * Calculate volume only (when user stats are not available)
 */
function calculateVolumeOnly(
  exerciseInstances: WorkoutBlockExerciseInstance[]
): { volume?: WeightMeasurement } {
  const volume = calculateVolume(exerciseInstances);
  return { volume };
}

export async function updateWorkoutInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<WorkoutInstance, 'id' | 'userId' | 'workoutId'>>
): Promise<WorkoutInstance | null> {
  const dbUpdates: any = { ...updates };
  if (dbUpdates.date && typeof dbUpdates.date === 'string') {
    dbUpdates.date = new Date(dbUpdates.date);
  }

  const [updated] = await db
    .update(workoutInstance)
    .set(dbUpdates)
    .where(and(eq(workoutInstance.id, instanceId), eq(workoutInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  // Recalculate and update metrics (similar to bodyfat recalculation for user stats)
  const metrics = await calculateWorkoutInstanceMetrics(instanceId, userId);
  const updateData: any = {};
  if (metrics.work !== undefined) updateData.work = metrics.work;
  if (metrics.averagePower !== undefined) updateData.averagePower = metrics.averagePower;
  if (metrics.volume !== undefined) updateData.volume = metrics.volume;
  
  if (Object.keys(updateData).length > 0) {
    await db
      .update(workoutInstance)
      .set(updateData)
      .where(eq(workoutInstance.id, instanceId));
  }

  // Fetch the updated instance
  const final = await db.query.workoutInstance.findFirst({
    where: (wi, { eq }) => eq(wi.id, instanceId),
  });

  return {
    ...(final || updated),
    date: new Date((final || updated).date),
  } as WorkoutInstance;
}

export async function deleteWorkoutInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle workout_block_instances
  const result = await db
    .delete(workoutInstance)
    .where(and(eq(workoutInstance.id, instanceId), eq(workoutInstance.userId, userId)));

  return true;
}

// ============================================================================
// WORKOUT BLOCK INSTANCE CRUD
// ============================================================================

export async function createWorkoutBlockInstance(
  userId: string,
  instanceData: Omit<WorkoutBlockInstance, 'id' | 'userId'>
): Promise<WorkoutBlockInstance> {
  // Convert date string to Date object if needed (from JSON parsing)
  const dateValue = typeof instanceData.date === 'string' 
    ? new Date(instanceData.date) 
    : instanceData.date;

  const [newInstance] = await db
    .insert(workoutBlockInstance)
    .values({
      userId,
      workoutInstanceId: instanceData.workoutInstanceId,
      workoutBlockId: instanceData.workoutBlockId,
      date: dateValue,
      complete: instanceData.complete ?? false,
      duration: instanceData.duration,
      volume: instanceData.volume,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newInstance,
    date: new Date(newInstance.date),
  } as WorkoutBlockInstance;
}

export async function getWorkoutBlockInstanceById(
  instanceId: string,
  userId: string
): Promise<WorkoutBlockInstance | null> {
  const [found] = await db
    .select()
    .from(workoutBlockInstance)
    .where(and(eq(workoutBlockInstance.id, instanceId), eq(workoutBlockInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    date: new Date(found.date),
  } as WorkoutBlockInstance;
}

export async function getWorkoutBlockInstances(
  userId: string,
  options?: { workoutInstanceId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<WorkoutBlockInstance[]> {
  let whereClause = eq(workoutBlockInstance.userId, userId);
  
  if (options?.workoutInstanceId) {
    whereClause = and(
      eq(workoutBlockInstance.userId, userId),
      eq(workoutBlockInstance.workoutInstanceId, options.workoutInstanceId)
    ) as any;
  }

  const results = await db
    .select()
    .from(workoutBlockInstance)
    .where(whereClause)
    .orderBy(workoutBlockInstance.date);
  
  const converted = results.map((r) => ({
    ...nullToUndefined(r),
    date: new Date(r.date),
  })) as WorkoutBlockInstance[];

  // Filter by date range if provided
  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function updateWorkoutBlockInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<WorkoutBlockInstance, 'id' | 'userId' | 'workoutInstanceId' | 'workoutBlockId'>>
): Promise<WorkoutBlockInstance | null> {
  const dbUpdates: any = { ...updates };
  if (dbUpdates.date && typeof dbUpdates.date === 'string') {
    dbUpdates.date = new Date(dbUpdates.date);
  }

  const [updated] = await db
    .update(workoutBlockInstance)
    .set(dbUpdates)
    .where(and(eq(workoutBlockInstance.id, instanceId), eq(workoutBlockInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
  } as WorkoutBlockInstance;
}

export async function deleteWorkoutBlockInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle workout_block_exercise_instances
  const result = await db
    .delete(workoutBlockInstance)
    .where(
      and(eq(workoutBlockInstance.id, instanceId), eq(workoutBlockInstance.userId, userId))
    );

  return true;
}

// ============================================================================
// WORKOUT BLOCK EXERCISE INSTANCE CRUD
// ============================================================================

export async function createWorkoutBlockExerciseInstance(
  userId: string,
  instanceData: Omit<WorkoutBlockExerciseInstance, 'id' | 'userId'>
): Promise<WorkoutBlockExerciseInstance> {
  const [newInstance] = await db
    .insert(workoutBlockExerciseInstance)
    .values({
      userId,
      workoutBlockInstanceId: instanceData.workoutBlockInstanceId,
      workoutBlockExerciseId: instanceData.workoutBlockExerciseId,
      complete: instanceData.complete ?? false,
      personalBest: instanceData.personalBest,
      measures: instanceData.measures,
      projected1RM: instanceData.projected1RM,
      rpe: instanceData.rpe,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newInstance,
    created_at: new Date(newInstance.created_at),
  } as WorkoutBlockExerciseInstance;
}

export async function getWorkoutBlockExerciseInstances(
  workoutBlockInstanceId: string
): Promise<WorkoutBlockExerciseInstance[]> {
  const results = await db
    .select()
    .from(workoutBlockExerciseInstance)
    .where(
      eq(workoutBlockExerciseInstance.workoutBlockInstanceId, workoutBlockInstanceId)
    )
    .orderBy(workoutBlockExerciseInstance.created_at);
  
  return results.map((r) => ({
    ...r,
    created_at: new Date(r.created_at),
  })) as WorkoutBlockExerciseInstance[];
}

export async function updateWorkoutBlockExerciseInstance(
  instanceId: string,
  userId: string,
  updates: Partial<
    Omit<
      WorkoutBlockExerciseInstance,
      'id' | 'userId' | 'workoutBlockInstanceId' | 'workoutBlockExerciseId'
    >
  >
): Promise<WorkoutBlockExerciseInstance | null> {
  const dbUpdates: any = { ...updates };

  const [updated] = await db
    .update(workoutBlockExerciseInstance)
    .set(dbUpdates)
    .where(
      and(
        eq(workoutBlockExerciseInstance.id, instanceId),
        eq(workoutBlockExerciseInstance.userId, userId)
      )
    )
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    created_at: new Date(updated.created_at),
  } as WorkoutBlockExerciseInstance;
}

export async function deleteWorkoutBlockExerciseInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(workoutBlockExerciseInstance)
    .where(
      and(
        eq(workoutBlockExerciseInstance.id, instanceId),
        eq(workoutBlockExerciseInstance.userId, userId)
      )
    );

  return true;
}

// ============================================================================
// PERFORMANCE LOG CRUD
// ============================================================================

export async function getOrCreatePerformanceLog(userId: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(performanceLog)
    .where(eq(performanceLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [newLog] = await db.insert(performanceLog).values({ userId }).returning();
  return newLog.id;
}

export async function createPerformance(
  userId: string,
  performanceData: Omit<Performance, 'id' | 'performanceLogId'>
): Promise<Performance> {
  const performanceLogId = await getOrCreatePerformanceLog(userId);

  const [newPerformance] = await db
    .insert(performance)
    .values({
      performanceLogId,
      date: performanceData.date,
      duration: performanceData.duration,
      volume: performanceData.volume,
      work: performanceData.work,
      power: performanceData.power,
      notes: performanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newPerformance,
    date: new Date(newPerformance.date),
  } as Performance;
}

export async function getUserPerformances(userId: string): Promise<Performance[]> {
  const performanceLogId = await getOrCreatePerformanceLog(userId);

  const results = await db
    .select()
    .from(performance)
    .where(eq(performance.performanceLogId, performanceLogId))
    .orderBy(desc(performance.date));
  
  return results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as Performance[];
}

// ============================================================================
// PROJECTED 1RM LOG CRUD
// ============================================================================

export async function getOrCreateProjected1RMLog(userId: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(projected1RMLog)
    .where(eq(projected1RMLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [newLog] = await db.insert(projected1RMLog).values({ userId }).returning();
  return newLog.id;
}

export async function createProjected1RM(
  userId: string,
  projected1RMData: Omit<Projected1RM, 'id' | 'projected1RMLogId'>
): Promise<Projected1RM> {
  const projected1RMLogId = await getOrCreateProjected1RMLog(userId);

  const [newProjected1RM] = await db
    .insert(projected1RM)
    .values({
      projected1RMLogId,
      date: projected1RMData.date,
      exerciseId: projected1RMData.exerciseId,
      projected1RM: projected1RMData.projected1RM,
      notes: projected1RMData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newProjected1RM,
    date: new Date(newProjected1RM.date),
  } as Projected1RM;
}

export async function getUserProjected1RMs(
  userId: string,
  exerciseId?: string
): Promise<Projected1RM[]> {
  const projected1RMLogId = await getOrCreateProjected1RMLog(userId);

  let whereClause = eq(projected1RM.projected1RMLogId, projected1RMLogId);
  
  if (exerciseId) {
    whereClause = and(
      eq(projected1RM.projected1RMLogId, projected1RMLogId),
      eq(projected1RM.exerciseId, exerciseId)
    ) as any;
  }

  const results = await db
    .select()
    .from(projected1RM)
    .where(whereClause)
    .orderBy(desc(projected1RM.date));
  
  return results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as Projected1RM[];
}
