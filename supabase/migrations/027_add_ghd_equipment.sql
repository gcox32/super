ALTER TABLE "train"."exercise" DROP CONSTRAINT IF EXISTS "exercise_equipment_check";

ALTER TABLE "train"."exercise" ADD CONSTRAINT "exercise_equipment_check" 
CHECK (
  equipment <@ ARRAY[
    'barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable', 'cable', 
    'band', 'medicine ball', 'sled', 'sandbag', 'wheel', 'jump rope', 'pullup bar', 
    'rack', 'box', 'swiss ball', 'foam roller', 'bench', 'landmine', 'hip band', 
    'glute ham developer', 'other'
  ]::text[]
);

