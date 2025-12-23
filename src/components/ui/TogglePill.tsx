'use client';

import React from 'react';

interface TogglePillProps {
  leftLabel: string;
  rightLabel: string;
  value: boolean; // true = left, false = right
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function TogglePill({ leftLabel, rightLabel, value, onChange, disabled = false }: TogglePillProps) {
  return (
    <div className={`flex flex-col items-center space-y-2 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="inline-flex relative bg-muted p-1 rounded-full w-full max-w-xs cursor-pointer">
        {/* Sliding pill */}
        <div
          className="top-1 bottom-1 left-1 absolute bg-brand-primary shadow-sm rounded-full w-1/2 transition-transform duration-200 ease-out cursor-pointer"
          style={{
            transform: value ? 'translateX(0%)' : 'translateX(95%)',
          }}
        />
        {/* Left label */}
        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          className={`relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
            value ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {leftLabel}
        </button>
        {/* Right label */}
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          className={`relative z-10 flex-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
            !value ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
}
