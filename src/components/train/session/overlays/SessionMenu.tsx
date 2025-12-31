import {
  Info,
  RotateCcw,
  ChevronRight,
  StickyNote,
  Repeat,
  CheckCircle,
  Timer,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SessionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAddNote: () => void;
  onExerciseDetails: () => void;
  onSwapExercise: () => void;
  onSubmitEarly: () => void;
  onStopwatch: () => void;
}

export function SessionMenu({ 
  isOpen, 
  onClose, 
  onSkip, 
  onAddNote, 
  onExerciseDetails, 
  onSwapExercise, 
  onSubmitEarly,
  onStopwatch 
}: SessionMenuProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small timeout to ensure DOM element exists and layout is calculated before transition starts
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for transition to finish before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-150 ease-out ${
        isVisible ? 'bg-black/60 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-zinc-900 w-full max-w-sm rounded-3xl p-2 space-y-1 shadow-2xl border border-zinc-800 transition-all duration-150 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuButton
          icon={Info}
          label="Exercise Details"
          onClick={onExerciseDetails}
        />
        <MenuButton
          icon={RotateCcw}
          label="Swap Exercise"
          onClick={onSwapExercise}
        />
        <MenuButton
          icon={ChevronRight}
          label="Skip Set"
          onClick={() => {
            onClose();
            onSkip();
          }}
        />
        <MenuButton
          icon={StickyNote}
          label="Add Note"
          onClick={onAddNote}
        />
        <MenuButton
          icon={Timer}
          label="Stopwatch"
          onClick={() => {
            onClose();
            onStopwatch();
          }}
        />
        <MenuButton
          icon={CheckCircle}
          label="Submit Early"
          onClick={() => {
            onClose();
            onSubmitEarly();
          }}
        />
        <MenuButton
          icon={Repeat}
          label="Cancel"
          variant="ghost"
          onClick={onClose}
        />
      </div>
      <div className="-z-10 absolute inset-0" onClick={onClose} />
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: any;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'ghost';
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors font-medium ${
        variant === 'ghost'
          ? 'bg-transparent text-zinc-400 hover:text-white'
          : 'bg-zinc-800/50 hover:bg-zinc-800 text-white'
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          variant === 'ghost' ? 'text-current' : 'text-brand-primary'
        }`}
      />
      {label}
    </button>
  );
}

