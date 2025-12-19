'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Workout } from '@/types/train';
import Button from '@/components/ui/Button';
import { Plus, Calendar, Clock } from 'lucide-react';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/train/workouts')
      .then(res => res.json())
      .then(data => setWorkouts(data.workouts))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between">
        
        <Link href="/train/build/workouts/new" className="w-full">
          <Button className="w-full">
            <Plus className="mr-2 w-4 h-4" />
            New Workout
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="border-brand-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : (
        <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map(workout => (
            <Link key={workout.id} href={`/train/build/workouts/${workout.id}/edit`} className="block">
              <div className="bg-card shadow-sm p-6 border border-gray-200 hover:border-brand-primary rounded-lg h-full transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-300 text-lg">{workout.name || 'Untitled Workout'}</h3>
                  <span className="inline-flex items-center bg-blue-100 px-2.5 py-0.5 rounded-full font-medium text-blue-800 text-xs capitalize">
                    {workout.workoutType}
                  </span>
                </div>
                <p className="mb-4 text-gray-500 text-sm line-clamp-2">
                  {workout.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 mt-auto text-gray-400 text-xs">
                  <div className="flex items-center">
                    <Clock className="mr-1 w-3 h-3" />
                    {workout.estimatedDuration} min
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 w-3 h-3" />
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {workouts.length === 0 && (
            <div className="bg-card shadow rounded-lg sm:rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">

                <li className="px-6 py-4 text-gray-500 text-center">
                  No workouts found.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

