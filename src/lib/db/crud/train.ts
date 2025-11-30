import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../index';
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

  return newProtocol as Protocol;
}

export async function getProtocols(): Promise<Protocol[]> {
  return await db.select().from(protocol).orderBy(desc(protocol.createdAt));
}

export async function getProtocolById(protocolId: string): Promise<Protocol | null> {
  const [found] = await db
    .select()
    .from(protocol)
    .where(eq(protocol.id, protocolId))
    .limit(1);

  return (found as Protocol) || null;
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

  return (updated as Protocol) || null;
}

export async function deleteProtocol(protocolId: string): Promise<boolean> {
  const result = await db.delete(protocol).where(eq(protocol.id, protocolId));
  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// WORKOUT CRUD
// ============================================================================

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

  return newWorkout as Workout;
}

export async function getUserWorkouts(userId: string): Promise<Workout[]> {
  return await db
    .select()
    .from(workout)
    .where(eq(workout.userId, userId))
    .orderBy(desc(workout.createdAt));
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

  return (found as Workout) || null;
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

  return (updated as Workout) || null;
}

export async function deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
  // CASCADE will handle workout_blocks, workout_block_exercises, etc.
  const result = await db
    .delete(workout)
    .where(and(eq(workout.id, workoutId), eq(workout.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
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

  return newBlock as WorkoutBlock;
}

export async function getWorkoutBlocks(workoutId: string): Promise<WorkoutBlock[]> {
  return await db
    .select()
    .from(workoutBlock)
    .where(eq(workoutBlock.workoutId, workoutId))
    .orderBy(workoutBlock.order);
}

export async function getWorkoutBlockById(blockId: string): Promise<WorkoutBlock | null> {
  const [found] = await db
    .select()
    .from(workoutBlock)
    .where(eq(workoutBlock.id, blockId))
    .limit(1);

  return (found as WorkoutBlock) || null;
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

  return (updated as WorkoutBlock) || null;
}

export async function deleteWorkoutBlock(blockId: string): Promise<boolean> {
  // CASCADE will handle workout_block_exercises
  const result = await db.delete(workoutBlock).where(eq(workoutBlock.id, blockId));
  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// WORKOUT BLOCK EXERCISE CRUD
// ============================================================================

export async function createWorkoutBlockExercise(
  blockId: string,
  exerciseData: Omit<WorkoutBlockExercise, 'id' | 'exercise'>
): Promise<WorkoutBlockExercise> {
  const [newExercise] = await db
    .insert(workoutBlockExercise)
    .values({
      workoutBlockId: blockId,
      exerciseId: exerciseData.exercise.id,
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
    .where(eq(exercise.id, exerciseData.exercise.id))
    .limit(1);

  return {
    ...(newExercise as WorkoutBlockExercise),
    exercise: fullExercise as Exercise,
  };
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

  return exercises.map((e) => ({
    ...(e as WorkoutBlockExercise),
    exercise: exerciseMap.get(e.exerciseId) as Exercise,
  }));
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

  return {
    ...(updated as WorkoutBlockExercise),
    exercise: fullExercise as Exercise,
  };
}

export async function deleteWorkoutBlockExercise(exerciseId: string): Promise<boolean> {
  const result = await db
    .delete(workoutBlockExercise)
    .where(eq(workoutBlockExercise.id, exerciseId));

  return result.rowCount !== null && result.rowCount > 0;
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

  return newExercise as Exercise;
}

export async function getExercises(): Promise<Exercise[]> {
  return await db.select().from(exercise).orderBy(exercise.name);
}

export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const [found] = await db
    .select()
    .from(exercise)
    .where(eq(exercise.id, exerciseId))
    .limit(1);

  return (found as Exercise) || null;
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  return await db
    .select()
    .from(exercise)
    .where(eq(exercise.name, query))
    .orderBy(exercise.name);
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

  return (updated as Exercise) || null;
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
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as ProtocolInstance;
}

export async function getUserProtocolInstances(
  userId: string,
  activeOnly = false
): Promise<ProtocolInstance[]> {
  const query = db
    .select()
    .from(protocolInstance)
    .where(eq(protocolInstance.userId, userId));

  if (activeOnly) {
    query.where(and(eq(protocolInstance.userId, userId), eq(protocolInstance.active, true)));
  }

  return await query.orderBy(desc(protocolInstance.startDate));
}

export async function updateProtocolInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<ProtocolInstance, 'id' | 'userId' | 'protocolId'>>
): Promise<ProtocolInstance | null> {
  const [updated] = await db
    .update(protocolInstance)
    .set(updates)
    .where(and(eq(protocolInstance.id, instanceId), eq(protocolInstance.userId, userId)))
    .returning();

  return (updated as ProtocolInstance) || null;
}

export async function deleteProtocolInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle workout_instances
  const result = await db
    .delete(protocolInstance)
    .where(and(eq(protocolInstance.id, instanceId), eq(protocolInstance.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// WORKOUT INSTANCE CRUD
// ============================================================================

export async function createWorkoutInstance(
  userId: string,
  instanceData: Omit<WorkoutInstance, 'id' | 'userId'>
): Promise<WorkoutInstance> {
  const [newInstance] = await db
    .insert(workoutInstance)
    .values({
      userId,
      workoutId: instanceData.workoutId,
      date: instanceData.date,
      complete: instanceData.complete ?? false,
      duration: instanceData.duration,
      volume: instanceData.volume,
      work: instanceData.work,
      averagePower: instanceData.averagePower,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as WorkoutInstance;
}

export async function getUserWorkoutInstances(
  userId: string,
  options?: { workoutId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<WorkoutInstance[]> {
  let query = db.select().from(workoutInstance).where(eq(workoutInstance.userId, userId));

  if (options?.workoutId) {
    query = query.where(
      and(eq(workoutInstance.userId, userId), eq(workoutInstance.workoutId, options.workoutId))
    );
  }

  const results = await query.orderBy(desc(workoutInstance.date));

  // Filter by date range if provided (client-side for now)
  if (options?.dateFrom || options?.dateTo) {
    return results.filter((instance) => {
      const instanceDate = new Date(instance.date);
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return results;
}

export async function updateWorkoutInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<WorkoutInstance, 'id' | 'userId' | 'workoutId' | 'date'>>
): Promise<WorkoutInstance | null> {
  const [updated] = await db
    .update(workoutInstance)
    .set(updates)
    .where(and(eq(workoutInstance.id, instanceId), eq(workoutInstance.userId, userId)))
    .returning();

  return (updated as WorkoutInstance) || null;
}

export async function deleteWorkoutInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  // CASCADE will handle workout_block_instances
  const result = await db
    .delete(workoutInstance)
    .where(and(eq(workoutInstance.id, instanceId), eq(workoutInstance.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================================================
// WORKOUT BLOCK INSTANCE CRUD
// ============================================================================

export async function createWorkoutBlockInstance(
  userId: string,
  instanceData: Omit<WorkoutBlockInstance, 'id' | 'userId'>
): Promise<WorkoutBlockInstance> {
  const [newInstance] = await db
    .insert(workoutBlockInstance)
    .values({
      userId,
      workoutInstanceId: instanceData.workoutInstanceId,
      workoutBlockId: instanceData.workoutBlockId,
      date: instanceData.date,
      complete: instanceData.complete ?? false,
      duration: instanceData.duration,
      volume: instanceData.volume,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as WorkoutBlockInstance;
}

export async function getWorkoutBlockInstances(
  workoutInstanceId: string
): Promise<WorkoutBlockInstance[]> {
  return await db
    .select()
    .from(workoutBlockInstance)
    .where(eq(workoutBlockInstance.workoutInstanceId, workoutInstanceId))
    .orderBy(workoutBlockInstance.date);
}

export async function updateWorkoutBlockInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<WorkoutBlockInstance, 'id' | 'userId' | 'workoutInstanceId' | 'workoutBlockId' | 'date'>>
): Promise<WorkoutBlockInstance | null> {
  const [updated] = await db
    .update(workoutBlockInstance)
    .set(updates)
    .where(and(eq(workoutBlockInstance.id, instanceId), eq(workoutBlockInstance.userId, userId)))
    .returning();

  return (updated as WorkoutBlockInstance) || null;
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

  return result.rowCount !== null && result.rowCount > 0;
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
      date: instanceData.date,
      complete: instanceData.complete ?? false,
      personalBest: instanceData.personalBest,
      duration: instanceData.duration,
      measures: instanceData.measures,
      projected1RM: instanceData.projected1RM,
      rpe: instanceData.rpe,
      notes: instanceData.notes,
    })
    .returning();

  return newInstance as WorkoutBlockExerciseInstance;
}

export async function getWorkoutBlockExerciseInstances(
  workoutBlockInstanceId: string
): Promise<WorkoutBlockExerciseInstance[]> {
  return await db
    .select()
    .from(workoutBlockExerciseInstance)
    .where(
      eq(workoutBlockExerciseInstance.workoutBlockInstanceId, workoutBlockInstanceId)
    )
    .orderBy(workoutBlockExerciseInstance.date);
}

export async function updateWorkoutBlockExerciseInstance(
  instanceId: string,
  userId: string,
  updates: Partial<
    Omit<
      WorkoutBlockExerciseInstance,
      'id' | 'userId' | 'workoutBlockInstanceId' | 'workoutBlockExerciseId' | 'date'
    >
  >
): Promise<WorkoutBlockExerciseInstance | null> {
  const [updated] = await db
    .update(workoutBlockExerciseInstance)
    .set(updates)
    .where(
      and(
        eq(workoutBlockExerciseInstance.id, instanceId),
        eq(workoutBlockExerciseInstance.userId, userId)
      )
    )
    .returning();

  return (updated as WorkoutBlockExerciseInstance) || null;
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

  return result.rowCount !== null && result.rowCount > 0;
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
      notes: performanceData.notes,
    })
    .returning();

  return newPerformance as Performance;
}

export async function getUserPerformances(userId: string): Promise<Performance[]> {
  const performanceLogId = await getOrCreatePerformanceLog(userId);

  return await db
    .select()
    .from(performance)
    .where(eq(performance.performanceLogId, performanceLogId))
    .orderBy(desc(performance.date));
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
      notes: projected1RMData.notes,
    })
    .returning();

  return newProjected1RM as Projected1RM;
}

export async function getUserProjected1RMs(
  userId: string,
  exerciseId?: string
): Promise<Projected1RM[]> {
  const projected1RMLogId = await getOrCreateProjected1RMLog(userId);

  let query = db
    .select()
    .from(projected1RM)
    .where(eq(projected1RM.projected1RMLogId, projected1RMLogId));

  if (exerciseId) {
    query = query.where(
      and(
        eq(projected1RM.projected1RMLogId, projected1RMLogId),
        eq(projected1RM.exerciseId, exerciseId)
      )
    );
  }

  return await query.orderBy(desc(projected1RM.date));
}

