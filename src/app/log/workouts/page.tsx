'use client';

import React from 'react';
import WorkoutInstanceList from '@/components/log/workouts/WorkoutInstanceList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function LogWorkoutsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <BackToLink href="/log" pageName="Log" />
      <div className="md:flex md:justify-between md:items-center mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-300 text-2xl sm:text-3xl sm:truncate leading-7 sm:tracking-tight">
            Workout History
          </h2>
        </div>
      </div>
      <WorkoutInstanceList />
    </div>
  );
}
