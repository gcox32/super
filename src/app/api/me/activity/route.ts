import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getQueryParam } from '@/lib/api/helpers';
import { 
  getUserWorkoutInstances, 
} from '@/lib/db/crud/train';
import { 
  getUserMealInstances, 
  getUserSleepInstances,
  getUserWaterIntakes,
  getUserSupplementInstances,
} from '@/lib/db/crud/fuel';
import {
  getUserStats,
  getUserImages,
} from '@/lib/db/crud/user';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const dateFromParam = getQueryParam(request.url, 'dateFrom');
    const dateToParam = getQueryParam(request.url, 'dateTo');

    const dateFrom = dateFromParam ? new Date(dateFromParam) : undefined;
    const dateTo = dateToParam ? new Date(dateToParam) : undefined;

    const options = { dateFrom, dateTo };

    // Run all queries in parallel
    const [
      workouts,
      meals,
      sleeps,
      waterIntakes,
      supplementInstances,
      stats,
      images
    ] = await Promise.all([
      getUserWorkoutInstances(userId, options),
      getUserMealInstances(userId, options),
      getUserSleepInstances(userId, options),
      getUserWaterIntakes(userId, options),
      getUserSupplementInstances(userId, options),
      getUserStats(userId), // Stats CRUD doesn't support date filtering yet, we'll filter in memory
      getUserImages(userId), // Images CRUD doesn't support date filtering yet, we'll filter in memory
    ]);

    // Normalize and combine
    const activities = [
      ...workouts.map(w => ({
        id: w.id,
        type: 'workout',
        date: new Date(w.date),
        title: 'Worked out', // We might want to fetch workout name if possible, or just use "Workout"
        details: w,
      })),
      ...meals.map(m => ({
        id: m.id,
        type: 'meal',
        date: new Date(m.date), // Meal instances use date (no time by default unless timestamp is set?)
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(m.date),
        title: 'Meal', 
        details: m,
      })),
      ...sleeps.map(s => ({
        id: s.id,
        type: 'sleep',
        date: new Date(s.date),
        title: 'Logged sleep',
        details: s,
      })),
      ...waterIntakes.map(w => ({
        id: w.id,
        type: 'water',
        date: new Date(w.date),
        title: 'Water Intake',
        details: w,
      })),
      ...supplementInstances.map(s => ({
        id: s.id,
        type: 'supplement',
        date: new Date(s.date),
        title: 'Supplement',
        details: s,
      })),
      ...stats.map(s => ({
        id: s.id,
        type: 'stats',
        date: new Date(s.date),
        title: 'Took measurements',
        details: s,
      })),
      ...images.map(i => ({
        id: i.id,
        type: 'image',
        date: new Date(i.date),
        title: 'Progress Photo',
        details: i,
      })),
    ];

    // Filter by date for those that didn't support it in query
    const filteredActivities = activities.filter(a => {
      if (dateFrom && a.date < dateFrom) return false;
      if (dateTo && a.date > dateTo) return false;
      return true;
    });

    // Sort by date descending
    filteredActivities.sort((a, b) => {
        // Use timestamp for meals if available for better precision, else date
        const dateA = a.type === 'meal' ? (a as any).timestamp : a.date;
        const dateB = b.type === 'meal' ? (b as any).timestamp : b.date;
        return dateB.getTime() - dateA.getTime();
    });

    return { activities: filteredActivities };
  });
}

