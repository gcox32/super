'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkoutInstance } from '@/types/train';
import { ChevronRight } from 'lucide-react';

export default function WorkoutInstanceList() {
  const [instances, setInstances] = useState<WorkoutInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstances() {
      try {
        const res = await fetch('/api/train/workout-instances');
        if (res.ok) {
          const data = await res.json();
          // Sort by date desc
          const sorted = (data.workoutInstances as WorkoutInstance[]).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setInstances(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstances();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="bg-card shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {instances.length === 0 ? (
           <li className="px-6 py-4 text-center text-gray-500">
             No workouts logged yet.
           </li>
        ) : (
          instances.map((instance) => (
            <li key={instance.id}>
              <Link href={`/log/workouts/${instance.id}`} className="block hover:bg-gray-700 transition duration-150 ease-in-out">
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-brand-primary truncate">
                              {instance.workout?.name || 'Untitled Workout'}
                          </p>
                          <div className="ml-2 shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                instance.complete 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                  {instance.complete ? 'Completed' : 'In Progress'}
                              </p>
                          </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                          <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-400">
                                  {new Date(instance.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                  <span className="mx-2">•</span>
                                  {new Date(instance.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                          </div>
                           <div className="flex items-center text-sm text-gray-400">
                              {instance.duration && (
                                <span className="ml-4">
                                  {instance.duration.value} {instance.duration.unit}
                                </span>
                              )}
                           </div>
                      </div>
                  </div>
                  <div className="ml-5 shrink-0">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
