import {
  FormGroup, FormLabel,
  FormInput, FormTextarea, FormSelect
} from '@/components/ui/Form';
import { MealFormData, PortionedFoodFormData } from './types';
import { FoodAutocomplete } from '../foods/FoodAutocomplete';
import { Food } from '@/types/fuel';
import { SERVING_SIZE_UNITS } from '../foods/options';
import { Plus, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MealFormFieldsProps {
  formData: MealFormData;
  setFormData: React.Dispatch<React.SetStateAction<MealFormData>>;
  portionedFoods: PortionedFoodFormData[];
  setPortionedFoods: React.Dispatch<React.SetStateAction<PortionedFoodFormData[]>>;
}

export function MealFormFields({ 
  formData, 
  setFormData,
  portionedFoods,
  setPortionedFoods,
}: MealFormFieldsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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
        return {
          ...pf,
          foodId: food?.id || '',
          foodName: food?.name || '',
          // Reset portion to food's serving size if available
          portion: food?.servingSize || pf.portion,
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

  return (
    <>
      {/* Basic Info */}
      <div className="gap-4 grid grid-cols-1">
        <FormGroup>
          <FormLabel>Name</FormLabel>
          <FormInput
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Description</FormLabel>
          <FormTextarea
            name="description"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
          />
        </FormGroup>
      </div>

      {/* Foods */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
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
          <div className="bg-background/50 p-4 border border-border rounded-md text-center text-muted-foreground text-sm">
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
                          step="1"
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
    </>
  );
}

