import { ServingSizeMeasurement } from '@/types/measures';

export const SERVING_SIZE_UNITS: ServingSizeMeasurement['unit'][] = [
  'g',
  'ml',
  'oz',
  'lb',
  'kg',
  'count',
  'fl oz',
  'cup',
  'tbsp',
  'tsp',
];

export const defaultServingSize: ServingSizeMeasurement = {
  value: 100,
  unit: 'g',
};

