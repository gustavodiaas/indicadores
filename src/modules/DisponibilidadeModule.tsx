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
  const chartData = [{ name: "Disponibilidade Máquina (%)", T1: Number(r.indT1.toFixed(6)), T3: Number(r.indT3.toFixed(6)) }];

  const u = data.unidadeTempo || "minutos";
  const getUnit = (val: number, unit: string) => {
    if (unit === "segundos") return val === 1 ? "segundo" : "segundos";
    if (unit === "minutos") return val === 1 ? "minuto" : "minutos";
    if (unit === "horas") return val === 1 ? "hora" : "horas";
    return unit;
  };

  const laudo = `A análise de disponibilidade demonstrou que, no estágio inicial, o tempo real de operação era de ${r.realT1} ${getUnit(r.realT1, u)} frente a um tempo disponível de ${r.dispT1} ${getUnit(r.dispT1, u)}. Com a redução das paradas não planejadas, o tempo real subiu para ${r.realT3} ${getUnit(r.realT3, u)}, representando um aumento de ${r.aumento.toFixed(6).replace(".", ",")}% na utilização efetiva do recurso.`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">
        
        {/* Bloco T1 e T3 Modernizados */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T1 (Inicial)</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Tempo Total</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.tempoTotalT1 !== undefined ? data.tempoTotalT1.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ tempoTotalT1: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Paradas Planejadas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.paradasPlanT1 !== undefined ? data.paradasPlanT1.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ paradasPlanT1: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Paradas Não Planejadas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.paradasNaoPlanT1 !== undefined ? data.paradasNaoPlanT1.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ paradasNaoPlanT1: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponibilidade T1</span>
              <span className="text-xl font-black text-[#0057FF]">{r.indT1.toFixed(6).replace(".", ",")} %</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T3 (Final)</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Tempo Total</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.tempoTotalT3 !== undefined ? data.tempoTotalT3.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ tempoTotalT3: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Paradas Planejadas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.paradasPlanT3 !== undefined ? data.paradasPlanT3.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ paradasPlanT3: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Paradas Não Planejadas</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={data.paradasNaoPlanT3 !== undefined ? data.paradasNaoPlanT3.toString().replace(".", ",") : "0"}
                onBlur={e => onChange({ paradasNaoPlanT3: parseDecimal(e.target.value) || 0 })} />
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponibilidade T3</span>
              <span className="text-xl font-black text-[#0057FF]">{r.indT3.toFixed(6).replace(".", ",")} %</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Unidade de Tempo</label>
          <select className="w-full h-12 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all px-4 cursor-pointer" value={u} onChange={e => onChange({ unidadeTempo: e.target.value as any })}>
            <option value="segundos">Segundos</option>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </div>
      </div>

      {/* Coluna Direita: Laudo e Gráfico */}
      <div className="w-[40%] flex flex-col gap-6">
        <KpiCard label="Aumento de Disponibilidade" value={r.aumento.toFixed(6).replace(".", ",")} suffix="%" trend={r.aumento} />
