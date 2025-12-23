'use client';

import { useState } from 'react';
import { WorkoutInstance, WorkoutBlockExerciseInstance, Exercise } from '@/types/train';
import { SimpleLineChart } from './SimpleLineChart';
import { format } from 'date-fns';

interface PerformanceDashboardProps {
  workoutStats: WorkoutInstance[];
  keyExerciseStats: {
    exercise: Exercise;
    instances: WorkoutBlockExerciseInstance[];
  }[];
}

type Tab = 'workouts' | 'exercises';

export default function PerformanceDashboard({ workoutStats, keyExerciseStats }: PerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('workouts');

  // Prepare data for Workout Stats
  const volumeData = workoutStats
    .filter(w => w.volume?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.volume!.value, // Assuming kg for simplicity, should check unit
      label: format(new Date(w.date), 'MMM d'),
    }));

  const workData = workoutStats
    .filter(w => w.work?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.work!.value,
      label: format(new Date(w.date), 'MMM d'),
    }));

  const powerData = workoutStats
    .filter(w => w.averagePower?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.averagePower!.value,
      label: format(new Date(w.date), 'MMM d'),
    }));

  return (
    <div className="space-y-6 pb-6">
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">

        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'workouts'
              ? 'border-brand-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Workout Stats
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'exercises'
              ? 'border-brand-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Key Exercises
        </button>
      </div>

      {activeTab === 'workouts' && (
        <div className="grid gap-6 md:grid-cols-1">
          <div className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700">
            <SimpleLineChart data={volumeData} title="Volume (kg)" unit="kg" color="#8b5cf6" />
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700">
            <SimpleLineChart data={workData} title="Total Work (J)" unit="J" color="#f59e0b" />
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700">
            <SimpleLineChart data={powerData} title="Average Power (W)" unit="W" color="#ef4444" />
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {keyExerciseStats.length === 0 ? (
            <div className="text-gray-500 col-span-full text-center py-10">
              No key exercises selected. Go to your profile to select key exercises to track.
            </div>
          ) : (
            keyExerciseStats.map(({ exercise, instances }) => {
              const data = instances
                .filter(i => i.projected1RM?.value)
                .map(i => ({
                  date: new Date(i.created_at),
                  value: i.projected1RM!.value.value,
                  label: format(new Date(i.created_at), 'MMM d'),
                }));

              return (
                <div key={exercise.id} className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700">
                  <SimpleLineChart
                    data={data}
                    title={`${exercise.name} - Projected 1RM`}
                    unit={instances[0].projected1RM!.value.unit}
                    color="#10b981"
                  />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

