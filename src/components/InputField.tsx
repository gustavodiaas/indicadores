import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  placeholder?: string;
}

export function InputField({ label, value, onChange, type = "text", suffix, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          // Se tiver sufixo, dá um padding extra na direita para o texto não encavalar
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
