ALTER TABLE "train"."exercise" DROP CONSTRAINT IF EXISTS "exercise_equipment_check";

ALTER TABLE "train"."exercise" ADD CONSTRAINT "exercise_equipment_check" 
CHECK (equipment IN ('barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable', 'other'));
