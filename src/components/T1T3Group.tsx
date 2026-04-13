import { InputField } from "./InputField";

interface Props {
  label: string;
  t1: number;
  t3: number;
  onT1: (v: number) => void;
  onT3: (v: number) => void;
  suffix?: string;
}

export function T1T3Group({ label, t1, t3, onT1, onT3, suffix }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <InputField label={`${label} (T1)`} value={t1} onChange={v => onT1(Number(v) || 0)} suffix={suffix} />
      <InputField label={`${label} (T3)`} value={t3} onChange={v => onT3(Number(v) || 0)} suffix={suffix} />
    </div>
  );
}
