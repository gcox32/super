'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Exercise } from '@/types/train';
import { FormInput } from '@/components/ui/Form';
import { Loader2 } from 'lucide-react';

interface ExerciseAutocompleteProps {
  initialExerciseId?: string;
  /** The exercise currently being edited/created, used to exclude from results when editing */
  currentExerciseId?: string;
  onChange: (exercise: Exercise | null) => void;
}

export function ExerciseAutocomplete({
  initialExerciseId,
  currentExerciseId,
  onChange,
}: ExerciseAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load initial parent (when editing)
  useEffect(() => {
    if (!initialExerciseId) return;

    let cancelled = false;

    async function fetchExercise() {
      try {
        const res = await fetch(`/api/train/exercises/${initialExerciseId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.exercise && !cancelled) {
          setSearchTerm(data.exercise.name);
          onChange(data.exercise);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch parent exercise', err);
        }
      }
    }

    fetchExercise();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExerciseId]); // Only depend on initialExerciseId, not onChange

  // Debounced search
  useEffect(() => {
    if (!searchTerm) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: searchTerm,
          page: '1',
          limit: '10',
        });
        const res = await fetch(`/api/train/exercises?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let results: Exercise[] = data.exercises || [];
        if (currentExerciseId) {
          results = results.filter((ex) => ex.id !== currentExerciseId);
        }
        setOptions(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search exercises', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, currentExerciseId]);

  const handleSelect = (exercise: Exercise | null) => {
    if (!exercise) {
      setSearchTerm('');
      setOptions([]);
      onChange(null);
      return;
    }

    setSearchTerm(exercise.name);
    setOptions([]);
    onChange(exercise);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOptions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <FormInput
        type="text"
        name="parentExerciseSearch"
        placeholder="Search exercises by name..."
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          if (!value) {
            handleSelect(null);
          }
        }}
        autoComplete="off"
      />
      {loading && (
        <div className="top-1/2 right-3 absolute text-muted-foreground text-xs -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {searchTerm && options.length > 0 && (
        <div className="z-10 absolute bg-card shadow-lg mt-1 border border-border rounded-md w-full max-h-56 overflow-auto">
          <button
            type="button"
            className="block hover:bg-muted px-3 py-2 w-full text-muted-foreground text-xs text-left"
            onClick={() => handleSelect(null)}
          >
            None (clear selection)
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="block hover:bg-muted px-3 py-2 w-full text-sm text-left"
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


