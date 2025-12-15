'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Exercise } from '@/types/train';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function ExerciseList() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const url = searchTerm
          ? `/api/train/exercises?q=${encodeURIComponent(searchTerm)}`
          : '/api/train/exercises';

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setExercises(data.exercises);
        }
      } catch (err) {
        console.error('Failed to fetch exercises', err);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchExercises();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteClick = (e: React.MouseEvent, exercise: Exercise) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setExerciseToDelete(exercise);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!exerciseToDelete) return;

    try {
      const res = await fetch(`/api/train/exercises/${exerciseToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setExercises(prev => prev.filter(e => e.id !== exerciseToDelete.id));
      } else {
        console.error('Failed to delete exercise');
      }
    } catch (err) {
      console.error('Error deleting exercise', err);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Exercise"
        message={`Are you sure you want to delete "${exerciseToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary sm:text-sm"
          />
        </div>
        <Link href="/train/build/exercises/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Exercise
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <div className="shadow overflow-hidden sm:rounded-md rounded-lg bg-card">
          <ul className="divide-y divide-gray-200">
            {exercises.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                No exercises found.
              </li>
            ) : (
              exercises.map((exercise) => (
                <li key={exercise.id}>
                  <Link href={`/train/build/exercises/${exercise.id}/edit`} className="block hover:bg-gray-700">
                    <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                      <div className="truncate text-sm font-medium" style={{ color: 'color-mix(in srgb, var(--color-brand-primary) 70%, white)' }}>
                        {exercise.name}
                      </div>

                      <button
                        onClick={(e) => handleDeleteClick(e, exercise)}
                        className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

