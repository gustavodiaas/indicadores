"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Props {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  placeholder?: string;
}

export function InputField({ label, value, onChange, type = "text", suffix, placeholder }: Props) {
  const [localValue, setLocalValue] = useState(value === 0 ? "" : (value?.toString() || ""));

  useEffect(() => {
    if (value === 0 && localValue !== "") {
      setLocalValue("");
    } else if (value !== undefined && value.toString() !== localValue) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (type === "number") {
      onChange(val.replace(',', '.'));
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-0.5">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          type={type}
          step={type === "number" ? "any" : undefined}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            h-10 rounded-[10px] px-3 text-sm transition-colors duration-200
            bg-[#F5F5F7] dark:bg-[#2C2C2E]
            border border-black/[0.07] dark:border-white/10
            text-slate-800 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:bg-white dark:focus:bg-[#333336]
            focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00]
            ${suffix ? 'pr-12' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-400 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
