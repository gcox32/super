import type {
  WorkoutInstance,
  WorkoutBlockInstance,
  WorkoutBlock,
  WorkoutBlockExercise,
  WorkoutBlockExerciseInstance,
} from '@/types/train';

export type WorkoutInstanceResponse = { workoutInstance: WorkoutInstance };
export type BlockInstancesResponse = { instances: WorkoutBlockInstance[] };
export type BlocksResponse = { blocks: WorkoutBlock[] };
export type BlockExercisesResponse = { exercises: WorkoutBlockExercise[] };
export type BlockExerciseInstancesResponse = {
  instances: WorkoutBlockExerciseInstance[];
};

