'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Meal } from '@/types/fuel';
import Button from '@/components/ui/Button';
import { Plus, Calendar } from 'lucide-react';

export default function MealList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fuel/meals')
      .then(res => res.json())
      .then(data => setMeals(data.meals || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between">
        <Link href="/fuel/build/meals/new" className="w-full">
          <Button className="w-full">
            <Plus className="mr-2 w-4 h-4" />
            New Meal
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="border-brand-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : (
        <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {meals.map(meal => (
            <Link key={meal.id} href={`/fuel/build/meals/${meal.id}/edit`} className="block">
              <div className="bg-card shadow-sm p-6 border border-gray-200 hover:border-brand-primary rounded-lg h-full transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-300 text-lg">{meal.name || 'Untitled Meal'}</h3>
                </div>
                <p className="mb-4 text-gray-500 text-sm line-clamp-2">
                  {meal.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 mt-auto text-gray-400 text-xs">
                  {meal.calories && (
                    <div className="flex items-center">
                      <span>{Math.round(meal.calories)} cal</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="mr-1 w-3 h-3" />
                    {new Date(meal.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {meals.length === 0 && (
            <div className="bg-card shadow rounded-lg sm:rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                <li className="px-6 py-4 text-gray-500 text-center">
                  No meals found.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

