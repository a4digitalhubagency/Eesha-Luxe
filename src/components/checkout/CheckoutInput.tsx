"use client";

import { useState } from "react";

interface CheckoutInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

export function CheckoutInput({ label, type = "text", value, onChange, autoComplete }: CheckoutInputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pt-4">
      <label className={`absolute transition-all duration-200 pointer-events-none ${
        active ? "top-0 text-[10px] tracking-[0.1rem] uppercase text-primary" : "top-4 text-sm text-on-surface-faint"
      }`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className={`w-full bg-transparent border-b pb-2 pt-1 text-sm text-on-surface outline-none transition-all duration-200 ${
          focused ? "border-b-2 border-primary" : "border-b border-outline/20"
        }`}
      />
    </div>
  );
}
