export type PortionMeasurement    = { value: number; unit: 'g' | 'ml' | 'oz' | 'lb' | 'kg' | 'lbs' | 'count' | 'other' }; // e.g. "100 grams"
export type LiquidMeasurement     = { value: number; unit: 'ml' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'fl oz' | 'other' };
export type DosageMeasurement     = { value: number; unit: 'mg' | 'g' | 'ml' | 'oz' | 'tbsp' | 'tsp' | 'other' }; // e.g. "100 milligrams"

export type DistanceMeasurement   = { value: number; unit: 'cm' | 'm' | 'in' | 'ft' | 'm' | 'ft' | 'yd' | 'mi' | 'km'};
export type TimeMeasurement       = { value: number; unit: 's' | 'min' | 'hr' };
export type WeightMeasurement     = { value: number; unit: 'kg' | 'lbs' };
export type PaceMeasurement       = { value: number; unit: 'mph' | 'kph' | 'min/km' | 'min/mile' };
export type LongTimeMeasurement   = { value: number; unit: 'days' | 'weeks' | 'months' | 'years' };
export type CaloriesMeasurement   = { value: number; unit: 'cal' | 'kcal' };

export type HeightMeasurement      = { value: number; unit: 'cm' | 'm' | 'in' | 'ft' };
export type PercentageMeasurement  = { value: number; unit: '%' };
export type RepetitionsMeasurement = { value: number; unit: 'reps' };

export type WorkMeasurement         = { value: number; unit: 'J' | 'kJ' | 'ftlb' | 'cal' | 'kcal' };
export type PowerMeasurement        = { value: number; unit: 'W' | 'kW' | 'hp' };
export type ProjectedMaxMeasurement = { value: WeightMeasurement; confidence: number };

export type ServingSizeMeasurement  = { value: number; unit: 'g' | 'ml' | 'oz' | 'lb' | 'kg' | 'count' | 'fl oz' | 'cup' | 'tbsp' | 'tsp' };