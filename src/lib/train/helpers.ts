import { TimeMeasurement } from "@/types/measures";

export function timeToSeconds(duration?: TimeMeasurement | null): number {
    if (!duration) return 0;
    const { value, unit } = duration;
    if (unit === 's') return value;
    if (unit === 'min') return value * 60;
    if (unit === 'hr') return value * 3600;
    return 0;
  }
  
export function formatClock(seconds: number) {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }