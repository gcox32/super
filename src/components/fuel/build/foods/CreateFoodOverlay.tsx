'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FoodFormData } from './types';
import { defaultServingSize } from './options';
import { FoodFormFields } from './FoodFormFields';
import { Food } from '@/types/fuel';

interface CreateFoodOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newFood: Food) => void;
  initialName?: string;
}

export function CreateFoodOverlay({ isOpen, onClose, onSuccess, initialName }: CreateFoodOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [formData, setFormData] = useState<FoodFormData>({
    name: '',
    description: '',
    servingSize: defaultServingSize,
    calories: undefined,
    macros: undefined,
    micros: undefined,
    imageUrl: '',
  });

  // Initialize defaults when opening
  useEffect(() => {
    if (isOpen) {
        // Reset form when opening, but use initialName if provided
        setFormData({
            name: initialName || '',
            description: '',
            servingSize: defaultServingSize,
            calories: undefined,
            macros: undefined,
            micros: undefined,
            imageUrl: '',
        });
        setError(null);
    }
  }, [isOpen, initialName]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling to parent forms
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fuel/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create food');
      }

      const newFood = await res.json();
      onSuccess(newFood);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="flex flex-col bg-card/95 shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-border border-b">
          <h2 className="font-bold text-xl">Create New Food</h2>
          <button
            onClick={onClose}
            className="hover:bg-hover p-1 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            {error && (
            <div className="bg-red-500/10 mb-4 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
                {error}
            </div>
            )}

            <form id="create-food-form" onSubmit={handleSubmit}>
                <FoodFormFields
                    formData={formData}
                    setFormData={setFormData}
                />
            </form>
        </div>

        <div className="flex justify-end gap-3 bg-card/95 backdrop-blur p-4 border-border border-t rounded-b-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-food-form"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Food'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

