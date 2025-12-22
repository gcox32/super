import React, { useMemo } from 'react';
import { muscleGroupImages } from './imageConfig';
import { MuscleGroupName } from '@/types/anatomy';

// Base SVG paths
const BODY_OUTLINE_FRONT = '/images/anatomy/front/svg/-full-body-front-black-outline.svg';
const BODY_OUTLINE_BACK = '/images/anatomy/back/svg/-full-body-back-black-outline.svg';

interface MuscleHeatmapProps {
  muscleWork: Record<MuscleGroupName, number>;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function MuscleHeatmap({ 
  muscleWork, 
  width = "100%", 
  height = "auto",
  className = "" 
}: MuscleHeatmapProps) {
  
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
          {viewImages.map((src, index) => (
            <img
              key={`${groupName}-${index}`}
              src={src}
              alt={groupName}
              className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-500"
              style={{ 
                opacity: 0.2 + (opacity * 0.8), // Base opacity + scaled work
                filter: `sepia(1) hue-rotate(-50deg) saturate(${2 + opacity * 3})` // Reddish tint
              }} 
            />
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`flex gap-4 ${className}`} style={{ width, height }}>
      {/* Front View */}
      <div className="relative flex-1 aspect-1/2">
        <img 
          src={BODY_OUTLINE_FRONT} 
          alt="Body Outline Front" 
          className="absolute inset-0 w-full h-full object-contain opacity-30"
        />
        {renderMuscleLayers('front')}
      </div>

      {/* Back View */}
      <div className="relative flex-1 aspect-1/2">
        <img 
          src={BODY_OUTLINE_BACK} 
          alt="Body Outline Back" 
          className="absolute inset-0 w-full h-full object-contain opacity-30"
        />
        {renderMuscleLayers('back')}
      </div>
    </div>
  );
}

