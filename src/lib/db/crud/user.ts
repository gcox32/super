import { eq, and, desc } from 'drizzle-orm';
import { db } from '../index';
import {
  user,
  userProfile,
  userGoal,
  userStatsLog,
  userStats,
  tapeMeasurement,
  userImageLog,
  userImage,
} from '../schema';
import type { User, UserProfile, UserGoal, UserStats, TapeMeasurement, UserImage } from '@/types/user';

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

  return (updatedUser as User) || null;
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
      birthDate: profileData.birthDate,
      dailyWaterRecommendation: profileData.dailyWaterRecommendation,
      activityLevel: profileData.activityLevel,
    })
    .returning();

  return newProfile as UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  return (profile as UserProfile) || null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile | null> {
  const [updatedProfile] = await db
    .update(userProfile)
    .set(updates)
    .where(eq(userProfile.userId, userId))
    .returning();

  return (updatedProfile as UserProfile) || null;
}

// ============================================================================
// USER GOAL CRUD
// ============================================================================

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
      duration: goalData.duration,
      startDate: goalData.startDate,
      endDate: goalData.endDate,
      complete: goalData.complete ?? false,
      notes: goalData.notes,
    })
    .returning();

  return newGoal as UserGoal;
}

export async function getUserGoals(userId: string): Promise<UserGoal[]> {
  return await db
    .select()
    .from(userGoal)
    .where(eq(userGoal.userId, userId))
    .orderBy(desc(userGoal.createdAt));
}

export async function getUserGoalById(goalId: string, userId: string): Promise<UserGoal | null> {
  const [goal] = await db
    .select()
    .from(userGoal)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)))
    .limit(1);

  return (goal as UserGoal) || null;
}

export async function updateUserGoal(
  goalId: string,
  userId: string,
  updates: Partial<Omit<UserGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserGoal | null> {
  const [updatedGoal] = await db
    .update(userGoal)
    .set(updates)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)))
    .returning();

  return (updatedGoal as UserGoal) || null;
}

export async function deleteUserGoal(goalId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(userGoal)
    .where(and(eq(userGoal.id, goalId), eq(userGoal.userId, userId)));

  return result.rowCount !== null && result.rowCount > 0;
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
      bodyFatPercentage: statsData.bodyFatPercentage,
      muscleMass: statsData.muscleMass,
      date: statsData.date,
    })
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
    });
  }

  return newStats as UserStats;
}

export async function getUserStats(userId: string): Promise<UserStats[]> {
  const statsLogId = await getOrCreateUserStatsLog(userId);

  return await db
    .select()
    .from(userStats)
    .where(eq(userStats.statsLogId, statsLogId))
    .orderBy(desc(userStats.date));
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
    ...(stat as UserStats),
    tapeMeasurements: tape ? (tape as TapeMeasurement) : undefined,
  };
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
    ...(latest as UserStats),
    tapeMeasurements: tape ? (tape as TapeMeasurement) : undefined,
  };
}

export async function deleteUserStats(statsId: string, userId: string): Promise<boolean> {
  const statsLogId = await getOrCreateUserStatsLog(userId);

  // Delete will cascade to tape_measurement
  const result = await db
    .delete(userStats)
    .where(and(eq(userStats.id, statsId), eq(userStats.statsLogId, statsLogId)));

  return result.rowCount !== null && result.rowCount > 0;
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
      date: imageData.date,
      imageUrl: imageData.imageUrl,
      notes: imageData.notes,
    })
    .returning();

  return newImage as UserImage;
}

export async function getUserImages(userId: string): Promise<UserImage[]> {
  const imageLogId = await getOrCreateUserImageLog(userId);

  return await db
    .select()
    .from(userImage)
    .where(eq(userImage.imageLogId, imageLogId))
    .orderBy(desc(userImage.date));
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

  return (image as UserImage) || null;
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

  return result.rowCount !== null && result.rowCount > 0;
}

