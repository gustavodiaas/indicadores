import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: PaybackData;
  prodData: ProdutividadeData;
  resumoData: ResumoData;
  onChange: (d: Partial<PaybackData>) => void;
}

const VALORES_CONSULTORIA = {
  micro: 15834.40,
  pequena: 21772.30,
  media: 22800.00,
};

export function PaybackModule({ data, prodData, resumoData, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcPayback(data, prodData, resumoData);

  const chartData = [{ name: "Custo Unitário (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) }];
  const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const op1 = prodData.operadoresT1 || 0;
  const op3 = prodData.operadoresT3 || 0;
  const u = prodData.unidade || "peças";

  const colabTxt1 = op1 === 1 ? "colaborador" : "colaboradores";
  const colabTxt3 = op3 === 1 ? "colaborador" : "colaboradores";
  
  const laudo = `No estágio inicial, havia ${op1} ${colabTxt1}, com custo total por mês de ${formatBRL(r.salI)}, ${data.dedicacaoInicial || 100}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${op3} ${colabTxt3}, com custo total por mês de ${formatBRL(r.salF)}, ${data.dedicacaoFinal || 100}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra por ${u}, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "0.0"} ${r.paybackMeses === 1 ? "mês" : "meses"}.`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">

        <div className="p-5 bg-[#F8FAFC] text-slate-800 rounded-xl flex items-center justify-between shadow-sm mb-2 border border-slate-200">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
              
              <div className="relative group inline-block">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-blue-600 transition-colors" />
                <div className="absolute top-full left-0 mt-2 w-56 p-4 bg-slate-900 text-slate-300 text-[11px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-slate-800 z-[120] font-normal normal-case leading-relaxed">
                  <p>O cálculo de payback e a projeção de produção mensal utilizam o padrão de <b>21 dias úteis</b> por mês.</p>
                  <div className="absolute bottom-full left-4 w-2 h-2 bg-slate-900 rotate-45 -mb-1" />
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold tracking-wide">Modelo de Cálculo</span>
          </div>
          <select 
            className="h-10 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" 
            value={data.tipoSalario || "bruto"} 
            onChange={e => onChange({ tipoSalario: e.target.value as any })}
          >
            <option value="bruto">Salário Bruto</option>
            <option value="encargos">Salário + Encargos</option>
          </select>
        </div>

        <div className="space-y-4 bg-slate-100/50 p-5 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Estado Inicial (T1)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Salário Base (Total R$)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.salarioBaseInicial ? data.salarioBaseInicial.toString().replace(".", ",") : ""} 
                onBlur={e => onChange({ salarioBaseInicial: parseDecimal(e.target.value) })} placeholder="Ex: 87000,00" />
            </div>
            {data.tipoSalario !== "bruto" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Encargos (Mult.)</label>
                <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                  defaultValue={data.encargosInicial ? data.encargosInicial.toString().replace(".", ",") : "1"} 
                  onBlur={e => onChange({ encargosInicial: parseDecimal(e.target.value) || 1 })} placeholder="Ex: 1,9" />
              </div>
            )}
            
            {/* AVISO VISUAL - COLABORADORES T1 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Colaboradores</label>
              <input type="text" 
                className={`w-full h-10 px-3 rounded-lg border font-medium text-sm cursor-not-allowed transition-colors ${op1 === 0 ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" : "bg-slate-100 border-slate-200 text-slate-500"}`} 
                value={op1} disabled 
              />
              {op1 === 0 ? (
                <p className="text-[9px] font-bold text-amber-600 mt-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <AlertTriangle className="w-3 h-3" /> Definir na aba Produtividade
                </p>
              ) : (
                <p className="text-[9px] font-semibold text-slate-400 mt-1.5">Vinculado à Produtividade</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dedicação (%)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.dedicacaoInicial ? data.dedicacaoInicial.toString().replace(".", ",") : "100"} 
                onBlur={e => onChange({ dedicacaoInicial: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-slate-800 border-b border-indigo-200 pb-2">Estado Final (T3)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Salário Base (Total R$)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.salarioBaseFinal ? data.salarioBaseFinal.toString().replace(".", ",") : ""} 
                onBlur={e => onChange({ salarioBaseFinal: parseDecimal(e.target.value) })} placeholder="Ex: 87000,00" />
            </div>
            {data.tipoSalario !== "bruto" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Encargos (Mult.)</label>
                <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                  defaultValue={data.encargosFinal ? data.encargosFinal.toString().replace(".", ",") : "1"} 
                  onBlur={e => onChange({ encargosFinal: parseDecimal(e.target.value) || 1 })} placeholder="Ex: 1,9" />
              </div>
            )}
            
            {/* AVISO VISUAL - COLABORADORES T3 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Colaboradores</label>
              <input type="text" 
                className={`w-full h-10 px-3 rounded-lg border font-medium text-sm cursor-not-allowed transition-colors ${op3 === 0 ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" : "bg-slate-100 border-slate-200 text-slate-500"}`} 
                value={op3} disabled 
              />
              {op3 === 0 ? (
                <p className="text-[9px] font-bold text-amber-600 mt-1.5 flex items-center gap-1 uppercase tracking-
