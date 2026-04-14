import { type QualidadeData, calcQualidade } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  data: QualidadeData;
  onChange: (d: Partial<QualidadeData>) => void;
}

export function QualidadeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcQualidade(data);
  const chartData = [{ name: "Índice Boas (%)", T1: Number(r.indiceT1.toFixed(1)), T3: Number(r.indiceT3.toFixed(1)) }];

  const p1Txt = data.perdasT1 === 1 ? "peça não conforme" : "peças não conformes";
  const p3Txt = data.perdasT3 === 1 ? "peça não conforme" : "peças não conformes";

  const laudo = `No estágio inicial, de um total de ${data.quantidadeT1} peças produzidas, identificou-se ${data.perdasT1} ${p1Txt}, resultando em um índice de conformidade de ${r.indiceT1.toFixed(1)}%. Após as melhorias, de um total de ${data.quantidadeT3} peças, identificou-se ${data.perdasT3} ${p3Txt}, elevando o índice para ${r.indiceT3.toFixed(1)}%, representando um aumento de ${r.aumento.toFixed(1)}% na conformidade.`;

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto pr-2 pb-10">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">T1 - Inicial</h3>
          <InputField label="Qtd Produzida" value={data.quantidadeT1} onChange={v => onChange({ quantidadeT1: Number(v) })} />
          <InputField label="Perdas (Peças)" value={data.perdasT1} onChange={v => onChange({ perdasT1: Number(v) })} />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">T3 - Final</h3>
          <InputField label="Qtd Produzida" value={data.quantidadeT3} onChange={v => onChange({ quantidadeT3: Number(v) })} />
          <InputField label="Perdas (Peças)" value={data.perdasT3} onChange={v => onChange({ perdasT3: Number(v) })} />
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4">
        <KpiCard label="Aumento de Qualidade" value={r.aumento.toFixed(1)} suffix="%" trend={r.aumento} />
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Laudo de Qualidade</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{laudo}</p>
        </div>
        <div className="mt-auto pt-6 min-h-[250px]">
          <ComparisonChart data={chartData} title="Índice de Peças Boas" />
        </div>
      </div>
    </div>
  );
}
