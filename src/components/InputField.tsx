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
  // Estado local protege a digitação de decimais (evita que o React apague o ".")
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    // Só atualiza o estado local se o valor numérico for realmente diferente
    if (Number(value) !== Number(localValue?.replace(',', '.'))) {
      setLocalValue(value?.toString() || "");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    // Troca vírgula por ponto automaticamente para evitar erros matemáticos
    onChange(val.replace(',', '.'));
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
