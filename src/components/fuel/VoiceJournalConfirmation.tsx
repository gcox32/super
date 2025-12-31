'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Edit2, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import VoiceJournalSuccess from './VoiceJournalSuccess';
import type { Meal, Food, MealInstance } from '@/types/fuel';
import type { ServingSizeMeasurement } from '@/types/measures';
import { SERVING_SIZE_UNITS } from '@/components/fuel/build/foods/options';
import { FoodAutocomplete } from '@/components/fuel/build/foods/FoodAutocomplete';
import Button from '@/components/ui/Button';
import { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/ui/Form';

interface ParsedFood {
  name: string;
  foodId: string;
  portion: ServingSizeMeasurement;
  servingSize?: ServingSizeMeasurement;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  micros?: Record<string, number>;
}

interface ConfirmationData {
  meal: Meal;
  foods: ParsedFood[];
  suggestedMealInstance: {
    mealId: string;
    date: string;
    timestamp: string | null;
    notes?: string;
    complete: boolean;
    calories?: number;
    macros?: {
      protein?: number;
      carbs?: number;
      fat?: number;
    };
    micros?: Record<string, number>;
  };
  metadata?: {
    foodsCreated: number;
    foodsMatched: number;
    mealMatched: boolean;
  };
}

interface VoiceJournalConfirmationProps {
  data: ConfirmationData;
  onCancel: () => void;
}

export default function VoiceJournalConfirmation({ data, onCancel }: VoiceJournalConfirmationProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successData, setSuccessData] = useState<{ mealInstance: MealInstance; meal: Meal } | null>(null);
  
  const [mealName, setMealName] = useState(data.meal.name);
  const [mealDescription, setMealDescription] = useState(data.meal.description || '');
  const [foods, setFoods] = useState<ParsedFood[]>(data.foods);
  const [date, setDate] = useState(() => {
    const d = new Date(data.suggestedMealInstance.date);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState(() => {
    if (data.suggestedMealInstance.timestamp) {
      const t = new Date(data.suggestedMealInstance.timestamp);
      return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    }
    return '';
  });
  const [notes, setNotes] = useState(data.suggestedMealInstance.notes || '');

  const handleTrustAndSave = async () => {
    await saveMealInstance();
  };

  const handleSave = async () => {
    setEditing(false);
    await saveMealInstance();
  };

  const saveMealInstance = async () => {
    setLoading(true);
    try {
      // Update meal if name or description changed
      if (mealName !== data.meal.name || mealDescription !== (data.meal.description || '')) {
        await fetch(`/api/fuel/meals/${data.meal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: mealName,
            description: mealDescription || undefined,
          }),
        });
      }

      // Parse date and timestamp
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      let timestamp: Date | null = null;
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        timestamp = new Date(year, month - 1, day, hours, minutes, 0, 0);
      }

      // Create meal instance with pre-calculated totals from the API
      // These values are already calculated from all foods in the transcribe endpoint
      const instanceData = {
        mealId: data.meal.id,
        date: dateObj.toISOString(),
        timestamp: timestamp?.toISOString() || null,
        complete: true,
        notes: notes || undefined,
        calories: data.suggestedMealInstance.calories,
        macros: data.suggestedMealInstance.macros,
        micros: data.suggestedMealInstance.micros,
      };

      const instanceRes = await fetch('/api/fuel/meals/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData),
      });

      if (!instanceRes.ok) {
        const errorData = await instanceRes.json();
        throw new Error(errorData.error || 'Failed to create meal instance');
      }

      const mealInstance = await instanceRes.json();

      // Create portioned food instances
      const foodErrors: string[] = [];
      for (const food of foods) {
        try {
          // Fetch food to verify it exists
          const foodRes = await fetch(`/api/fuel/foods/${food.foodId}`);
          if (!foodRes.ok) {
            foodErrors.push(food.name || 'Unknown food');
            continue;
          }

          // Create portioned food instance
          const pfiRes = await fetch(`/api/fuel/meals/instances/${mealInstance.id}/portioned-foods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              foodId: food.foodId,
              portion: food.portion,
              complete: true,
            }),
          });

          if (!pfiRes.ok) {
            foodErrors.push(food.name || 'Unknown food');
          }
        } catch (err) {
          foodErrors.push(food.name || 'Unknown food');
        }
      }

      if (foodErrors.length > 0 && foodErrors.length === foods.length) {
        throw new Error('Failed to save any foods. Please try again.');
      } else if (foodErrors.length > 0) {
        showToast({
          title: 'Partially saved',
          description: `Meal saved, but ${foodErrors.length} food${foodErrors.length > 1 ? 's' : ''} could not be added.`,
          variant: 'info',
        });
      }

      // Show success view
      setSuccessData({
        mealInstance: mealInstance as MealInstance,
        meal: data.meal,
      });
    } catch (err: any) {
      let errorTitle = 'Failed to save meal';
      let errorDescription = err.message || 'Please try again.';
      
      if (err.message.includes('network') || err.message.includes('fetch')) {
        errorTitle = 'Network Error';
        errorDescription = 'Could not connect to the server. Please check your connection and try again.';
      } else if (err.message.includes('Unauthorized')) {
        errorTitle = 'Authentication Error';
        errorDescription = 'Your session has expired. Please sign in again.';
      } else if (err.message.includes('validation') || err.message.includes('Invalid')) {
        errorTitle = 'Validation Error';
        errorDescription = 'Some of the meal data is invalid. Please check and try again.';
      }
      
      showToast({
        title: errorTitle,
        description: errorDescription,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const addFood = () => {
    setFoods([...foods, {
      name: '',
      foodId: '',
      portion: { value: 1, unit: 'count' },
    }]);
  };

  const removeFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const updateFood = (index: number, food: Food | null) => {
    const newFoods = [...foods];
    newFoods[index] = {
      ...newFoods[index],
      name: food?.name || '',
      foodId: food?.id || '',
      portion: food?.servingSize || newFoods[index].portion,
    };
    setFoods(newFoods);
  };

  const updatePortion = (index: number, field: 'value' | 'unit', value: string | number) => {
    const newFoods = [...foods];
    newFoods[index] = {
      ...newFoods[index],
      portion: {
        ...newFoods[index].portion,
        [field]: field === 'value' 
          ? (typeof value === 'number' ? value : parseFloat(value) || 0)
          : value,
      },
    };
    setFoods(newFoods);
  };

  // Show success view if meal was saved
  if (successData) {
    return <VoiceJournalSuccess mealInstance={successData.mealInstance} meal={successData.meal} onClose={onCancel} />;
  }

  return (
    <div className="z-50 fixed inset-0 flex flex-col bg-black">
      {/* Header */}
      <div className="safe-area-inset-top bg-zinc-900/80 backdrop-blur-sm border-zinc-800 border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="font-semibold text-white text-xl">
            {editing ? 'Edit Meal' : 'Confirm Meal'}
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-full w-10 h-10 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Cancel"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="space-y-6 mx-auto max-w-2xl">
          {/* Meal Info */}
          <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-white text-lg">Meal</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editing ? (
              <div className="space-y-4">
                <FormGroup>
                  <FormLabel className="text-zinc-300">Meal Name</FormLabel>
                  <FormInput
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel className="text-zinc-300">Description (optional)</FormLabel>
                  <FormTextarea
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={2}
                  />
                </FormGroup>
              </div>
            ) : (
              <div>
                <p className="text-white text-lg">{mealName}</p>
                {mealDescription && (
                  <p className="mt-1 text-zinc-400 text-sm">{mealDescription}</p>
                )}
              </div>
            )}
          </div>

          {/* Foods */}
          <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white text-lg">Foods</h3>
              {editing && (
                <Button
                  onClick={addFood}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                >
                  <Plus className="mr-1 w-4 h-4" />
                  Add Food
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {foods.map((food, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 border border-zinc-700 rounded-lg">
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <FormGroup>
                            <FormLabel className="text-zinc-300 text-xs">Food</FormLabel>
                            <FoodAutocomplete
                              initialFoodId={food.foodId || undefined}
                              onChange={(f) => updateFood(index, f)}
                            />
                          </FormGroup>
                        </div>
                        <button
                          onClick={() => removeFood(index)}
                          className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="gap-3 grid grid-cols-2">
                        <FormGroup>
                          <FormLabel className="text-zinc-300 text-xs">Portion Value</FormLabel>
                          <FormInput
                            type="number"
                            step="0.1"
                            min="0"
                            value={food.portion.value}
                            onChange={(e) => updatePortion(index, 'value', e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </FormGroup>
                        <FormGroup>
                          <FormLabel className="text-zinc-300 text-xs">Unit</FormLabel>
                          <FormSelect
                            value={food.portion.unit}
                            onChange={(e) => updatePortion(index, 'unit', e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          >
                            {SERVING_SIZE_UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </FormSelect>
                        </FormGroup>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{food.name}</p>
                        <p className="text-zinc-400 text-sm">
                          {food.portion.value} {food.portion.unit}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date/Time/Notes */}
          <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-2xl">
            <h3 className="mb-4 font-semibold text-white text-lg">Details</h3>
            <div className="gap-4 grid grid-cols-2 mb-4">
              <FormGroup className="max-w-[84%]">
                <FormLabel className="text-zinc-300">Date</FormLabel>
                <FormInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </FormGroup>
              <FormGroup className="max-w-[84%]">
                <FormLabel className="text-zinc-300">Time (optional)</FormLabel>
                <FormInput
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </FormGroup>
            </div>
            <FormGroup>
              <FormLabel className="text-zinc-300">Notes (optional)</FormLabel>
              <FormTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={2}
              />
            </FormGroup>
          </div>

          {/* Metadata */}
          {data.metadata && (
            <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-lg">
              <p className="text-zinc-400 text-xs">
                {data.metadata.foodsCreated > 0 && `${data.metadata.foodsCreated} new food${data.metadata.foodsCreated > 1 ? 's' : ''} created. `}
                {data.metadata.foodsMatched > 0 && `${data.metadata.foodsMatched} existing food${data.metadata.foodsMatched > 1 ? 's' : ''} matched. `}
                {data.metadata.mealMatched ? 'Existing meal matched.' : 'New meal created.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="safe-area-inset-bottom bg-zinc-900/80 backdrop-blur-sm border-zinc-800 border-t">
        <div className="flex justify-center items-center gap-4 mx-auto px-6 py-4 max-w-2xl">
          {editing ? (
            <>
              <Button
                onClick={() => setEditing(false)}
                variant="secondary"
                size="lg"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="lg"
                className="flex-1 min-h-[60px]"
                disabled={loading || !mealName.trim() || foods.length === 0 || foods.some(f => !f.foodId || !f.name)}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onCancel}
                variant="secondary"
                size="lg"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                disabled={loading}
              >
                <X className="w-5 h-5" />
                Cancel
              </Button>
              <Button
                onClick={handleTrustAndSave}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

