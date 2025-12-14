import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SessionFooterProps {
  nextStepName: string | null;
  onNext: () => void;
}

export function SessionFooter({ nextStepName, onNext }: SessionFooterProps) {
  return (
    <button
      onClick={onNext}
      className="group relative w-full bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 pt-5 pb-8 px-6 -mx-5 mt-auto active:bg-zinc-800 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span className="text-brand-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Next
          </span>
          <span className="text-lg font-medium text-white truncate max-w-[240px]">
            {nextStepName || 'Finish Workout'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-primary text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20">
          {nextStepName ? (
            <ArrowRight className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>
      </div>
    </button>
  );
}

