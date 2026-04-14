import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
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

  const chartData = [{ name: "Custo/Peça (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) }];
  const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // TEXTO ORIGINAL RESTAURADO
  const laudo = `No estágio inicial, havia ${data.colaboradoresInicial || 0} funcionários, com custo total por mês de ${formatBRL(r.salI)}, ${data.dedicacaoInicial || 100}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString("pt-BR")} pçs/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${data.colaboradoresFinal || 0} funcionários, com custo total por mês de ${formatBRL(r.salF)}, ${data.dedicacaoFinal || 100}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString("pt-BR")} pçs/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "0.0"} meses.`;

  // Função blindada para aceitar vírgula sem quebrar
  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">

        {/* CONTROLE DE SALÁRIO GERAL */}
        <div className="p-4 bg-slate-800 text-white rounded-xl flex items-center justify-between shadow-md">
          <span className="text-xs font-bold uppercase tracking-widest">Modelo de Cálculo</span>
          <select 
            className="h-9 bg-slate-700 border border-slate-600 text-xs rounded-md px-3 outline-none focus:ring-2 focus:ring-blue-500" 
            value={data.tipoSalario || "encargos"} 
            onChange={e => onChange({ tipoSalario: e.target.value as any })}
          >
            <option value="encargos">Salário + Encargos</option>
            <option value="bruto">Salário Bruto</option>
          </select>
        </div>

        {/* T1 - INICIAL */}
        <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
          <h3 className="font-bold text-slate-800 border-b border-blue-200 pb-2">Estado Inicial (T1)</h3>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Colaboradores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                value={data.colaboradoresInicial || ""} 
                onChange={e => onChange({ colaboradoresInicial: Number(e.target.value) })} placeholder="Ex: 18" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dedicação (%)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.dedicacaoInicial ? data.dedicacaoInicial.toString().replace(".", ",") : "100"} 
                onBlur={e => onChange({ dedicacaoInicial: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100" />
            </div>
          </div>
        </div>

        {/* T3 - FINAL */}
        <div className="space-y-4 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
          <h3 className="font-bold text-slate-800 border-b border-emerald-200 pb-2">Estado Final (T3)</h3>
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
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Colaboradores</label>
              <input type="number" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                value={data.colaboradoresFinal || ""} 
                onChange={e => onChange({ colaboradoresFinal: Number(e.target.value) })} placeholder="Ex: 18" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dedicação (%)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.dedicacaoFinal ? data.dedicacaoFinal.toString().replace(".", ",") : "100"} 
                onBlur={e => onChange({ dedicacaoFinal: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100" />
            </div>
          </div>
        </div>

       {/* INVESTIMENTOS */}
        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Investimentos</h3>
          <div className="grid grid-cols-2 gap-6">
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Porte da Empresa (Consultoria)</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none"
                  onChange={e => onChange({ valorConsultoria: Number(e.target.value) })}
                  value={data.valorConsultoria}
                >
                  <option value="0">Selecione o porte</option>
                  <option value={VALORES_CONSULTORIA.micro}>Micro Empresa</option>
                  <option value={VALORES_CONSULTORIA.pequena}>Pequena Empresa</option>
                  <option value={VALORES_CONSULTORIA.media}>Média Empresa</option>
                </select>
              </div>
              
              {/* DISPLAY COM O VALOR DA CONSULTORIA */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Valor do porte (R$)</label>
                <div className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-200/50 flex items-center text-slate-700 text-sm font-semibold">
                  {formatBRL(data.valorConsultoria || 0)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Investimento Extra (R$)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={data.investimentoExtra ? data.investimentoExtra.toString().replace(".", ",") : ""} 
                onBlur={e => onChange({ investimentoExtra: parseDecimal(e.target.value) })} placeholder="Ex: 5000,00" />
            </div>

          </div>
        </div>

      </div>

      {/* LADO DIREITO: DASHBOARD E LAUDO */}
      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Custo Inicial" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Final" value={formatBRL(r.custoF)} />
          <KpiCard label="Redução Mensal" value={formatBRL(r.reducaoMensal)} />
          <KpiCard label="Payback" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(2) : "0.00"} suffix="meses" />
        </div>
        
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Laudo de Payback</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>
        
        <div className="mt-auto pt-4 min-h-[250px]">
          <ComparisonChart data={chartData} title="Evolução do Custo por Peça" />
        </div>
      </div>

    </div>
  );
}
