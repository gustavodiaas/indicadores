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
  
  const formatDec = (v: number | undefined) => v !== undefined && !isNaN(v) ? v.toFixed(2).replace(".", ",") : "";

  const op1 = prodData.operadoresT1 || 0;
  const op3 = prodData.operadoresT3 || 0;
  const u = prodData.unidade || "peças";

  const colabTxt1 = op1 === 1 ? "colaborador" : "colaboradores";
  const colabTxt3 = op3 === 1 ? "colaborador" : "colaboradores";
  
  const laudo = `No estágio inicial, havia ${op1} ${colabTxt1}, com custo total por mês de ${formatBRL(r.salI)}, ${data.dedicacaoInicial || 100}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${op3} ${colabTxt3}, com custo total por mês de ${formatBRL(r.salF)}, ${data.dedicacaoFinal || 100}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra por ${u}, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses > 0 ? r.paybackMeses.toFixed(2) : "0,00"} ${r.paybackMeses === 1 ? "mês" : "meses"}.`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  const isUnitario = data.modoInsercaoSalario === "unitario";

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">

        {/* Configuração */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Configuração</span>
            <span className="text-sm font-semibold tracking-wide">Modelo de Cálculo</span>
          </div>
          <select 
            className="h-12 bg-slate-50 rounded-xl border-none text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] px-4 cursor-pointer transition-all" 
            value={data.tipoSalario || "bruto"} 
            onChange={e => onChange({ tipoSalario: e.target.value as any })}
          >
            <option value="bruto">Salário Bruto</option>
            <option value="encargos">Salário + Encargos</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* T1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado Inicial (T1)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">
                  {isUnitario ? "Salário Base (Por Operador R$)" : "Salário Base (Total R$)"}
                </label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" 
                  defaultValue={formatDec(data.salarioBaseInicial)} 
                  onBlur={e => onChange({ salarioBaseInicial: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Colaboradores</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm text-slate-400 cursor-not-allowed" value={op1} disabled />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Modo de Inserção</label>
                <select className="w-full h-12 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all px-4 cursor-pointer" value={data.modoInsercaoSalario || "total"} onChange={e => onChange({ modoInsercaoSalario: e.target.value as any })}>
                  <option value="total">Modo: Total da Equipe</option>
                  <option value="unitario">Modo: Por Operador</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Dedicação (%)</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.dedicacaoInicial) || "100,00"} onBlur={e => onChange({ dedicacaoInicial: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
              </div>
            </div>
          </div>

          {/* T3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado Final (T3)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Salário Base</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.salarioBaseFinal)} onBlur={e => onChange({ salarioBaseFinal: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Colaboradores</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm text-slate-400 cursor-not-allowed" value={op3} disabled />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Modo de Inserção</label>
                <select className="w-full h-12 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all px-4 cursor-pointer" value={data.modoInsercaoSalario || "total"} onChange={e => onChange({ modoInsercaoSalario: e.target.value as any })}>
                  <option value="total">Modo: Total da Equipe</option>
                  <option value="unitario">Modo: Por Operador</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Dedicação (%)</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.dedicacaoFinal) || "100,00"} onBlur={e => onChange({ dedicacaoFinal: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
              </div>
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Investimentos</h3>
          <div className="grid grid-cols-2 gap-6">
            <select className="h-12 bg-slate-50 rounded-xl border-none text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all px-4" onChange={e => onChange({ valorConsultoria: Number(e.target.value) })} value={data.valorConsultoria}>
              <option value="0">Selecione o porte da empresa</option>
              <option value={VALORES_CONSULTORIA.micro}>Micro Empresa</option>
              <option value={VALORES_CONSULTORIA.pequena}>Pequena Empresa</option>
              <option value={VALORES_CONSULTORIA.media}>Média Empresa</option>
            </select>
            <input type="text" className="h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.investimentoExtra)} onBlur={e => onChange({ investimentoExtra: parseDecimal(e.target.value) })} placeholder="Investimento Extra (R$)" />
          </div>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="w-[40%] flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Custo Inicial" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Final" value={formatBRL(r.custoF)} />
          <KpiCard label="Redução Mensal" value={formatBRL(r.reducaoMensal)} />
          <KpiCard label="Payback" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} suffix={r.paybackMeses === 1 ? "mês" : "meses"} />
        </div>
        
        <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#0057FF] hover:text-white transition-all shadow-sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-[#0057FF] uppercase mb-3 tracking-widest">Laudo de Payback</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>
        
        <div className="mt-auto min-h-[250px]">
          <ComparisonChart data={chartData} title={`Evolução do Custo por ${u.slice(0, -1)}`} />
        </div>
      </div>
    </div>
  );
}
