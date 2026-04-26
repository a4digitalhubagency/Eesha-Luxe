"use client";

interface SizeSelectorProps {
  sizes: { label: string; available: boolean }[];
  selected: string | null;
  onChange: (size: string) => void;
}

export function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ label, available }) => (
        <button
          key={label}
          disabled={!available}
          onClick={() => onChange(label)}
          className={`
            min-w-[52px] px-3 py-2 text-xs font-medium rounded-[4px] transition-all duration-200
            ${
              selected === label
                ? "bg-primary-container text-primary"
                : available
                ? "bg-surface-lowest text-on-surface border border-outline/20 hover:border-primary/40"
                : "bg-surface-low text-on-surface-faint opacity-40 cursor-not-allowed line-through"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
