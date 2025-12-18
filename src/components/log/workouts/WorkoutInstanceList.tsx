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
        const res = await fetch('/api/train/workouts/instances');
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

  if (loading) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div className="bg-card shadow sm:rounded-md overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {instances.length === 0 ? (
           <li className="px-6 py-4 text-gray-500 text-center">
             No workouts logged yet.
           </li>
        ) : (
          instances.map((instance) => (
            <li key={instance.id}>
              <Link href={`/log/workouts/${instance.id}`} className="block hover:bg-gray-700 transition duration-150 ease-in-out">
                <div className="flex justify-between items-center px-4 sm:px-6 py-4">
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                          <p className="font-medium text-brand-primary text-sm truncate">
                              {instance.workout?.name || 'Untitled Workout'}
                          </p>
                          <div className="flex ml-2 shrink-0">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                instance.complete 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                  {instance.complete ? 'Completed' : 'In Progress'}
                              </p>
                          </div>
                      </div>
                      <div className="flex justify-between mt-2">
                          <div className="sm:flex">
                              <p className="flex items-center text-gray-400 text-sm">
                                  {new Date(instance.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                  <span className="mx-2">•</span>
                                  {new Date(instance.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                          </div>
                           <div className="flex items-center text-gray-400 text-sm">
                              {instance.duration && (
                                <span className="ml-4">
                                  {instance.duration.value} {instance.duration.unit}
                                </span>
                              )}
                           </div>
                      </div>
                  </div>
                  <div className="ml-5 shrink-0">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
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
