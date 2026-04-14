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
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    // Se for número, compara matematicamente. Se for texto, compara a string exata.
    if (type === "number") {
      if (Number(value) !== Number(localValue?.replace(',', '.'))) {
        setLocalValue(value?.toString() || "");
      }
    } else {
      if (value?.toString() !== localValue) {
        setLocalValue(value?.toString() || "");
      }
    }
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    // Aplica a regra da vírgula APENAS em campos numéricos
    if (type === "number") {
      onChange(val.replace(',', '.'));
    } else {
      onChange(val); // Texto livre, passa a vírgula adiante
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          type={type}
          step={type === "number" ? "any" : undefined}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`h-10 bg-white border-slate-300 text-sm shadow-sm focus-visible:ring-blue-600 ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-xs font-medium text-slate-400 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
