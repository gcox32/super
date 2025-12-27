import { Food } from '@/types/fuel';

export type FoodFormData = Omit<Food, 'id' | 'createdAt' | 'updatedAt'>;

