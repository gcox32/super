'use client';

import { useState, use, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { WorkoutBlockExerciseInstance } from '@/types/train';

import { formatClock } from '@/lib/train/helpers';

import { RestTimerDisplay } from '@/components/train/session/RestTimerDisplay';
import { SessionHeader } from '@/components/train/session/SessionHeader';
import { SessionProgressBar } from '@/components/train/session/SessionProgressBar';
import { SessionExerciseDisplay } from '@/components/train/session/SessionExerciseDisplay';
import { SessionInputControls } from '@/components/train/session/SessionInputControls';
import { SessionFooter } from '@/components/train/session/SessionFooter';
import { SessionMenu } from '@/components/train/session/overlays/SessionMenu';
import { PauseOverlay } from '@/components/train/session/overlays/PauseOverlay';
import { SettingsOverlay } from '@/components/train/session/overlays/SettingsOverlay';
import { WorkoutSummaryOverlay } from '@/components/train/session/overlays/WorkoutSummaryOverlay';
import { NoteInputOverlay } from '@/components/train/session/overlays/NoteInputOverlay';
import { ExerciseDetailsOverlay } from '@/components/train/session/overlays/ExerciseDetailsOverlay';
import { SwapExerciseOverlay } from '@/components/train/session/overlays/SwapExerciseOverlay';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { WorkoutCompleteView } from '@/components/train/session/WorkoutCompleteView';
import { StopwatchWidget } from '@/components/train/session/overlays/StopwatchWidget';

import { useSessionData } from '@/hooks/train/session/useSessionData';
import { useSessionTimers } from '@/hooks/train/session/useSessionTimers';
import { useSessionInput } from '@/hooks/train/session/useSessionInput';
import { useSessionActions } from '@/hooks/train/session/useSessionActions';

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  // Custom Hooks
  const sessionData = useSessionData(id);
  const {
    loading,
    error,
    workoutInstance,
    blocks,
    exercisesMap,
    exerciseInstances,
    steps,
    currentStepIndex,
  } = sessionData;

  const sessionTimers = useSessionTimers();
  const {
    elapsedSeconds,
    isPaused,
    setIsPaused,
    isResting,
    restSecondsRemaining,
    timerSoundsEnabled,
    setTimerSoundsEnabled,
    restEnabled,
    setRestEnabled,
    countdownAudioRef,
    completeAudioRef,
    isRestComplete,
    setIsRestComplete,
    syncElapsedSeconds,
  } = sessionTimers;

  // Initialize timer from saved duration on load
  const [timerInitialized, setTimerInitialized] = useState(false);
  useEffect(() => {
    if (workoutInstance && !timerInitialized) {
      if (workoutInstance.duration && typeof workoutInstance.duration.value === 'number') {
        const val = workoutInstance.duration.value;
        const unit = workoutInstance.duration.unit;
        let seconds = val;
        // Basic conversion if saved as minutes or hours, though we prefer seconds now
        if (unit === 'min') seconds = val * 60;
        else if (unit === 'hr') seconds = val * 3600;
        
        if (seconds > 0) {
           syncElapsedSeconds(seconds);
        }
      }
      setTimerInitialized(true);
    }
  }, [workoutInstance, timerInitialized, syncElapsedSeconds]);

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];

  const sessionInput = useSessionInput({
    currentStep,
    currentStepIndex,
    steps,
    exerciseInstances,
  });

  const {
    isComplete,
    handleEndSession,
    finishWorkout,
    saveCurrentStep,
    endRestAndAdvance,
    handleNext,
    handlePrevious,
    handleSaveNote,
    getCurrentNote,
    handleSwapExercise,
  } = useSessionActions({
    data: sessionData,
    timers: sessionTimers,
    input: sessionInput,
    sessionId: id,
  });

  // Handle rest timer completion
  useEffect(() => {
    if (isRestComplete) {
      endRestAndAdvance();
      setIsRestComplete(false);
    }
  }, [isRestComplete, endRestAndAdvance, setIsRestComplete]);

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isExerciseDetailsOpen, setIsExerciseDetailsOpen] = useState(false);
  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false);
  const [isSubmitEarlyModalOpen, setIsSubmitEarlyModalOpen] = useState(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);

  // Derived Metrics
  const totalVolume = useMemo(() => {
    let total = 0;
    Object.values(exerciseInstances).forEach((instances) => {
      instances.forEach((inst) => {
        const r = inst.measures.reps ?? 0;
        const l = inst.measures.externalLoad?.value ?? 0;
        total += r * l;
      });
    });
    return total;
  }, [exerciseInstances]);

  const totalSets = useMemo(() => {
    let count = 0;
    Object.values(exerciseInstances).forEach((instances) => {
      instances.forEach((inst) => {
        if (inst.complete) {
          count++;
        }
      });
    });
    return count;
  }, [exerciseInstances]);

  const completedExerciseInstances = useMemo(() => {
    const completed: WorkoutBlockExerciseInstance[] = [];
    Object.values(exerciseInstances).forEach((instances) => {
      instances.forEach((inst) => {
        if (inst.complete) {
          completed.push(inst);
        }
      });
    });
    return completed;
  }, [exerciseInstances]);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-black w-full h-screen text-white">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error || !currentStep) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-black p-6 w-full h-screen text-white">
        <p className="text-red-500">{error || "Workout completed or invalid."}</p>
        <Button onClick={() => handleEndSession()}>Back to Train</Button>
      </div>
    );
  }

  if (isComplete) {
    return <WorkoutCompleteView onContinue={handleEndSession} workoutInstance={workoutInstance} exercisesMap={exercisesMap} completedExerciseInstances={completedExerciseInstances} />;
  }

  return (
    <div 
      className="relative flex flex-col w-full h-dvh overscroll-none font-sans text-white touch-none"
    >
      
      {/* Background Video/Image */}
      <div className="z-0 absolute inset-0 opacity-40">
        {currentStep.exercise.exercise.videoUrl ? (
          <video 
            src={currentStep.exercise.exercise.videoUrl} 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <div className="flex justify-center items-center bg-zinc-900 w-full h-full">
            {/* Fallback pattern or image */}
            <div className="bg-linear-to-br from-zinc-800 to-black w-full h-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-transparent to-black/90" />
      </div>

      {/* Main Content Layer */}
      <div className="z-10 relative safe-area-inset-top flex flex-col px-5 py-4 h-full">
        
        <SessionHeader 
          elapsedSeconds={elapsedSeconds}
          onPauseToggle={() => setIsPaused(!isPaused)}
          formatClock={formatClock}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onOverviewClick={() => setIsSummaryOpen(true)}
        />

        <SessionProgressBar 
          blocks={blocks} 
          steps={steps}
          currentStepIndex={currentStepIndex}
          currentBlockId={currentStep.block.id}
          isResting={isResting}
        />

        <SessionExerciseDisplay 
          step={currentStep}
          onMenuOpen={() => setIsMenuOpen(true)}
        />

        {/* Spacer to push content down */}
        <div className="flex-1" />

        {!isResting && (
          <>
            <SessionInputControls 
              step={currentStep}
              reps={sessionInput.reps}
              onRepsChange={sessionInput.setReps}
              weight={sessionInput.weight}
              onWeightChange={sessionInput.setWeight}
              weightUnit={sessionInput.weightUnit}
              onWeightUnitChange={sessionInput.setWeightUnit}
              distance={sessionInput.distance}
              onDistanceChange={sessionInput.setDistance}
              distanceUnit={sessionInput.distanceUnit}
              onDistanceUnitChange={sessionInput.setDistanceUnit}
              time={sessionInput.time}
              onTimeChange={sessionInput.setTime}
              timeUnit={sessionInput.timeUnit}
              onTimeUnitChange={sessionInput.setTimeUnit}
              calories={sessionInput.calories}
              onCaloriesChange={sessionInput.setCalories}
              height={sessionInput.height}
              onHeightChange={sessionInput.setHeight}
              heightUnit={sessionInput.heightUnit}
              onHeightUnitChange={sessionInput.setHeightUnit}
              pace={sessionInput.pace}
              onPaceChange={sessionInput.setPace}
              paceUnit={sessionInput.paceUnit}
              onPaceUnitChange={sessionInput.setPaceUnit}
            />

            <SessionFooter 
              nextStepName={nextStep ? nextStep.exercise.exercise.name : null}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoBack={currentStepIndex > 0}
            />
          </>
        )}

        {isResting && (
          <RestTimerDisplay 
            restSecondsRemaining={restSecondsRemaining} 
            currentStep={currentStep} 
            endRestAndAdvance={endRestAndAdvance}
            nextStep={nextStep}
          />
        )}

      </div>

      <SessionMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSkip={handleNext}
        onAddNote={() => {
          setIsMenuOpen(false);
          setIsNoteOpen(true);
        }}
        onExerciseDetails={() => {
          setIsMenuOpen(false);
          setIsExerciseDetailsOpen(true);
        }}
        onSwapExercise={() => {
          setIsMenuOpen(false);
          setIsSwapExerciseOpen(true);
        }}
        onStopwatch={() => {
          setIsMenuOpen(false);
          setIsStopwatchOpen(true);
        }}
        onSubmitEarly={() => {
          setIsMenuOpen(false);
          setIsSubmitEarlyModalOpen(true);
        }}
      />

      <PauseOverlay 
        isOpen={isPaused} 
        onResume={() => setIsPaused(false)} 
        onEndSession={() => setIsEndSessionModalOpen(true)}
      />

      <ConfirmationModal
        isOpen={isSubmitEarlyModalOpen}
        onClose={() => setIsSubmitEarlyModalOpen(false)}
        onConfirm={() => finishWorkout('Exited workout early')}
        title="Submit Workout Early"
        message="Are you sure you want to finish the workout early? Your progress so far will be saved."
        confirmText="Submit Early"
      />

      <ConfirmationModal
        isOpen={isEndSessionModalOpen}
        onClose={() => setIsEndSessionModalOpen(false)}
        onConfirm={handleEndSession}
        title="Exit Workout"
        message="Are you sure you want to exit? Your progress will not be marked as complete."
        confirmText="Exit"
        confirmVariant="danger"
      />

      <SettingsOverlay 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        timerSoundsEnabled={timerSoundsEnabled}
        onTimerSoundsChange={(value) => {
          setTimerSoundsEnabled(value);
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('aegis.timerSoundsEnabled', value ? 'true' : 'false');
            } catch {
              // ignore
            }
          }
        }}
        restEnabled={restEnabled}
        onRestEnabledChange={(value) => {
          setRestEnabled(value);
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('aegis.restEnabled', value ? 'true' : 'false');
            } catch {
              // ignore
            }
          }
        }}
      />

      <WorkoutSummaryOverlay 
        isOpen={isSummaryOpen} 
        onClose={() => setIsSummaryOpen(false)} 
        workoutInstance={workoutInstance}
        totalVolume={totalVolume}
        durationSeconds={elapsedSeconds}
        totalSets={totalSets}
        blocks={blocks}
        exercisesMap={exercisesMap}
        completedExerciseInstances={completedExerciseInstances}
      />

      <NoteInputOverlay
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        initialNote={getCurrentNote()}
        onSave={handleSaveNote}
        exerciseName={currentStep?.exercise.exercise.name || ''}
      />

      <ExerciseDetailsOverlay
        isOpen={isExerciseDetailsOpen}
        onClose={() => setIsExerciseDetailsOpen(false)}
        exercise={currentStep?.exercise.exercise || null}
      />

      <SwapExerciseOverlay
        isOpen={isSwapExerciseOpen}
        onClose={() => setIsSwapExerciseOpen(false)}
        currentExercise={currentStep?.exercise.exercise || null}
        onSwap={handleSwapExercise}
      />

      <StopwatchWidget
        isOpen={isStopwatchOpen}
        onClose={() => setIsStopwatchOpen(false)}
      />

      {/* Timer sounds */}
      <audio
        ref={countdownAudioRef}
        src="/sounds/timer-countdown.mp3"
        preload="auto"
      />
      <audio
        ref={completeAudioRef}
        src="/sounds/timer-complete.mp3"
        preload="auto"
      />
    </div>
  );
}
