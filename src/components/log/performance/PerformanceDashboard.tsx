'use client';

import { WorkoutInstance, WorkoutBlockExerciseInstance, Exercise } from '@/types/train';
import { SimpleLineChart } from './SimpleLineChart';
import { format } from 'date-fns';
import { usePreferences } from '@/lib/preferences';
import TabLayout, { Tab } from '@/components/ui/TabLayout';

interface PerformanceDashboardProps {
  workoutStats: WorkoutInstance[];
  keyExerciseStats: {
    exercise: Exercise;
    instances: WorkoutBlockExerciseInstance[];
  }[];
}

export default function PerformanceDashboard({ workoutStats, keyExerciseStats }: PerformanceDashboardProps) {
  const { preferences } = usePreferences();
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

  const tabs: Tab[] = [
    {
      id: 'workouts',
      label: 'Workout Stats',
      content: (
        <div className="grid gap-6 md:grid-cols-1">
          <div className="bg-zinc-800 p-4 rounded-(--radius) shadow border border-zinc-700">
            <SimpleLineChart data={volumeData} title="Volume (kg)" unit="kg" color="#8b5cf6" />
          </div>
          <div className="bg-zinc-800 p-4 rounded-(--radius) shadow border border-zinc-700">
            <SimpleLineChart data={workData} title="Total Work (J)" unit="J" color="#f59e0b" />
          </div>
          <div className="bg-zinc-800 p-4 rounded-(--radius) shadow border border-zinc-700">
            <SimpleLineChart data={powerData} title="Average Power (W)" unit="W" color="#ef4444" />
          </div>
        </div>
      ),
    },
    {
      id: 'exercises',
      label: 'Key Exercises',
      content: (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {keyExerciseStats.length === 0 ? (
            <div className="text-gray-500 col-span-full text-center py-10">
              No key exercises selected. Go to your profile to select key exercises to track.
            </div>
          ) : (
            keyExerciseStats.map(({ exercise, instances }) => {
              // Group by date and find max projected1RM per date
              const maxByDate = instances.reduce((acc, curr) => {
                if (!curr.projected1RM?.value) return acc;
                
                const dateKey = format(new Date(curr.created_at), 'yyyy-MM-dd');
                const existing = acc.get(dateKey);
                
                if (!existing || curr.projected1RM.value.value > existing.projected1RM!.value.value) {
                  acc.set(dateKey, curr);
                }
                return acc;
              }, new Map<string, WorkoutBlockExerciseInstance>());

              const data = Array.from(maxByDate.values())
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map(i => ({
                  date: new Date(i.created_at),
                  value: i.projected1RM!.value.value,
                  label: format(new Date(i.created_at), 'MMM d'),
                }));

              return (
                <div key={exercise.id} className="bg-zinc-800 p-4 rounded-(--radius) shadow border border-zinc-700">
                  <SimpleLineChart
                    data={data}
                    title={`${exercise.name} - Projected 1RM`}
                    unit={instances[0].projected1RM?.value.unit  || preferences.preferredWeightUnit}
                    color="#10b981"
                  />
                </div>
              );
            })
          )}
        </div>
      ),
    },
  ];

  return <TabLayout tabs={tabs} defaultTab="workouts" />;
}

