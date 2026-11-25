import { blankZero } from "@/lib/number-input";
import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";
import { buildLaudoProdutividade } from "@/lib/laudos";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const r = calcProdutividade(data);
  const chartData = [{ name: `Produtividade`, T1: Number(r.pphT1.toFixed(6)), T3: Number(r.pphT3.toFixed(6)) }];

  const u = data.unidade || "peças";

  const parseDecimal = (val: string) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/\./g, '').replace(",", ".");
    const parsed = Number(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const laudo = buildLaudoProdutividade(data);

  return (
    <div className="analysis-layout">
      <div className="analysis-inputs flex flex-col gap-6">

        <div className="input-section  flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">Medidor de Produtividade</span>
              <Tooltip delayDuration={180}>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="Informações sobre o cálculo" className="shrink-0 text-slate-400 dark:text-slate-500 cursor-help hover:text-[#1E3A8A] dark:hover:text-[#93C5FD]">
                    <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Calculado com 21 dias úteis</TooltipContent>
              </Tooltip>
          </div>
          <input
            type="text"
            className="h-10 w-40 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white rounded-xl border border-transparent dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all px-4"
            value={data.unidade}
            onChange={e => onChange({ unidade: e.target.value })}
            placeholder="Ex: peças, kg..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="input-section  space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">
              T1 - Inicial
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Volume ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                defaultValue={blankZero(data.volumeT1)}
                onBlur={e => onChange({ volumeT1: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Horas</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                defaultValue={blankZero(data.horasT1)}
                onBlur={e => onChange({ horasT1: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Operadores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                value={data.operadoresT1 || ""} onChange={e => onChange({ operadoresT1: Number(e.target.value) })} />
            </div>
          </div>

          <div className="input-section  space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">
              T3 - Final
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Volume ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                defaultValue={blankZero(data.volumeT3)}
                onBlur={e => onChange({ volumeT3: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Horas</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                defaultValue={blankZero(data.horasT3)}
                onBlur={e => onChange({ horasT3: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Operadores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all"
                value={data.operadoresT3 || ""} onChange={e => onChange({ operadoresT3: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>

      <div className="analysis-results">
        <KpiCard label="Ganho de Produtividade" value={r.ganho.toFixed(6).replace(".", ",")} suffix="%" trend={r.ganho} />

        <EditableLaudoCard title="Laudo Operacional" laudo={laudo} override={data.laudoEditado ?? null} onOverrideChange={v => onChange({ laudoEditado: v })} />

        <div className="analysis-chart">
          <ComparisonChart data={chartData} title={`Evolução (${u}/h/op)`} />
        </div>
      </div>
    </div>
  );
}
