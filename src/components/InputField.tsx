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

export function InputField({ label, value, onChange, type = "number", suffix, placeholder }: Props) {
  return (
    <div className="input-group">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {suffix && <span className="text-muted-foreground/60">({suffix})</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );
}
