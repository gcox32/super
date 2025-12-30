'use client';

import React, { useMemo } from 'react';

interface DataPoint {
  date: Date;
  value: number;
  label?: string; // Formatted date or label
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  unit?: string;
  title?: string;
}

export function SimpleLineChart({ 
  data, 
  height = 200, 
  color = '#3b82f6', 
  unit = '', 
  title 
}: SimpleLineChartProps) {
  const padding = 20;
  const bottomPadding = 30;
  const leftPadding = 40;

  const { points, min, max, keyPoints } = useMemo(() => {
    if (data.length === 0) return { points: [], min: 0, max: 0, keyPoints: [] };

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    // Add some buffer
    const range = maxVal - minVal || 1; // Avoid division by zero
    const min = Math.max(0, minVal - range * 0.1);
    const max = maxVal + range * 0.1;

    const mappedPoints = data.map((d, i) => ({
      x: i,
      y: d.value,
      date: d.date,
      label: d.label
    }));

    // Identify key indices
    const latestIndex = mappedPoints.length - 1;
    // We want specifically the *first* occurrence of min/max if there are ties, or maybe last? 
    // Let's go with simple indexOf for first occurrence
    const maxIndex = values.indexOf(maxVal);
    const minIndex = values.indexOf(minVal);

    // Filter to unique indices to avoid overlapping labels if e.g. latest is also max
    const keyIndices = new Set([0, latestIndex, maxIndex, minIndex]); // Added 0 (start) as well? The user asked for highest, lowest, latest.
    // User requested: highest, lowest, and latest.
    const requestedKeyIndices = new Set([latestIndex, maxIndex, minIndex]);

    return { 
      points: mappedPoints,
      min, 
      max,
      keyPoints: Array.from(requestedKeyIndices).sort((a, b) => a - b).map(idx => ({
        ...mappedPoints[idx],
        type: idx === latestIndex ? 'Latest' : (idx === maxIndex ? 'High' : 'Low')
      }))
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center border rounded-(--radius) bg-zinc-800 border-zinc-700 text-gray-500" style={{ height }}>
        No data available
      </div>
    );
  }

  const width = 100; // using percentage-like SVG coordinates logic or viewbox
  // Actually easier to just use 100% width and coordinate system 0-100 for X, but keeping aspect ratio is tricky in SVG alone without fixed width.
  // Let's assume the SVG scales. We'll map X to 0-1000 and Y to 0-1000 for internal coords.
  
  const viewBoxWidth = 1000;
  const viewBoxHeight = 500;
  const graphWidth = viewBoxWidth - leftPadding - padding;
  const graphHeight = viewBoxHeight - padding - bottomPadding;

  const getX = (index: number) => leftPadding + (index / (points.length - 1 || 1)) * graphWidth;
  const getY = (value: number) => padding + graphHeight - ((value - min) / (max - min || 1)) * graphHeight;

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.y)}`
  ).join(' ');

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium text-gray-300 mb-2 w-full text-center">{title}</h3>}
      <div className="relative w-full" style={{ height }}>
        <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
            className="overflow-visible"
            preserveAspectRatio="none" // Stretch to fill
        >
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => {
            const val = min + (max - min) * t;
            const y = getY(val);
            return (
              <g key={t}>
                <line x1={leftPadding} y1={y} x2={viewBoxWidth - padding} y2={y} stroke="currentColor" className="text-gray-800" strokeWidth="2" />
                {/* <text x={leftPadding - 5} y={y + 5} textAnchor="end" fontSize="24" fill="#9ca3af">
                  {Math.round(val)}{unit}
                </text> */} 
                {/* Text inside SVG with preserveAspectRatio="none" looks bad. Better to use HTML overlay or just simple tooltip */}
              </g>
            );
          })}

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="4" vectorEffect="non-scaling-stroke" />

          {/* Dots */}
          {points.map((p, i) => (
             <circle 
                key={i} 
                cx={getX(i)} 
                cy={getY(p.y)} 
                r="6" 
                fill={color} 
                className="hover:scale-150 transition-transform origin-center cursor-pointer"
             >
                <title>{`${p.label || p.date.toLocaleDateString()}: ${p.y} ${unit}`}</title>
             </circle>
          ))}

          {/* Key Point Labels inside SVG */}
          {keyPoints.map((p, i) => {
            const x = getX(p.x);
            const y = getY(p.y);
            
            // Determine position: push away from the point towards center of graph vertically
            // But also consider boundaries.
            const isTopHalf = y < (graphHeight / 2) + padding;
            
            // Increase distance: previously 25/-15, now 40/-30 to give more breathing room
            const labelYOffset = isTopHalf ? 40 : -30;
            const subLabelYOffset = isTopHalf ? 20 : -20;
            
            return (
              <g key={`label-${i}`} pointerEvents="none">
                 <text 
                  x={x} 
                  y={y + labelYOffset} 
                  textAnchor="middle" 
                  fontSize="20" 
                  fill="currentColor"
                  className="text-gray-300 font-medium"
                >
                  {Math.round(p.y).toLocaleString()}{unit}
                </text>
                
                <text 
                  x={x} 
                  y={y + labelYOffset + subLabelYOffset} 
                  textAnchor="middle" 
                  fontSize="16" 
                  fill="currentColor"
                  className="text-gray-400 text-sm"
                >
                  {p.date.toISOString().split('T')[0]}
                </text> 
              </g>
            );
          })}
        </svg>
        
        {/* Simple Labels Overlay */}
        <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between text-xs
         text-gray-500 pointer-events-none" style={{ paddingBottom: '30px', paddingTop: '20px' }}>
             <div>{Math.round(max).toLocaleString()}{unit}</div>
             <div>{Math.round(min).toLocaleString()}{unit}</div>
        </div>
      </div>
    </div>
  );
}

