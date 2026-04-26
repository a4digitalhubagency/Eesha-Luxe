"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface CheckoutInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

export function CheckoutInput({ label, type = "text", value, onChange, autoComplete }: CheckoutInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const active = focused || value.length > 0;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative pt-4">
      <label className={`absolute transition-all duration-200 pointer-events-none ${
        active ? "top-0 text-[10px] tracking-[0.1rem] uppercase text-primary" : "top-4 text-sm text-on-surface-faint"
      }`}>
        {label}
      </label>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className={`w-full bg-transparent border-b pb-2 pt-1 text-sm text-on-surface outline-none transition-all duration-200 ${
          isPassword ? "pr-8" : ""
        } ${focused ? "border-b-2 border-primary" : "border-b border-outline/20"}`}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-0 bottom-2.5 text-on-surface-faint hover:text-primary transition-colors"
        >
          {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
        </button>
      )}
    </div>
  );
}
