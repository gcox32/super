import Button from "@/components/ui/Button";
import { formatClock } from "@/lib/train/helpers";
import { SessionStep } from "@/types/train";

interface RestTimerDisplayProps {
    restSecondsRemaining: number;
    currentStep: SessionStep;
    endRestAndAdvance: () => void;
}

export function RestTimerDisplay({ restSecondsRemaining, currentStep, endRestAndAdvance }: RestTimerDisplayProps) {

    return (
        <div className="flex flex-col justify-center items-center gap-4 mt-6 mb-10">
        <div className="font-medium text-zinc-400 text-xs uppercase tracking-[0.2em]">
          Rest
        </div>
        <div className="font-black tabular-nums text-6xl tracking-tight">
          {formatClock(restSecondsRemaining)}
        </div>
        {currentStep.exercise.restTime && (
          <div className="text-zinc-500 text-xs">
            Planned rest: {currentStep.exercise.restTime}s
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              // convert to 10s chunks or pause by setting remaining to 0 and letting effect advance
              endRestAndAdvance();
            }}
          >
            Skip Rest
          </Button>
        </div>
      </div>
    );
}