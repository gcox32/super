import { Play, Pause, Settings, List } from 'lucide-react';

interface SessionHeaderProps {
  elapsedSeconds: number;
  isPaused: boolean;
  onPauseToggle: () => void;
  formatClock: (seconds: number) => string;
}

export function SessionHeader({
  elapsedSeconds,
  isPaused,
  onPauseToggle,
  formatClock,
}: SessionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onPauseToggle}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
        >
          {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
        </button>
        <span className="font-mono text-2xl font-semibold tracking-wider">
          {formatClock(elapsedSeconds)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Settings className="w-6 h-6 text-white/80" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <List className="w-6 h-6 text-white/80" />
        </button>
      </div>
    </div>
  );
}

