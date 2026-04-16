import { type DisponibilidadeData, calcDisponibilidade } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: DisponibilidadeData;
  onChange: (d: Partial<DisponibilidadeData>) => void;
}

export function DisponibilidadeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcDisponibilidade(data);
  const chartData = [{ name: "Disponibilidade Máquina (%)", T1: Number(r.indT1.toFixed(1)), T3: Number(r.indT3.toFixed(1)) }];

  const u = data.unidadeTempo || "minutos";
  const getUnit = (val: number, unit: string) => {
    if (unit === "segundos") return val === 1 ? "segundo" : "segundos";
    if (unit === "minutos") return val === 1 ? "minuto" : "minutos";
    if (unit === "horas") return val === 1 ? "hora" : "horas";
    return unit;
  };

  const laudo = `A análise de disponibilidade demonstrou que, no estágio inicial, o tempo real de operação era de ${r.realT1} ${getUnit(r.realT1, u)} frente a um tempo disponível de ${r.dispT1} ${getUnit(r.dispT1, u)}. Com a redução das paradas não planejadas, o tempo real subiu para ${r.realT3} ${getUnit(r.realT3, u)}, representando um aumento de ${r.aumento.toFixed(2)}% na utilização efetiva do recurso.`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start overflow-y-auto pr-2 pb-36">
        
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">T1 - Inicial</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tempo Total</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.tempoTotalT1 !== undefined ? data.tempoTotalT1.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ tempoTotalT1: parseDecimal(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Paradas Planejadas</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.paradasPlanT1 !== undefined ? data.paradasPlanT1.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ paradasPlanT1: parseDecimal(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Paradas Não Planejadas</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.paradasNaoPlanT1 !== undefined ? data.paradasNaoPlanT1.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ paradasNaoPlanT1: parseDecimal(e.target.value) || 0 })} />
          </div>
          
          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-500 mb-1">Disponibilidade T1</span>
            <span className="text-lg font-black text-slate-800">{r.indT1.toFixed(2).replace(".", ",")} %</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">T3 - Final</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tempo Total</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.tempoTotalT3 !== undefined ? data.tempoTotalT3.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ tempoTotalT3: parseDecimal(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Paradas Planejadas</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.paradasPlanT3 !== undefined ? data.paradasPlanT3.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ paradasPlanT3: parseDecimal(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Paradas Não Planejadas</label>
            <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              defaultValue={data.paradasNaoPlanT3 !== undefined ? data.paradasNaoPlanT3.toString().replace(".", ",") : "0"}
              onBlur={e => onChange({ paradasNaoPlanT3: parseDecimal(e.target.value) || 0 })} />
          </div>

          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-500 mb-1">Disponibilidade T3</span>
            <span className="text-lg font-black text-slate-800">{r.indT3.toFixed(2).replace(".", ",")} %</span>
          </div>
        </div>

        <div className="col-span-2 p-5 bg-[#F8FAFC] rounded-xl border border-slate-200">
           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unidade de Tempo</label>
           <select className="w-full h-10 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors px-3 cursor-pointer" value={u} onChange={e => onChange({ unidadeTempo: e.target.value as any })}>
             <option value="segundos">Segundos</option>
             <option value="minutos">Minutos</option>
             <option value="horas">Horas</option>
           </select>
        </div>

      </div>

      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-36">
        <KpiCard label="Aumento de Disponibilidade" value={r.aumento.toFixed(1)} suffix="%" trend={r.aumento} />
        
        <div className="relative bg-blue-50/50 p-5 border border-blue-100 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-white text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-3 tracking-widest">Laudo de Disponibilidade</h4>
          <p className="text-[13px] text-slate-700 leading-relaxed text-justify">{laudo}</p>
        </div>

        <div className="mt-auto min-h-[200px]">
          <ComparisonChart data={chartData} title="Evolução da Disponibilidade" />
        </div>
      </div>
    </div>
  );
}
