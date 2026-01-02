'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, Utensils } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
} from '@/components/ui/Form';
import { FoodAutocomplete } from '@/components/fuel/build/foods/FoodAutocomplete';
import { MealAutocomplete } from '@/components/fuel/build/meals/MealAutocomplete';
import { TogglePill } from '@/components/ui/TogglePill';
import { SERVING_SIZE_UNITS } from '@/components/fuel/build/foods/options';
import type { Meal, MealInstance, MealPlanInstance, Food, Macros } from '@/types/fuel';
import type { ServingSizeMeasurement } from '@/types/measures';
import { calculateNutrients, aggregateNutrients } from '@/lib/fuel/calculations';
import { useToast } from '@/components/ui/Toast';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

interface PortionedFoodFormData {
  clientId: string;
  foodId: string;
  foodName?: string;
  portion: ServingSizeMeasurement;
}

type LogMode = 'meal' | 'foods';

export default function RecordTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<LogMode>('foods');
  
  // Meal selection
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  
  // Food logging
  const [portionedFoods, setPortionedFoods] = useState<PortionedFoodFormData[]>([]);
  
  // Meal instance fields
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [complete, setComplete] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Meal plan instance
  const [mealPlanInstances, setMealPlanInstances] = useState<MealPlanInstance[]>([]);
  const [selectedMealPlanInstanceId, setSelectedMealPlanInstanceId] = useState<string>('');

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Load meal plan instances
        const instancesRes = await fetchJson<MealPlanInstance[]>('/api/fuel/plans/instances');
        if (cancelled) return;
        setMealPlanInstances(instancesRes);
        
        // Auto-select most recent active instance
        if (instancesRes.length > 0) {
          const activeInstance = instancesRes.find(i => !i.complete && (!i.endDate || new Date(i.endDate) >= new Date())) 
            || instancesRes[0];
          setSelectedMealPlanInstanceId(activeInstance.id);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addFood = () => {
    const newPortion: PortionedFoodFormData = {
      clientId: `portion-${Date.now()}`,
      foodId: '',
      foodName: '',
      portion: {
        value: 1,
        unit: 'count',
      },
    };
    setPortionedFoods([...portionedFoods, newPortion]);
  };

  const removeFood = (clientId: string) => {
    setPortionedFoods(portionedFoods.filter(pf => pf.clientId !== clientId));
  };

  const updateFood = (clientId: string, food: Food | null) => {
    setPortionedFoods(portionedFoods.map(pf => {
      if (pf.clientId === clientId) {
        const shouldResetPortion = !pf.foodId && food?.servingSize;
        return {
          ...pf,
          foodId: food?.id || '',
          foodName: food?.name || '',
          portion: shouldResetPortion ? food.servingSize : pf.portion,
        };
      }
      return pf;
    }));
  };

  const updatePortion = (clientId: string, field: 'value' | 'unit', value: string | number) => {
    setPortionedFoods(portionedFoods.map(pf => {
      if (pf.clientId === clientId) {
        return {
          ...pf,
          portion: {
            ...pf.portion,
            [field]: field === 'value' 
              ? (typeof value === 'number' ? value : parseFloat(value) || 0)
              : value,
          },
        };
      }
      return pf;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mealId: string;
      let instanceCalories: number | undefined;
      let instanceMacros: Macros | undefined;

      if (mode === 'meal') {
        // Use selected meal
        if (!selectedMealId) {
          throw new Error('Please select a meal');
        }
        mealId = selectedMealId;
        
        // Fetch meal to get its calories and macros
        const meal = await fetchJson<Meal>(`/api/fuel/meals/${mealId}`);
        instanceCalories = meal.calories;
        instanceMacros = meal.macros;
      } else {
        // Create a meal from foods
        if (portionedFoods.length === 0 || portionedFoods.some(pf => !pf.foodId)) {
          throw new Error('Please add at least one food');
        }

        // Fetch food details and calculate nutrients
        const foodMap = new Map<string, Food>();
        const nutrientMap = new Map<string, { calories?: number; macros?: any; micros?: any }>();

        for (const pf of portionedFoods) {
          if (pf.foodId && !foodMap.has(pf.foodId)) {
            const food = await fetchJson<Food>(`/api/fuel/foods/${pf.foodId}`);
            foodMap.set(pf.foodId, food);
            
            const nutrients = calculateNutrients(food, pf.portion);
            nutrientMap.set(pf.foodId, nutrients);
          }
        }

        // Aggregate nutrients for the meal
        const allNutrients = Array.from(nutrientMap.values());
        const mealNutrients = aggregateNutrients(allNutrients);
        
        // Store calories and macros for the instance
        instanceCalories = mealNutrients.calories;
        instanceMacros = mealNutrients.macros;

        // Create meal - name it after the first food
        const firstFood = foodMap.get(portionedFoods[0].foodId);
        const mealName = `Quick Log - ${firstFood?.name}` || 'Quick Log';
        
        const mealData = {
          name: mealName,
          description: 'Quick logged meal',
          calories: mealNutrients.calories,
          macros: mealNutrients.macros,
        };

        const mealRes = await fetch('/api/fuel/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mealData),
        });

        if (!mealRes.ok) {
          const data = await mealRes.json();
          throw new Error(data.error || 'Failed to create meal');
        }

        const newMeal = await mealRes.json();
        mealId = newMeal.id;

        // Add portioned foods to the meal
        for (const pf of portionedFoods) {
          if (pf.foodId) {
            const nutrients = nutrientMap.get(pf.foodId);
            await fetch(`/api/fuel/meals/${mealId}/portions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                foodId: pf.foodId,
                portion: pf.portion,
                calories: nutrients?.calories,
                macros: nutrients?.macros,
              }),
            });
          }
        }
      }

      // Parse date and timestamp in local timezone
      // Parse date string (YYYY-MM-DD) and create Date in local timezone at midnight
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      // Create timestamp if time is provided (date + time in local timezone)
      let timestamp: Date | null = null;
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        timestamp = new Date(year, month - 1, day, hours, minutes, 0, 0);
      }

      // Create meal instance with calories and macros
      // Convert dates to ISO strings to avoid timezone issues when JSON.stringify converts Date objects
      // This matches the approach used in VoiceJournalConfirmation
      // Note: API accepts date/timestamp as strings (ISO format) or Date objects
      const instanceData = {
        mealPlanInstanceId: selectedMealPlanInstanceId || undefined,
        mealId,
        date: dateObj.toISOString(),
        timestamp: timestamp?.toISOString() || null,
        complete,
        calories: instanceCalories,
        macros: instanceMacros,
        notes: notes || undefined,
      };

      const instanceRes = await fetch('/api/fuel/meals/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData),
      });

      if (!instanceRes.ok) {
        const data = await instanceRes.json();
        throw new Error(data.error || 'Failed to create meal instance');
      }

      // If logging foods directly, also create portioned food instances
      if (mode === 'foods' && portionedFoods.length > 0) {
        const mealInstance = await instanceRes.json();
        
        // Fetch food details for nutrient calculation
        const foodMap = new Map<string, Food>();
        for (const pf of portionedFoods) {
          if (pf.foodId && !foodMap.has(pf.foodId)) {
            const food = await fetchJson<Food>(`/api/fuel/foods/${pf.foodId}`);
            foodMap.set(pf.foodId, food);
          }
        }

        // Create portioned food instances
        for (const pf of portionedFoods) {
          if (pf.foodId) {
            const food = foodMap.get(pf.foodId);
            if (food) {
              const nutrients = calculateNutrients(food, pf.portion);
              
              await fetch(`/api/fuel/meals/instances/${mealInstance.id}/portioned-foods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  foodId: pf.foodId,
                  portion: pf.portion,
                  calories: nutrients.calories,
                  macros: nutrients.macros,
                  micros: nutrients.micros,
                  complete: true,
                }),
              });
            }
          }
        }
      }

      // Reset form
      setSelectedMealId('');
      setPortionedFoods([]);
      setNotes('');
      setTime(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      });

      // Refresh and show success
      router.refresh();
      showToast({
        title: 'Meal logged successfully!',
        description: 'Your meal has been logged successfully.',
        variant: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to log meal');
      showToast({
        title: 'Failed to log meal',
        description: err.message || 'Failed to log meal',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Selection */}
        <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
          <FormGroup>
            <FormLabel>Log as</FormLabel>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('foods');
                  setSelectedMealId('');
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'foods'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    : 'bg-background text-foreground border border-border hover:bg-muted'
                }`}
              >
                Food
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('meal');
                  setPortionedFoods([]);
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'meal'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    : 'bg-background text-foreground border border-border hover:bg-muted'
                }`}
              >
                Meal
              </button>
            </div>
          </FormGroup>
        </div>

        {/* Meal Selection */}
        {mode === 'meal' && (
          <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
            <FormGroup>
              <FormLabel>Select Meal</FormLabel>
              <MealAutocomplete
                initialMealId={selectedMealId || undefined}
                onChange={(meal) => setSelectedMealId(meal?.id || '')}
              />
            </FormGroup>
          </div>
        )}

        {/* Food Logging */}
        {mode === 'foods' && (
          <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground text-sm">Foods</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFood}
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Food
              </Button>
            </div>

            {portionedFoods.length === 0 ? (
              <div className="bg-background/50 p-4 border border-border rounded-md text-muted-foreground text-sm text-center">
                No foods added yet. Click "Add Food" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {portionedFoods.map((portionedFood) => (
                  <div
                    key={portionedFood.clientId}
                    className="bg-background/50 p-4 border border-border rounded-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-foreground text-sm">
                        {portionedFood.foodName || 'Select a food'}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFood(portionedFood.clientId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <FormGroup>
                        <FormLabel className="text-xs">Food</FormLabel>
                        <FoodAutocomplete
                          initialFoodId={portionedFood.foodId}
                          onChange={(food) => updateFood(portionedFood.clientId, food)}
                        />
                      </FormGroup>

                      {portionedFood.foodId && (
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                          <FormGroup>
                            <FormLabel className="text-xs">Portion Value</FormLabel>
                            <FormInput
                              type="number"
                              step=".1"
                              min="0"
                              value={portionedFood.portion.value || ''}
                              onChange={(e) => updatePortion(portionedFood.clientId, 'value', e.target.value)}
                            />
                          </FormGroup>

                          <FormGroup>
                            <FormLabel className="text-xs">Portion Unit</FormLabel>
                            <FormSelect
                              value={portionedFood.portion.unit}
                              onChange={(e) => updatePortion(portionedFood.clientId, 'unit', e.target.value)}
                            >
                              {SERVING_SIZE_UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </FormSelect>
                          </FormGroup>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date and Time */}
        <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <FormGroup className="max-w-[92%]">
              <FormLabel>Date</FormLabel>
              <FormInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup className="max-w-[92%]">
              <FormLabel>Time (optional)</FormLabel>
              <FormInput
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </FormGroup>
          </div>
        </div>

        {/* Meal Plan Instance (Optional) */}
        {mealPlanInstances.length > 0 && (
          <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
            <FormGroup>
              <FormLabel>Meal Plan Instance (Optional)</FormLabel>
              <FormSelect
                value={selectedMealPlanInstanceId}
                onChange={(e) => setSelectedMealPlanInstanceId(e.target.value)}
              >
                <option value="">None - Log as standalone meal</option>
                {mealPlanInstances.map(instance => (
                  <option key={instance.id} value={instance.id}>
                    {instance.id.substring(0, 8)}... (Started: {new Date(instance.startDate).toLocaleDateString()})
                  </option>
                ))}
              </FormSelect>
              <p className="mt-1 text-muted-foreground text-xs">
                Link this meal to a meal plan instance, or leave as standalone
              </p>
            </FormGroup>
          </div>
        )}

        {/* Additional Options */}
        <div className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient">
          <div className="space-y-4">
            <FormGroup>
              <FormLabel>Status</FormLabel>
              <TogglePill
                leftLabel="Scheduled"
                rightLabel="Complete"
                value={!complete}
                onChange={(active) => setComplete(!active)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Notes (optional)</FormLabel>
              <FormTextarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this meal..."
              />
            </FormGroup>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Utensils className="mr-2 w-4 h-4" />
                Log Meal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

