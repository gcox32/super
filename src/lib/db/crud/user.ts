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
  userStatsLog,
  userStats,
  tapeMeasurement,
  userImageLog,
  userImage,
  userProfileKeyExercise,
} from '../schema';
import type { User, UserProfile, UserGoal, UserGoalComponent, UserStats, TapeMeasurement, UserImage } from '@/types/user';

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

// Helper to deserialize components from JSONB (convert date strings to Date objects)
function deserializeComponents(components: any): UserGoalComponent[] | undefined {
  if (!components || !Array.isArray(components)) {
    return undefined;
  }
  return components.map((comp: any) => ({
    ...comp,
    createdAt: comp.createdAt ? new Date(comp.createdAt) : new Date(),
    updatedAt: comp.updatedAt ? new Date(comp.updatedAt) : new Date(),
  }));
}

// Helper to serialize components for JSONB (convert Date objects to ISO strings)
// Also handles cases where dates come as strings from JSON parsing
function serializeComponents(components: UserGoalComponent[] | undefined): any {
  if (!components || !Array.isArray(components)) {
    return null;
  }
  return components.map((comp) => {
    // Handle createdAt - could be Date, string, or undefined
    let createdAt: string | undefined;
    if (comp.createdAt instanceof Date) {
      createdAt = comp.createdAt.toISOString();
    } else if (typeof comp.createdAt === 'string') {
      createdAt = comp.createdAt;
    } else {
      createdAt = new Date().toISOString();
    }

    // Handle updatedAt - could be Date, string, or undefined
    let updatedAt: string | undefined;
    if (comp.updatedAt instanceof Date) {
      updatedAt = comp.updatedAt.toISOString();
    } else if (typeof comp.updatedAt === 'string') {
      updatedAt = comp.updatedAt;
    } else {
      updatedAt = new Date().toISOString();
    }

    return {
      id: comp.id,
      name: comp.name,
      description: comp.description,
      type: comp.type,
      conditional: comp.conditional,
      value: comp.value,
      priority: comp.priority,
      complete: comp.complete,
      notes: comp.notes,
      createdAt,
      updatedAt,
    };
  });
}

export async function createUserGoal(
  userId: string,
  goalData: Omit<UserGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<UserGoal> {
  const [newGoal] = await db
    .insert(userGoal)
    .values({
      userId,
      name: goalData.name,
      description: goalData.description,
      components: serializeComponents(goalData.components),
      duration: goalData.duration,
      startDate: goalData.startDate ? goalData.startDate : null,
      endDate: goalData.endDate ? goalData.endDate : null,
      complete: goalData.complete ?? false,
      notes: goalData.notes ?? null,
    } as any)
    .returning();

  return {
    ...nullToUndefined(newGoal),
    components: deserializeComponents(newGoal.components),
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
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    components: deserializeComponents(r.components),
    startDate: r.startDate ? new Date(r.startDate) : undefined,
    endDate: r.endDate ? new Date(r.endDate) : undefined,
  })) as UserGoal[];
}

export async function getUserGoalById(goalId: string, userId: string): Promise<UserGoal | null> {
  const [goal] = await db
    .select()
    .from(userGoal)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)))
    .limit(1);

  if (!goal) return null;

  return {
    ...nullToUndefined(goal),
    components: deserializeComponents(goal.components),
    startDate: goal.startDate ? new Date(goal.startDate) : undefined,
    endDate: goal.endDate ? new Date(goal.endDate) : undefined,
  } as UserGoal;
}

export async function updateUserGoal(
  goalId: string,
  userId: string,
  updates: Partial<Omit<UserGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserGoal | null> {
  // Convert Date objects to strings for database and serialize components
  const dbUpdates: any = { ...updates };
  if (updates.components !== undefined) {
    dbUpdates.components = serializeComponents(updates.components);
  }
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

  return {
    ...nullToUndefined(updatedGoal),
    components: deserializeComponents(updatedGoal.components),
    startDate: updatedGoal.startDate ? new Date(updatedGoal.startDate) : undefined,
    endDate: updatedGoal.endDate ? new Date(updatedGoal.endDate) : undefined,
  } as UserGoal;
}

export async function deleteUserGoal(goalId: string, userId: string): Promise<boolean> {
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

