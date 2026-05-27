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
  // Se for 0, inicia como string vazia para o input não mostrar o zero
  const [localValue, setLocalValue] = useState(value === 0 ? "" : (value?.toString() || ""));

  useEffect(() => {
    // Atualiza apenas se o valor novo for diferente do que está no input
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
          className="h-12 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border-none shadow-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#0057FF] transition-all"
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
