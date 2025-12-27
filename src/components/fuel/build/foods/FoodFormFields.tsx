import { useState } from 'react';
import {
  FormGroup, FormLabel,
  FormInput, FormTextarea, FormSelect
} from '@/components/ui/Form';
import { Food } from '@/types/fuel';
import { Macros, Micros } from '@/types/fuel';
import { SERVING_SIZE_UNITS } from './options';
import { FoodFormData } from './types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FoodFormFieldsProps {
  formData: FoodFormData;
  setFormData: React.Dispatch<React.SetStateAction<FoodFormData>>;
  isEditing?: boolean;
  initialData?: Food;
}

export function FoodFormFields({ 
  formData, 
  setFormData, 
  isEditing = false,
  initialData 
}: FoodFormFieldsProps) {
  const [vitaminsExpanded, setVitaminsExpanded] = useState(false);
  const [mineralsExpanded, setMineralsExpanded] = useState(false);
  const [otherNutrientsExpanded, setOtherNutrientsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServingSizeChange = (field: 'value' | 'unit', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      servingSize: {
        ...prev.servingSize,
        [field]: field === 'value' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : value,
      },
    }));
  };

  const handleMacroChange = (field: keyof Macros, value: string) => {
    setFormData(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [field]: value === '' ? undefined : parseFloat(value) || undefined,
      },
    }));
  };

  const handleMicroChange = (field: keyof Micros, value: string) => {
    setFormData(prev => ({
      ...prev,
      micros: {
        ...prev.micros,
        [field]: value === '' ? undefined : parseFloat(value) || undefined,
      },
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

      {/* Serving Size */}
      <div className="mt-4 flex gap-2">
        <FormGroup className="flex-1">
          <FormLabel>Serving Size Value</FormLabel>
          <FormInput
            type="number"
            step="1"
            min="0"
            value={formData.servingSize.value || ''}
            onChange={(e) => handleServingSizeChange('value', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup className="flex-1">
          <FormLabel>Serving Size Unit</FormLabel>
          <FormSelect
            value={formData.servingSize.unit}
            onChange={(e) => handleServingSizeChange('unit', e.target.value)}
            required
          >
            {SERVING_SIZE_UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </FormSelect>
        </FormGroup>
      </div>

      {/* Calories */}
      <div className="gap-4 grid grid-cols-1 mt-4">
        <FormGroup>
          <FormLabel>Calories (per serving)</FormLabel>
          <FormInput
            type="number"
            step="1"
            min="0"
            name="calories"
            value={formData.calories || ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
              setFormData(prev => ({ ...prev, calories: val || undefined }));
            }}
          />
        </FormGroup>
      </div>

      {/* Macros */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <h3 className="font-semibold text-foreground text-sm">Macronutrients (per serving)</h3>
        
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <FormGroup>
            <FormLabel className="text-xs">Protein (g)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.macros?.protein || ''}
              onChange={(e) => handleMacroChange('protein', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Carbs (g)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.macros?.carbs || ''}
              onChange={(e) => handleMacroChange('carbs', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Fat (g)</FormLabel>
            <FormInput
              type="number"
              step="1"
              min="0"
              value={formData.macros?.fat || ''}
              onChange={(e) => handleMacroChange('fat', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>
        </div>
      </div>

      {/* Micros - Vitamins */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <button
          type="button"
          onClick={() => setVitaminsExpanded(!vitaminsExpanded)}
          className="flex justify-between items-center w-full"
        >
          <h3 className="font-semibold text-foreground text-sm">Vitamins (per serving)</h3>
          {vitaminsExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {vitaminsExpanded && (
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <FormGroup>
            <FormLabel className="text-xs">Vitamin A (IU)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminA || ''}
              onChange={(e) => handleMicroChange('vitaminA', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin C (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminC || ''}
              onChange={(e) => handleMicroChange('vitaminC', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin D (IU)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminD || ''}
              onChange={(e) => handleMicroChange('vitaminD', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin E (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminE || ''}
              onChange={(e) => handleMicroChange('vitaminE', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin K (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminK || ''}
              onChange={(e) => handleMicroChange('vitaminK', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B1 - Thiamin (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB1 || ''}
              onChange={(e) => handleMicroChange('vitaminB1', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B2 - Riboflavin (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB2 || ''}
              onChange={(e) => handleMicroChange('vitaminB2', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B3 - Niacin (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB3 || ''}
              onChange={(e) => handleMicroChange('vitaminB3', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B5 - Pantothenic Acid (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB5 || ''}
              onChange={(e) => handleMicroChange('vitaminB5', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B6 - Pyridoxine (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB6 || ''}
              onChange={(e) => handleMicroChange('vitaminB6', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B7 - Biotin (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB7 || ''}
              onChange={(e) => handleMicroChange('vitaminB7', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B9 - Folate (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB9 || ''}
              onChange={(e) => handleMicroChange('vitaminB9', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Vitamin B12 - Cobalamin (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.vitaminB12 || ''}
              onChange={(e) => handleMicroChange('vitaminB12', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>
          </div>
        )}
      </div>

      {/* Micros - Minerals */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <button
          type="button"
          onClick={() => setMineralsExpanded(!mineralsExpanded)}
          className="flex justify-between items-center w-full"
        >
          <h3 className="font-semibold text-foreground text-sm">Minerals (per serving)</h3>
          {mineralsExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {mineralsExpanded && (
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <FormGroup>
            <FormLabel className="text-xs">Calcium (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.calcium || ''}
              onChange={(e) => handleMicroChange('calcium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Iron (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.iron || ''}
              onChange={(e) => handleMicroChange('iron', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Magnesium (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.magnesium || ''}
              onChange={(e) => handleMicroChange('magnesium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Phosphorus (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.phosphorus || ''}
              onChange={(e) => handleMicroChange('phosphorus', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Potassium (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.potassium || ''}
              onChange={(e) => handleMicroChange('potassium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Sodium (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.sodium || ''}
              onChange={(e) => handleMicroChange('sodium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Zinc (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.zinc || ''}
              onChange={(e) => handleMicroChange('zinc', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Copper (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.copper || ''}
              onChange={(e) => handleMicroChange('copper', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Manganese (mg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.manganese || ''}
              onChange={(e) => handleMicroChange('manganese', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Selenium (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.selenium || ''}
              onChange={(e) => handleMicroChange('selenium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Chromium (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.chromium || ''}
              onChange={(e) => handleMicroChange('chromium', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Molybdenum (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.molybdenum || ''}
              onChange={(e) => handleMicroChange('molybdenum', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Iodine (μg)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.iodine || ''}
              onChange={(e) => handleMicroChange('iodine', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>
          </div>
        )}
      </div>

      {/* Micros - Other */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <button
          type="button"
          onClick={() => setOtherNutrientsExpanded(!otherNutrientsExpanded)}
          className="flex justify-between items-center w-full"
        >
          <h3 className="font-semibold text-foreground text-sm">Other Nutrients (per serving)</h3>
          {otherNutrientsExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {otherNutrientsExpanded && (
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <FormGroup>
            <FormLabel className="text-xs">Fiber (g)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.fiber || ''}
              onChange={(e) => handleMicroChange('fiber', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel className="text-xs">Sugar (g)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min="0"
              value={formData.micros?.sugar || ''}
              onChange={(e) => handleMicroChange('sugar', e.target.value)}
              className="px-2 py-1"
            />
          </FormGroup>
          </div>
        )}
      </div>

      {/* Media */}
      <div className="gap-4 grid grid-cols-1 mt-4">
        <FormGroup>
          <FormLabel>Image URL</FormLabel>
          <FormInput
            type="url"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
          />
        </FormGroup>
      </div>
    </>
  );
}

