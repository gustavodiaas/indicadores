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
  // Ajuste: inicia como string vazia se for 0 para não mostrar "0" na tela
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
      <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
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
            h-12 rounded-xl text-sm transition-all duration-300
            bg-slate-50 dark:bg-[#001022] border-none shadow-none
            text-slate-700 dark:text-slate-200
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#FF6B00] focus:shadow-md
            ${suffix ? 'pr-12' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
