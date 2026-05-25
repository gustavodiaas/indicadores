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
  const chartData = [{ name: "Área (m²)", T1: data.areaT1 || 0, T3: data.areaT3 || 0 }];

  const laudo = `A área ocupada inicial era de ${data.areaT1 || 0}m². Com o novo layout/otimização, reduziu-se para ${data.areaT3 || 0}m², liberando ${r.economiaM2.toFixed(1).replace(".", ",")}m² de área útil (${r.reducaoPercent.toFixed(1).replace(".", ",")}%), gerando uma economia imobiliária mensal de R$ ${r.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      {/* Coluna Esquerda: Cards Modernos */}
      <div className="w-[60%] grid grid-cols-2 gap-6 overflow-y-auto pr-2 pb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T1</h3>
          <InputField label="Área Ocupada" value={data.areaT1} onChange={v => onChange({ areaT1: Number(v) })} suffix="m²" />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T3</h3>
          <InputField label="Área Ocupada" value={data.areaT3} onChange={v => onChange({ areaT3: Number(v) })} suffix="m²" />
        </div>
        
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <InputField label="Valor do Aluguel/m²" value={data.valorAluguel} onChange={v => onChange({ valorAluguel: Number(v) })} suffix="R$/m²" />
        </div>
      </div>

      {/* Coluna Direita: Laudo e Gráfico */}
      <div className="w-[40%] flex flex-col gap-6">
        <KpiCard label="Redução de Área" value={r.reducaoPercent.toFixed(1).replace(".", ",")} suffix="%" trend={r.reducaoPercent} />
        
        <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => {
              navigator.clipboard.writeText(laudo);
              setCopied(true);
              toast.success("Copiado!");
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#0057FF] hover:text-white transition-all"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-[#0057FF] uppercase mb-3 tracking-widest">Impacto em Área</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{laudo}</p>
        </div>

        <div className="mt-auto pt-2 min-h-[250px]">
          <ComparisonChart data={chartData} title="Ocupação de Espaço" />
        </div>
      </div>
    </div>
  );
}
