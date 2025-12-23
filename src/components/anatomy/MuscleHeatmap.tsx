import React, { useMemo } from 'react';
import { muscleGroupImages, imageTransforms } from './imageConfig';
import { MuscleGroupName } from '@/types/anatomy';
import { WorkoutInstance, WorkoutBlockExercise, WorkoutBlockExerciseInstance } from '@/types/train';
import { calculateMuscleWorkDistribution } from '@/lib/anatomy/muscle-work';

// Base SVG paths
const BODY_OUTLINE_FRONT = '/images/anatomy/front/svg/-full-body-front-black-outline.svg';
const BODY_OUTLINE_BACK = '/images/anatomy/back/svg/-full-body-back-black-outline.svg';

interface MuscleHeatmapProps {
  muscleWork?: Record<MuscleGroupName, number>;
  workoutInstance?: WorkoutInstance | null;
  exercisesMap?: Record<string, WorkoutBlockExercise[]>;
  completedExerciseInstances?: WorkoutBlockExerciseInstance[];
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function MuscleHeatmap({ 
  muscleWork: providedMuscleWork,
  workoutInstance,
  exercisesMap,
  completedExerciseInstances,
  width = "100%", 
  height = "auto",
  className = "" 
}: MuscleHeatmapProps) {
  
  // Calculate or use provided muscle work
  const muscleWork = useMemo(() => {
    if (providedMuscleWork) return providedMuscleWork;
    if (!workoutInstance) return {} as Record<MuscleGroupName, number>;
    
    return calculateMuscleWorkDistribution(
      workoutInstance,
      completedExerciseInstances && completedExerciseInstances.length > 0
        ? completedExerciseInstances
        : undefined, // fallback to all from workoutInstance if no completed instances provided
      undefined, // muscleGroupMap
      exercisesMap // exercisesMap for exercise lookup
    );
  }, [providedMuscleWork, workoutInstance, completedExerciseInstances, exercisesMap]);

  // Normalize work values to 0-1 for opacity
  const normalizedWork = useMemo(() => {
    const maxWork = Math.max(...Object.values(muscleWork), 1); // Avoid div by 0
    const normalized: Record<string, number> = {};
    
    Object.entries(muscleWork).forEach(([name, work]) => {
      // Linear scaling for now, could be logarithmic if disparities are huge
      normalized[name] = Math.min(Math.max(work / maxWork, 0), 1);
    });
    return normalized;
  }, [muscleWork]);

  const renderMuscleLayers = (view: 'front' | 'back') => {
    return Object.entries(muscleGroupImages).map(([groupName, images]) => {
      const opacity = normalizedWork[groupName] || 0;
      if (opacity === 0) return null;

      const viewImages = images[view];
      if (!viewImages || viewImages.length === 0) return null;

      return (
        <React.Fragment key={groupName}>
          {viewImages.map((src, index) => {
            const transform = imageTransforms[src];
            return (
              <img
                key={`${groupName}-${index}`}
                src={src}
                alt={groupName}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
                style={{ 
                  opacity: 0.4 + (opacity * 0.6), // Higher base opacity
                  // Invert and hue-rotate to turn white to transparent (via screen) and keep reds
                  filter: `
                    invert(1) 
                    hue-rotate(180deg) 
                    saturate(${1.5 + opacity * 1.5}) 
                    brightness(1.2) 

                    `, 
                  transform: transform || undefined,
                  mixBlendMode: 'screen' // Better for dark mode
                }} 
              />
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div 
      className={`flex bg-zinc-950/50 border border-zinc-800/50 p-6 rounded-2xl ${className}`} 
      style={{ width, height }}
    >
      {/* Front View */}
      <div className="relative flex-1 aspect-1/2">
        <img 
          src={BODY_OUTLINE_FRONT} 
          alt="Body Outline Front" 
          className="absolute inset-0 opacity-50 w-full h-full object-contain invert"
        />
        {renderMuscleLayers('front')}
      </div>

      {/* Back View */}
      <div className="relative flex-1 aspect-1/2">
        <img 
          src={BODY_OUTLINE_BACK} 
          alt="Body Outline Back" 
          className="absolute inset-0 opacity-50 w-full h-full object-contain invert" // Invert for dark mode
        />
        {renderMuscleLayers('back')}
      </div>
    </div>
  );
}

