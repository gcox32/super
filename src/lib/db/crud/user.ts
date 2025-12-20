import { eq, and, desc } from 'drizzle-orm';
import { db } from '../index';

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
  user,
  userProfile,
  userGoal,
  userGoalComponent,
  userGoalCriteria,
  userStatsLog,
  userStats,
  tapeMeasurement,
  userImageLog,
  userImage,
  userProfileKeyExercise,
} from '../schema';
import type { User, UserProfile, UserGoal, UserGoalComponent, UserStats, TapeMeasurement, UserImage, UserGoalCriteria, GoalComponentType, GoalComponentConditional } from '@/types/user';

// ============================================================================
// USER CRUD
// ============================================================================

export async function createUser(userData: {
  id: string;
  email: string;
}): Promise<User> {
  const [newUser] = await db
    .insert(user)
    .values({
      id: userData.id,
      email: userData.email,
    })
    .returning();

  return newUser as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return (foundUser as User) || null;
}

export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'email'>>
): Promise<User | null> {
  const [updatedUser] = await db
    .update(user)
    .set(updates)
    .where(eq(user.id, userId))
    .returning();

  if (!updatedUser) return null;

  return updatedUser as User;
}

// ============================================================================
// USER PROFILE CRUD
// ============================================================================

export async function createUserProfile(
  userId: string,
  profileData: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<UserProfile> {
  const [newProfile] = await db
    .insert(userProfile)
    .values({
      userId,
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profilePicture: profileData.profilePicture,
      bio: profileData.bio,
      gender: profileData.gender,
      birthDate: profileData.birthDate ? profileData.birthDate.toISOString().split('T')[0] : null,
      dailyWaterRecommendation: profileData.dailyWaterRecommendation,
      activityLevel: profileData.activityLevel,
    } as any)
    .returning();

  // Insert key exercises if provided
  if (profileData.keyExercises && profileData.keyExercises.length > 0) {
    await db.insert(userProfileKeyExercise).values(
      profileData.keyExercises.map(exerciseId => ({
        userProfileId: newProfile.id,
        exerciseId,
      }))
    );
  }

  return {
    ...nullToUndefined(newProfile),
    birthDate: newProfile.birthDate ? new Date(newProfile.birthDate) : undefined,
    keyExercises: profileData.keyExercises,
  } as UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  if (!profile) return null;

  // Fetch key exercises from junction table
  const keyExerciseRows = await db
    .select({ exerciseId: userProfileKeyExercise.exerciseId })
    .from(userProfileKeyExercise)
    .where(eq(userProfileKeyExercise.userProfileId, profile.id));

  const keyExercises = keyExerciseRows.map(row => row.exerciseId);

  return {
    ...nullToUndefined(profile),
    birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
    keyExercises: keyExercises.length > 0 ? keyExercises : undefined,
  } as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile | null> {
  // Get the profile first to access its id
  const [existingProfile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  if (!existingProfile) return null;

  // Handle keyExercises separately if provided
  const { keyExercises, ...profileUpdates } = updates;
  
  // Only update profile if there are actual profile fields to update
  let updatedProfile = existingProfile;
  if (Object.keys(profileUpdates).length > 0) {
    // Convert Date objects to strings for database
    const dbUpdates: any = { ...profileUpdates };
    if (profileUpdates.birthDate !== undefined) {
      dbUpdates.birthDate = profileUpdates.birthDate ? profileUpdates.birthDate : null;
    }

    const [result] = await db
      .update(userProfile)
      .set(dbUpdates)
      .where(eq(userProfile.userId, userId))
      .returning();

    if (!result) return null;
    updatedProfile = result;
  }

  // Update key exercises if provided
  if (keyExercises !== undefined) {
    // Ensure keyExercises is an array
    if (!Array.isArray(keyExercises)) {
      throw new Error('keyExercises must be an array');
    }

    // Delete existing key exercises
    await db
      .delete(userProfileKeyExercise)
      .where(eq(userProfileKeyExercise.userProfileId, existingProfile.id));

    // Insert new key exercises
    if (keyExercises.length > 0) {
      await db.insert(userProfileKeyExercise).values(
        keyExercises.map(exerciseId => ({
          userProfileId: existingProfile.id,
          exerciseId,
        }))
      );
    }
  }

  // Fetch updated key exercises
  const keyExerciseRows = await db
    .select({ exerciseId: userProfileKeyExercise.exerciseId })
    .from(userProfileKeyExercise)
    .where(eq(userProfileKeyExercise.userProfileId, updatedProfile.id));

  const updatedKeyExercises = keyExerciseRows.map(row => row.exerciseId);

  return {
    ...nullToUndefined(updatedProfile),
    birthDate: updatedProfile.birthDate ? new Date(updatedProfile.birthDate) : undefined,
    keyExercises: updatedKeyExercises.length > 0 ? updatedKeyExercises : undefined,
  } as UserProfile;
}

// ============================================================================
// USER GOAL CRUD
// ============================================================================

async function fetchGoalComponents(goalId: string): Promise<UserGoalComponent[]> {
  const components = await db
    .select()
    .from(userGoalComponent)
    .where(eq(userGoalComponent.goalId, goalId))
    .orderBy(userGoalComponent.priority);

  // Fetch criteria for each component
  const componentsWithCriteria = await Promise.all(
    components.map(async (comp) => {
      const criteria = await db
        .select()
        .from(userGoalCriteria)
        .where(eq(userGoalCriteria.componentId, comp.id));

      // Map DB type to TS type for UserGoalCriteria
      const mappedCriteria: UserGoalCriteria[] = criteria.map(c => ({
        id: c.id,
        type: c.type as GoalComponentType | undefined,
        conditional: c.conditional as GoalComponentConditional,
        value: c.value as any, // Cast JSONB to expected type
        initialValue: c.initialValue as any,
        measurementSite: c.measurementSite as any,
      }));

      return {
        ...nullToUndefined(comp),
        type: comp.type as GoalComponentType | undefined,
        createdAt: new Date(comp.createdAt),
        updatedAt: new Date(comp.updatedAt),
        exerciseId: comp.exerciseId || undefined,
        criteria: mappedCriteria,
        // Legacy fields mapping for backward compatibility if needed, else undefined
        conditional: undefined,
        value: undefined,
        measurementSite: undefined,
      } as UserGoalComponent;
    })
  );

  return componentsWithCriteria;
}

export async function createUserGoal(
  userId: string,
  goalData: Omit<UserGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<UserGoal> {
  // Start transaction could be better here but simple sequence for now
  const [newGoal] = await db
    .insert(userGoal)
    .values({
      userId,
      name: goalData.name,
      description: goalData.description,
      // components JSONB is deprecated/ignored
      duration: goalData.duration,
      startDate: goalData.startDate ? goalData.startDate : null,
      endDate: goalData.endDate ? goalData.endDate : null,
      complete: goalData.complete ?? false,
      notes: goalData.notes ?? null,
    } as any)
    .returning();

  // Insert components and criteria if provided
  if (goalData.components && goalData.components.length > 0) {
    for (const comp of goalData.components) {
      const [newComp] = await db.insert(userGoalComponent).values({
        goalId: newGoal.id,
        name: comp.name,
        description: comp.description,
        type: comp.type,
        priority: comp.priority,
        complete: comp.complete,
        exerciseId: comp.exerciseId,
        notes: comp.notes,
      } as any).returning();

      if (comp.criteria && comp.criteria.length > 0) {
        for (const crit of comp.criteria) {
          await db.insert(userGoalCriteria).values({
            componentId: newComp.id,
            type: crit.type,
            conditional: crit.conditional,
            value: crit.value,
            initialValue: crit.initialValue,
            measurementSite: crit.measurementSite,
          } as any);
        }
      }
    }
  }

  const savedComponents = await fetchGoalComponents(newGoal.id);

  return {
    ...nullToUndefined(newGoal),
    components: savedComponents,
    startDate: newGoal.startDate ? new Date(newGoal.startDate) : undefined,
    endDate: newGoal.endDate ? new Date(newGoal.endDate) : undefined,
  } as UserGoal;
}

export async function getUserGoals(userId: string): Promise<UserGoal[]> {
  const results = await db
    .select()
    .from(userGoal)
    .where(eq(userGoal.userId, userId))
    .orderBy(desc(userGoal.createdAt));
  
  const goalsWithComponents = await Promise.all(
    results.map(async (r) => {
      const components = await fetchGoalComponents(r.id);
      return {
        ...nullToUndefined(r),
        components,
        startDate: r.startDate ? new Date(r.startDate) : undefined,
        endDate: r.endDate ? new Date(r.endDate) : undefined,
      };
    })
  );

  return goalsWithComponents as UserGoal[];
}

export async function getUserGoalById(goalId: string, userId: string): Promise<UserGoal | null> {
  const [goal] = await db
    .select()
    .from(userGoal)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)))
    .limit(1);

  if (!goal) return null;

  const components = await fetchGoalComponents(goal.id);

  return {
    ...nullToUndefined(goal),
    components,
    startDate: goal.startDate ? new Date(goal.startDate) : undefined,
    endDate: goal.endDate ? new Date(goal.endDate) : undefined,
  } as UserGoal;
}

export async function updateUserGoal(
  goalId: string,
  userId: string,
  updates: Partial<Omit<UserGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserGoal | null> {
  // Convert Date objects to strings for database
  const dbUpdates: any = { ...updates };
  // Remove components from direct update to userGoal table
  delete dbUpdates.components;
  
  if (updates.startDate !== undefined) {
    dbUpdates.startDate = updates.startDate ? updates.startDate : null;
  }
  if (updates.endDate !== undefined) {
    dbUpdates.endDate = updates.endDate ? updates.endDate : null;
  }

  const [updatedGoal] = await db
    .update(userGoal)
    .set(dbUpdates)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)))
    .returning();

  if (!updatedGoal) return null;

  // Handle Components Update (Full Replacement Strategy for simplicity)
  // In a more complex app, we might diff/patch, but for now we wipe and rewrite components if provided
  if (updates.components !== undefined) {
    // Delete existing components (cascade deletes criteria)
    await db.delete(userGoalComponent).where(eq(userGoalComponent.goalId, goalId));

    // Re-insert components
    if (updates.components.length > 0) {
        for (const comp of updates.components) {
            const [newComp] = await db.insert(userGoalComponent).values({
              goalId: updatedGoal.id,
              name: comp.name,
              description: comp.description,
              type: comp.type,
              priority: comp.priority,
              complete: comp.complete,
              exerciseId: comp.exerciseId,
              notes: comp.notes,
              // Maintain original creation date if possible, or let default
              // For full fidelity, we might want to pass existing IDs if we want to update instead of replace
            } as any).returning();
      
            if (comp.criteria && comp.criteria.length > 0) {
              for (const crit of comp.criteria) {
                await db.insert(userGoalCriteria).values({
                  componentId: newComp.id,
                  type: crit.type,
                  conditional: crit.conditional,
                  value: crit.value,
                  initialValue: crit.initialValue,
                  measurementSite: crit.measurementSite,
                } as any);
              }
            }
          }
    }
  }

  const components = await fetchGoalComponents(updatedGoal.id);

  return {
    ...nullToUndefined(updatedGoal),
    components,
    startDate: updatedGoal.startDate ? new Date(updatedGoal.startDate) : undefined,
    endDate: updatedGoal.endDate ? new Date(updatedGoal.endDate) : undefined,
  } as UserGoal;
}

