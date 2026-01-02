import type { WorkoutBlock, SessionStep } from '@/types/train';

interface SessionProgressBarProps {
  blocks: WorkoutBlock[];
  steps: SessionStep[];
  currentStepIndex: number;
  currentBlockId: string;
  isResting?: boolean;
}

export function SessionProgressBar({
  blocks,
  steps,
  currentStepIndex,
  currentBlockId,
  isResting = false,
}: SessionProgressBarProps) {
  return (
    <div className="flex gap-1 h-1 w-full mt-4 mb-6">
      {blocks.map((block) => {
        // Find all steps belonging to this block
        const blockSteps = steps.filter((s) => s.block.id === block.id);
        const totalBlockSteps = blockSteps.length;

        // Count how many of these steps are completed
        // If we're resting, the current step is considered completed
        const effectiveStepIndex = isResting ? currentStepIndex + 1 : currentStepIndex;
        const completedInBlock = blockSteps.filter(
          (s) => steps.indexOf(s) < effectiveStepIndex
        ).length;

        // If we are past this block entirely
        const isPastBlock =
          blocks.findIndex((b) => b.id === block.id) <
          blocks.findIndex((b) => b.id === currentBlockId);

        let fillPercent = 0;
        if (totalBlockSteps === 0) {
          fillPercent = isPastBlock ? 100 : 0;
        } else {
          fillPercent = (completedInBlock / totalBlockSteps) * 100;
          
          // Ensure at least a tiny bit is visible if we are in it but 0 steps done?
          if (block.id === currentBlockId && fillPercent === 0) {
            fillPercent = 5; // minimal active indicator
          }
        }

        // If we finished the block, make sure it's 100%
        if (isPastBlock) fillPercent = 100;

        return (
          <div
            key={block.id}
            className="h-full bg-white/20 flex-1 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-brand-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, fillPercent)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

