import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcProdutividade(data);
  const chartData = [{ name: "Peças/h/op", T1: Number(r.pphT1.toFixed(2)), T3: Number(r.pphT3.toFixed(2)) }];

  const laudo = `No estágio inicial, a produtividade era de ${r.pphT1.toFixed(2)} pçs/h/op, produzindo ${data.volumeT1} peças com ${data.operadoresT1} operadores em ${data.horasT1}h. Após as melhorias, a produtividade subiu para ${r.pphT3.toFixed(2)} pçs/h/op. Isso representa um ganho direto de ${r.ganho.toFixed(2)}% na eficiência operacional da célula.`;

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto pr-2 pb-10">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">T1 - Inicial</h3>
          <InputField label="Volume" value={data.volumeT1} onChange={v => onChange({ volumeT1: Number(v) })} />
          <InputField label="Horas" value={data.horasT1} onChange={v => onChange({ horasT1: Number(v) })} />
          <InputField label="Operadores" value={data.operadoresT1} onChange={v => onChange({ operadoresT1: Number(v) })} />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">T3 - Final</h3>
          <InputField label="Volume" value={data.volumeT3} onChange={v => onChange({ volumeT3: Number(v) })} />
          <InputField label="Horas" value={data.horasT3} onChange={v => onChange({ horasT3: Number(v) })} />
          <InputField label="Operadores" value={data.operadoresT3} onChange={v => onChange({ operadoresT3: Number(v) })} />
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto">
        <KpiCard label="Ganho de Produtividade" value={r.ganho.toFixed(2)} suffix="%" trend={r.ganho} />
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-3 tracking-widest">Laudo Operacional</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{laudo}</p>
        </div>
        <div className="mt-auto pt-6 min-h-[250px]">
          <ComparisonChart data={chartData} title="Evolução da Eficiência" />
        </div>
      </div>
    </div>
  );
}
