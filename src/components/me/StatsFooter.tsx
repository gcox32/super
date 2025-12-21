import { Info } from 'lucide-react';

interface StatsFooterProps {
  activeDays: number;
  weekStreak: number;
}

export default function StatsFooter({ activeDays, weekStreak }: StatsFooterProps) {
  return (
    <div className="flex justify-between items-end mt-6">
      <div className="flex gap-8">
        <div className="flex flex-col">
          <span className="font-bold text-2xl text-brand-primary">{activeDays}</span>
          <span className="text-muted-foreground text-xs">Active days</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-2xl text-brand-primary">{weekStreak}</span>
          <span className="text-muted-foreground text-xs">Week streak</span>
        </div>
      </div>
      
      <Info className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

