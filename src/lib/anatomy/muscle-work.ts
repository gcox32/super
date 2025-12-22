import { WorkoutInstance, WorkoutBlockExerciseInstance } from "@/types/train";
import { MuscleGroupName } from "@/types/anatomy";

export type MuscleWorkMap = Record<MuscleGroupName, number>;

export function calculateMuscleWorkDistribution(
    instance: WorkoutInstance,
    activeExerciseInstances?: WorkoutBlockExerciseInstance[],
    muscleGroupMap?: Record<string, MuscleGroupName>
): MuscleWorkMap {
    const muscleWork: Partial<MuscleWorkMap> = {};

    let allExerciseInstances: WorkoutBlockExerciseInstance[] = [];
    if (activeExerciseInstances && activeExerciseInstances.length > 0) {
        allExerciseInstances = activeExerciseInstances;
    } else {
        instance.blockInstances?.forEach(bi => {
            if (bi.exerciseInstances) {
                allExerciseInstances.push(...bi.exerciseInstances);
            }
        });
    }
    allExerciseInstances.forEach(ei => {

        const exercise = ei.workoutBlockExercise?.exercise;
        if (!exercise) return;

        // Determine the "load" of this exercise instance
        let load = 0;

        // Check if we have volume calculated already or calculate it
        if (ei.measures) {
            const weight = ei.measures.externalLoad?.value || 0;
            const reps = ei.measures.reps || 0;
            const distance = ei.measures.distance?.value || 0;
            const time = ei.measures.time?.value || 0;

            if (weight > 0 && distance > 0) {
                load = weight * distance;
            } else if (weight > 0 && reps > 0) {
                load = weight * reps;
            } else if (reps > 0) {
                load = reps;
            } else if (distance > 0) {
                load = distance;
            } else if (time > 0) {
                load = time;
            } else {
                load = 1; // Minimal unit
            }
        }
        const { primary, secondary, tertiary } = exercise.muscleGroups;

        // Weights for distribution
        const PRIMARY_WEIGHT = 1.0;
        const SECONDARY_WEIGHT = 0.5;
        const TERTIARY_WEIGHT = 0.25;

        const addWork = (id: string | undefined, weight: number) => {
            if (!id) return;
            // Resolve name: use map if provided, otherwise assume ID is Name (or castable)
            let name: MuscleGroupName | undefined;
            if (muscleGroupMap && muscleGroupMap[id]) {
                name = muscleGroupMap[id];
            } else {
                // Check if id is a valid MuscleGroupName
                // This is a loose check, assuming the data is clean or ID=Name
                name = id as MuscleGroupName;
            }

            if (name) {
                muscleWork[name] = (muscleWork[name] || 0) + (load * weight);
            }
        };

        addWork(primary, PRIMARY_WEIGHT);
        addWork(secondary, SECONDARY_WEIGHT);
        addWork(tertiary, TERTIARY_WEIGHT);
    });

    return muscleWork as MuscleWorkMap;
}
