import { type QualidadeData, calcQualidade } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";

interface Props {
  data: QualidadeData;
  onChange: (d: Partial<QualidadeData>) => void;
}

function LocalInputField({ label, value, onChange, type = "number" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all"
      />
    </div>
  );
}

export function QualidadeModule({ data, onChange }: Props) {
  const r = calcQualidade(data);
  const chartData = [{ name: "Índice Boas (%)", T1: Number(r.indiceT1.toFixed(1)), T3: Number(r.indiceT3.toFixed(1)) }];

  const p1Txt = data.perdasT1 === 1 ? "peça não conforme" : "peças não conformes";
  const p3Txt = data.perdasT3 === 1 ? "peça não conforme" : "peças não conformes";

  const laudo = `No estágio inicial, de um total de ${data.quantidadeT1} peças produzidas, identificou-se ${data.perdasT1} ${p1Txt}, resultando em um índice de conformidade de ${r.indiceT1.toFixed(1)}%. Após as melhorias, de um total de ${data.quantidadeT3} peças, identificou-se ${data.perdasT3} ${p3Txt}, elevando o índice para ${r.indiceT3.toFixed(1)}%, representando um aumento de ${r.aumento.toFixed(1)}% na conformidade.`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* COLUNA ESQUERDA: ENTRADA DE DADOS */}
      <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 text-sm uppercase tracking-wide">
            T1 - Inicial
          </h3>
          <LocalInputField label="Qtd Produzida" value={data.quantidadeT1} onChange={v => onChange({ quantidadeT1: Number(v) || 0 })} />
          <LocalInputField label="Perdas (Peças)" value={data.perdasT1} onChange={v => onChange({ perdasT1: Number(v) || 0 })} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 text-sm uppercase tracking-wide">
            T3 - Final
          </h3>
          <LocalInputField label="Qtd Produzida" value={data.quantidadeT3} onChange={v => onChange({ quantidadeT3: Number(v) || 0 })} />
          <LocalInputField label="Perdas (Peças)" value={data.perdasT3} onChange={v => onChange({ perdasT3: Number(v) || 0 })} />
        </div>

      </div>

      {/* COLUNA DIREITA: KPIs E LAUDO (100% ADAPTADOS PARA MODO ESCURO) */}
      <div className="w-full lg:w-[40%] flex flex-col gap-4">
        <KpiCard label="Aumento de Qualidade" value={r.aumento.toFixed(1)} suffix="%" trend={r.aumento} />
        
          <EditableLaudoCard title="Laudo de Qualidade" laudo={laudo} />

        <div className="mt-auto pt-6 min-h-[250px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <ComparisonChart data={chartData} title="Índice de Peças Boas" />
        </div>
      </div>
    </div>
  );
}
