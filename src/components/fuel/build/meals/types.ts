import { Meal, PortionedFood } from '@/types/fuel';
import { ServingSizeMeasurement } from '@/types/measures';

export type MealFormData = Omit<Meal, 'id' | 'userId' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes' | 'calories' | 'macros' | 'micros'>;

export interface PortionedFoodFormData {
  clientId: string;
  foodId: string;
  foodName?: string; // For display
  portion: ServingSizeMeasurement;
}

