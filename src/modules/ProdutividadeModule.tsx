import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcProdutividade(data);
  const chartData = [{ name: `Produtividade`, T1: Number(r.pphT1.toFixed(2)), T3: Number(r.pphT3.toFixed(2)) }];

  const u = data.unidade || "peças";
  const opTxt1 = data.operadoresT1 === 1 ? "operador" : "operadores";
  const opTxt3 = data.operadoresT3 === 1 ? "operador" : "operadores";

  // TRATAMENTO DE NaN E VÍRGULA
  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/\./g, '').replace(",", ".");
    return Number(cleaned) || 0;
  };

  const laudo = `No estágio inicial, a produtividade era de ${r.pphT1.toFixed(2)} ${u}/h/op, produzindo ${data.volumeT1 || 0} ${u} com ${data.operadoresT1 || 0} ${opTxt1} em ${data.horasT1 || 0}h. Após as melhorias, a produtividade subiu para ${r.pphT3.toFixed(2)} ${u}/h/op, produzindo ${data.volumeT3 || 0} ${u} com ${data.operadoresT3 || 0} ${opTxt3} em ${data.horasT3 || 0}h. Isso representa um ganho direto de ${r.ganho.toFixed(2)}% na eficiência operacional da célula.`;

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        {/* DEFINIÇÃO DA UNIDADE */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
            <span className="text-sm font-semibold tracking-wide">Unidade de Medida</span>
          </div>
          <input 
            type="text" 
            className="h-10 w-40 bg-white border border-slate-200 rounded-lg px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            value={data.unidade}
            onChange={e => onChange({ unidade: e.target.value })}
            placeholder="Ex: peças, kg, m..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4 bg-slate-100/50 p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b pb-2">T1 - Inicial</h3>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Volume ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.volumeT1?.toString().replace(".", ",")} 
                onBlur={e => onChange({ volumeT1: parseDecimal(e.target.value) })} />
              
              <label className="block text-xs font-bold text-slate-500 uppercase">Horas</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.horasT1?.toString().replace(".", ",")} 
                onBlur={e => onChange({ horasT1: parseDecimal(e.target.value) })} />
              
              <label className="block text-xs font-bold text-slate-500 uppercase">Operadores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                value={data.operadoresT1} onChange={e => onChange({ operadoresT1: Number(e.target.value) })} />
            </div>
          </div>

          <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
            <h3 className="font-bold text-slate-800 border-b pb-2">T3 - Final</h3>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Volume ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.volumeT3?.toString().replace(".", ",")} 
                onBlur={e => onChange({ volumeT3: parseDecimal(e.target.value) })} />
              
              <label className="block text-xs font-bold text-slate-500 uppercase">Horas</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.horasT3?.toString().replace(".", ",")} 
                onBlur={e => onChange({ horasT3: parseDecimal(e.target.value) })} />
              
              <label className="block text-xs font-bold text-slate-500 uppercase">Operadores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                value={data.operadoresT3} onChange={e => onChange({ operadoresT3: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4">
        <KpiCard label="Ganho de Produtividade" value={r.ganho.toFixed(2)} suffix="%" trend={r.ganho} />
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-3 tracking-widest">Laudo Operacional</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>
        <div className="mt-auto min-h-[250px]">
          <ComparisonChart data={chartData} title={`Evolução (${u}/h/op)`} />
        </div>
      </div>
    </div>
  );
}
