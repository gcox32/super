'use client';

import { useEffect, useState, useRef } from 'react';
import { Food } from '@/types/fuel';
import { FormInput } from '@/components/ui/Form';
import { Loader2, Plus } from 'lucide-react';

interface FoodAutocompleteProps {
  initialFoodId?: string;
  /** The food currently being edited/created, used to exclude from results when editing */
  currentFoodId?: string;
  onChange: (food: Food | null) => void;
  onCreate?: (searchTerm: string) => void;
}

export function FoodAutocomplete({
  initialFoodId,
  currentFoodId,
  onChange,
  onCreate,
}: FoodAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load initial food (when editing)
  useEffect(() => {
    if (!initialFoodId) return;

    let cancelled = false;

    async function fetchFood() {
      try {
        const res = await fetch(`/api/fuel/foods/${initialFoodId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data && !cancelled) {
          setSearchTerm(data.name);
          onChange(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch food', err);
        }
      }
    }

    fetchFood();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFoodId]); // Only depend on initialFoodId, not onChange

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
        const res = await fetch(`/api/fuel/foods?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let results: Food[] = data.foods || [];
        if (currentFoodId) {
          results = results.filter((food) => food.id !== currentFoodId);
        }
        setOptions(results);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search foods', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, currentFoodId]);

  const clearSelection = () => {
    setSearchTerm('');
    setOptions([]);
    setIsOpen(false);
    onChange(null);
  };

  const handleSelect = (food: Food | null) => {
    if (!food) {
      clearSelection();
      return;
    }

    setSearchTerm(food.name);
    setOptions([]);
    setIsOpen(false);
    onChange(food);
  };

  function handleClickOutside(event: MouseEvent) {
    if (!containerRef.current) return;
    if (!containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasExactMatch = options.some(opt => opt.name.toLowerCase() === searchTerm.trim().toLowerCase());
  const showDropdown = isOpen && ((searchTerm && options.length > 0) || (onCreate && searchTerm && !loading && !hasExactMatch));

  return (
    <div ref={containerRef} className="relative">
      <FormInput
        type="text"
        name="foodSearch"
        placeholder="Search foods by name..."
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          if (!value) {
            handleSelect(null);
          } else {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
            if (searchTerm) setIsOpen(true);
        }}
        autoComplete="off"
      />
      {loading && (
        <div className="top-1/2 right-3 absolute text-muted-foreground text-xs -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {showDropdown ? (
        <div className="z-10 absolute bg-card shadow-lg mt-1 border border-border rounded-md w-full max-h-56 overflow-auto">
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
          
          {onCreate && !hasExactMatch && (
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-brand-primary/10 px-3 py-2 border-border border-t w-full font-medium text-brand-primary text-sm text-left"
              onClick={() => {
                setIsOpen(false);
                setOptions([]); 
                onCreate(searchTerm);
              }}
            >
              <Plus className="w-3 h-3" />
              Create "{searchTerm}"
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