export async function deleteUserGoal(goalId: string, userId: string): Promise<boolean> {
  // Cascade delete should handle components/criteria if set up in DB foreign keys
  // If not, we should delete components manually first
  await db.delete(userGoalComponent).where(eq(userGoalComponent.goalId, goalId));

  const result = await db
    .delete(userGoal)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)));

  return true;
}

// ============================================================================
// USER STATS CRUD
// ============================================================================

export async function getOrCreateUserStatsLog(userId: string): Promise<string> {
  // Check if stats log exists
  const [existing] = await db
    .select()
    .from(userStatsLog)
    .where(eq(userStatsLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  // Create new stats log
  const [newLog] = await db
    .insert(userStatsLog)
    .values({ userId })
    .returning();

  return newLog.id;
}

export async function createUserStats(
  userId: string,
  statsData: Omit<UserStats, 'id' | 'statsLogId'>
): Promise<UserStats> {
  const statsLogId = await getOrCreateUserStatsLog(userId);
  const [newStats] = await db
    .insert(userStats)
    .values({
      statsLogId,
      height: statsData.height,
      weight: statsData.weight,
      armLength: statsData.armLength,
      legLength: statsData.legLength,
      bodyFatPercentage: statsData.bodyFatPercentage,
      muscleMass: statsData.muscleMass,
      date: statsData.date ? statsData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } as any)
    .returning();

  // Create tape measurement if provided
  if (statsData.tapeMeasurements) {
    await db.insert(tapeMeasurement).values({
      userStatsId: newStats.id,
      neck: statsData.tapeMeasurements.neck,
      shoulders: statsData.tapeMeasurements.shoulders,
      chest: statsData.tapeMeasurements.chest,
      waist: statsData.tapeMeasurements.waist,
      hips: statsData.tapeMeasurements.hips,
      leftArm: statsData.tapeMeasurements.leftArm,
      rightArm: statsData.tapeMeasurements.rightArm,
      leftLeg: statsData.tapeMeasurements.leftLeg,
      rightLeg: statsData.tapeMeasurements.rightLeg,
      leftForearm: statsData.tapeMeasurements.leftForearm,
      rightForearm: statsData.tapeMeasurements.rightForearm,
      leftCalf: statsData.tapeMeasurements.leftCalf,
      rightCalf: statsData.tapeMeasurements.rightCalf,
    }).returning();
  }

  return {
    ...newStats,
    date: new Date(newStats.date),
  } as UserStats;
}

export async function getUserStats(userId: string): Promise<UserStats[]> {
  const statsLogId = await getOrCreateUserStatsLog(userId);

  const results = await db
    .select()
    .from(userStats)
    .where(eq(userStats.statsLogId, statsLogId))
    .orderBy(desc(userStats.date));
  
  return results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as UserStats[];
}

export async function getUserStatsById(
  statsId: string,
  userId: string
): Promise<(UserStats & { tapeMeasurements?: TapeMeasurement }) | null> {
  const statsLogId = await getOrCreateUserStatsLog(userId);

  const [stat] = await db
    .select()
    .from(userStats)
    .where(and(eq(userStats.id, statsId), eq(userStats.statsLogId, statsLogId)))
    .limit(1);

  if (!stat) {
    return null;
  }

  // Get tape measurement if it exists
  const [tape] = await db
    .select()
    .from(tapeMeasurement)
    .where(eq(tapeMeasurement.userStatsId, stat.id))
    .limit(1);

  return {
    ...(stat as any),
    date: new Date(stat.date),
    tapeMeasurements: tape ? (tape as TapeMeasurement) : undefined,
  } as UserStats & { tapeMeasurements?: TapeMeasurement };
}

export async function getLatestUserStats(
  userId: string
): Promise<(UserStats & { tapeMeasurements?: TapeMeasurement }) | null> {
  const stats = await getUserStats(userId);
  if (stats.length === 0) {
    return null;
  }

  const latest = stats[0];
  const [tape] = await db
    .select()
    .from(tapeMeasurement)
    .where(eq(tapeMeasurement.userStatsId, latest.id))
    .limit(1);

  return {
    ...(latest as any),
    tapeMeasurements: tape ? (tape as TapeMeasurement) : undefined,
  } as UserStats & { tapeMeasurements?: TapeMeasurement };
}

export async function deleteUserStats(statsId: string, userId: string): Promise<boolean> {
  const statsLogId = await getOrCreateUserStatsLog(userId);

  // Delete will cascade to tape_measurement
  const result = await db
    .delete(userStats)
    .where(and(eq(userStats.id, statsId), eq(userStats.statsLogId, statsLogId)));

  return true;
}

// ============================================================================
// USER IMAGE CRUD
// ============================================================================

export async function getOrCreateUserImageLog(userId: string): Promise<string> {
  const [existing] = await db
    .select()
    .from(userImageLog)
    .where(eq(userImageLog.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [newLog] = await db
    .insert(userImageLog)
    .values({ userId })
    .returning();

  return newLog.id;
}

export async function createUserImage(
  userId: string,
  imageData: Omit<UserImage, 'id' | 'imageLogId'>
): Promise<UserImage> {
  const imageLogId = await getOrCreateUserImageLog(userId);

  const [newImage] = await db
    .insert(userImage)
    .values({
      imageLogId,
      date: imageData.date ? imageData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      imageUrl: imageData.imageUrl,
      notes: imageData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newImage,
    date: new Date(newImage.date),
  } as UserImage;
}

export async function getUserImages(userId: string): Promise<UserImage[]> {
  const imageLogId = await getOrCreateUserImageLog(userId);

  const results = await db
    .select()
    .from(userImage)
    .where(eq(userImage.imageLogId, imageLogId))
    .orderBy(desc(userImage.date));
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    date: new Date(r.date),
  })) as UserImage[];
}

export async function getUserImageById(
  imageId: string,
  userId: string
): Promise<UserImage | null> {
  const imageLogId = await getOrCreateUserImageLog(userId);

  const [image] = await db
    .select()
    .from(userImage)
    .where(and(eq(userImage.id, imageId), eq(userImage.imageLogId, imageLogId)))
    .limit(1);

  if (!image) return null;

  return {
    ...nullToUndefined(image),
    date: new Date(image.date),
  } as UserImage;
}

export async function getLatestUserImage(userId: string): Promise<UserImage | null> {
  const images = await getUserImages(userId);
  return images.length > 0 ? (images[0] as UserImage) : null;
}

export async function deleteUserImage(imageId: string, userId: string): Promise<boolean> {
  const imageLogId = await getOrCreateUserImageLog(userId);

  const result = await db
    .delete(userImage)
    .where(and(eq(userImage.id, imageId), eq(userImage.imageLogId, imageLogId)));

  return true;
}
