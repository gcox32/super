'use client';

import { useEffect, useRef } from 'react';
import helixLoader from './index';

interface HelixProps {
  size?: number | string;
  color?: string;
  speed?: number | string;
}

export default function Helix({ size = 60, color = 'var(--brand-primary)', speed = 2.5 }: HelixProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register the custom element if not already registered
    if (typeof window !== 'undefined') {
      helixLoader.register('l-helix');

      // Create and append the element
      if (containerRef.current) {
        const helixElement = document.createElement('l-helix') as any;
        helixElement.setAttribute('size', size.toString());
        helixElement.setAttribute('color', color);
        helixElement.setAttribute('speed', speed.toString());
        
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(helixElement);
      }
    }
  }, [size, color, speed]);

  return <div ref={containerRef} />;
}

