import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";
import { Info } from "lucide-react";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const r = calcProdutividade(data);
  const chartData = [{ name: `Produtividade`, T1: Number(r.pphT1.toFixed(6)), T3: Number(r.pphT3.toFixed(6)) }];

  const u = data.unidade || "peças";
  const opTxt1 = data.operadoresT1 === 1 ? "operador" : "operadores";
  const opTxt3 = data.operadoresT3 === 1 ? "operador" : "operadores";

  const parseDecimal = (val: string) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/\./g, '').replace(",", ".");
    const parsed = Number(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const laudo = `No estágio inicial, a produtividade era de ${r.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op, produzindo ${data.volumeT1 || 0} ${u} com ${data.operadoresT1 || 0} ${opTxt1} em ${data.horasT1 || 0}h. Após as melhorias, a produtividade subiu para ${r.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, produzindo ${data.volumeT3 || 0} ${u} com ${data.operadoresT3 || 0} ${opTxt3} em ${data.horasT3 || 0}h. Isso representa um ganho direto de ${r.ganho.toFixed(6).replace(".", ",")}% na eficiência operacional da célula.`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Calculado com 21 dias úteis</span>
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help hover:text-[#0057FF]"/>
            </div>
            <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">Medidor de Produtividade</span>
          </div>
          <input 
            type="text" 
            className="h-12 w-40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl border border-transparent dark:border-slate-800/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0057FF] transition-all px-4"
            value={data.unidade}
            onChange={e => onChange({ unidade: e.target.value })}
            placeholder="Ex: peças, kg..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
              T1 - Inicial
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Volume ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                defaultValue={data.volumeT1?.toString().replace(".", ",")} 
                onBlur={e => onChange({ volumeT1: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Horas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                defaultValue={data.horasT1?.toString().replace(".", ",")} 
                onBlur={e => onChange({ horasT1: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Operadores</label>
              <input type="number" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                value={data.operadoresT1 ?? ""} onChange={e => onChange({ operadoresT1: Number(e.target.value) })} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
              T3 - Final
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Volume ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                defaultValue={data.volumeT3?.toString().replace(".", ",")} 
                onBlur={e => onChange({ volumeT3: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Horas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                defaultValue={data.horasT3?.toString().replace(".", ",")} 
                onBlur={e => onChange({ horasT3: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Operadores</label>
              <input type="number" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                value={data.operadoresT3 ?? ""} onChange={e => onChange({ operadoresT3: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        <KpiCard label="Ganho de Produtividade" value={r.ganho.toFixed(6).replace(".", ",")} suffix="%" trend={r.ganho} />
        
        <EditableLaudoCard title="Laudo Operacional" laudo={laudo} />
        
        <div className="mt-auto min-h-[250px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <ComparisonChart data={chartData} title={`Evolução (${u}/h/op)`} />
        </div>
      </div>
    </div>
  );
}
