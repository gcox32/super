import {
  Info,
  RotateCcw,
  ChevronRight,
  StickyNote,
  Repeat,
} from 'lucide-react';

interface SessionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export function SessionMenu({ isOpen, onClose, onSkip }: SessionMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div
        className="bg-zinc-900 w-full max-w-sm rounded-3xl p-2 space-y-1 shadow-2xl border border-zinc-800 animate-in slide-in-from-bottom-10"
        onClick={(e) => e.stopPropagation()}
      >
        <MenuButton
          icon={Info}
          label="Exercise Details"
          onClick={onClose}
        />
        <MenuButton
          icon={RotateCcw}
          label="Swap Exercise"
          onClick={onClose}
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
          label="Note to Self"
          onClick={onClose}
        />
        <MenuButton
          icon={Repeat}
          label="Cancel"
          variant="ghost"
          onClick={onClose}
        />
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
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

