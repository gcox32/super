'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Exercise } from '@/types/train';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Plus, Search, Edit2 } from 'lucide-react';

export default function ExerciseList() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true);
        const url = searchTerm
          ? `/api/train/exercises?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${limit}`
          : `/api/train/exercises?page=${currentPage}&limit=${limit}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setExercises(data.exercises);
          setTotalCount(data.total);
          setTotalPages(Math.ceil(data.total / limit));
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
  }, [searchTerm, currentPage]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block py-2 pr-3 pl-10 border border-gray-300 focus:border-brand-primary rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary w-full sm:text-sm leading-5 placeholder-gray-500 focus:placeholder-gray-400"
          />
        </div>
        <Link href="/train/build/exercises/new" className="mt-2 w-full">
          <Button className="w-full">
            <Plus className="mr-2 w-4 h-4" />
            New Exercise
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="border-brand-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : (
        <div className="bg-card shadow rounded-lg sm:rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {exercises.length === 0 ? (
              <li className="px-6 py-4 text-gray-500 text-center">
                No exercises found.
              </li>
            ) : (
              exercises.map((exercise) => (
                <li key={exercise.id}>
                  <Link href={`/train/build/exercises/${exercise.id}/edit`} className="block hover:bg-gray-700">
                    <div className="flex justify-between items-center px-4 sm:px-6 py-4">
                      <div className="font-medium text-sm truncate" style={{ color: 'color-mix(in srgb, var(--color-brand-primary) 70%, white)' }}>
                        {exercise.name}
                      </div>
                      <Edit2 className="w-4 h-4" />
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-gray-200 border-t">
              <div className="sm:hidden flex flex-1 justify-between">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="ghost"
                  className="inline-flex relative items-center px-4 py-2 font-medium text-sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  className="inline-flex relative items-center ml-3 px-4 py-2 font-medium text-sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:justify-between sm:items-center">
                <div>
                  <p className="text-gray-500 text-sm">
                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="inline-flex z-0 relative -space-x-px shadow-sm rounded-md" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="ghost"
                      className="inline-flex relative items-center bg-card hover:bg-gray-50 disabled:hover:bg-card px-2 py-2 border border-gray-300 rounded-r-md w-[80px] font-medium text-gray-500 text-sm"
                    >
                      PREV
                    </Button>
                    {/* Simple page indicator for now */}
                    <span className="inline-flex relative items-center bg-card px-4 py-2 border border-gray-300 font-medium text-gray-700 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="ghost"
                      className="inline-flex relative items-center bg-card hover:bg-gray-50 px-2 py-2 border border-gray-300 rounded-l-md w-[80px] font-medium text-gray-500 text-sm"
                    >
                      NEXT
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

