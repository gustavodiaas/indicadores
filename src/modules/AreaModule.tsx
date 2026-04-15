import { type AreaData, calcArea } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: AreaData;
  onChange: (d: Partial<AreaData>) => void;
}

export function AreaModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcArea(data);
  const chartData = [{ name: "Área (m²)", T1: data.areaT1, T3: data.areaT3 }];

  const laudo = `A área ocupada inicial era de ${data.areaT1}m². Com o novo layout/otimização, reduziu-se para ${data.areaT3}m², liberando ${r.economiaM2.toFixed(1)}m² de área útil (${r.reducaoPercent.toFixed(1)}% de redução), gerando uma economia imobiliária mensal de R$ ${r.economiaMensal.toLocaleString("pt-BR")}.`;

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto pr-2">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado T1</h3>
          <InputField label="Área Ocupada" value={data.areaT1} onChange={v => onChange({ areaT1: Number(v) })} suffix="m²" />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado T3</h3>
          <InputField label="Área Ocupada" value={data.areaT3} onChange={v => onChange({ areaT3: Number(v) })} suffix="m²" />
        </div>
        <div className="col-span-2">
          <InputField label="Valor do Aluguel/m²" value={data.valorAluguel} onChange={v => onChange({ valorAluguel: Number(v) })} suffix="R$/m²" />
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4">
        <KpiCard label="Redução de Área" value={r.reducaoPercent.toFixed(1)} suffix="%" trend={r.reducaoPercent} />
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => {
              navigator.clipboard.writeText(laudo);
              setCopied(true);
              toast.success("Copiado!");
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-slate-800 uppercase mb-3 tracking-widest">Impacto em Área</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{laudo}</p>
        </div>
        <div className="mt-auto pt-6 min-h-[250px]">
          <ComparisonChart data={chartData} title="Ocupação de Espaço" />
        </div>
      </div>
    </div>
  );
}
