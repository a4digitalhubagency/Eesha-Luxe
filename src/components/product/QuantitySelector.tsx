"use client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 1, max = 10 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-on-surface-muted hover:text-on-surface disabled:opacity-30 transition-colors text-lg"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="text-sm font-medium text-on-surface w-4 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-on-surface-muted hover:text-on-surface disabled:opacity-30 transition-colors text-lg"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
