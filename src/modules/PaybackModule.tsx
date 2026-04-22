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
  
  // Função que força as duas casas decimais como texto
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
            
            {/* LINHA 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {isUnitario ? "Salário Base (Por Operador R$)" : "Salário Base (Total R$)"}
              </label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={formatDec(data.salarioBaseInicial)} 
                onBlur={e => onChange({ salarioBaseInicial: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
            </div>

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

            {/* LINHA 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Modo de Inserção</label>
              <select 
                className="w-full h-10 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" 
                value={data.modoInsercaoSalario || "total"} 
                onChange={e => onChange({ modoInsercaoSalario: e.target.value as any })}
              >
                <option value="total">Modo: Total da Equipe</option>
                <option value="unitario">Modo: Por Operador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dedicação (%)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={formatDec(data.dedicacaoInicial) || "100,00"} 
                onBlur={e => onChange({ dedicacaoInicial: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
            </div>

            {/* LINHA 3 (Condicional) */}
            {data.tipoSalario !== "bruto" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Encargos (Mult.)</label>
                <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                  defaultValue={formatDec(data.encargosInicial) || "1,00"} 
                  onBlur={e => onChange({ encargosInicial: parseDecimal(e.target.value) || 1 })} placeholder="Ex: 1,90" />
              </div>
            )}
            
          </div>
        </div>

        <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-slate-800 border-b border-indigo-200 pb-2">Estado Final (T3)</h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* LINHA 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {isUnitario ? "Salário Base (Por Operador R$)" : "Salário Base (Total R$)"}
              </label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={formatDec(data.salarioBaseFinal)} 
                onBlur={e => onChange({ salarioBaseFinal: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Colaboradores</label>
              <input type="text" 
                className={`w-full h-10 px-3 rounded-lg border font-medium text-sm cursor-not-allowed transition-colors ${op3 === 0 ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" : "bg-slate-100 border-slate-200 text-slate-500"}`} 
                value={op3} disabled 
              />
              {op3 === 0 ? (
                <p className="text-[9px] font-bold text-amber-600 mt-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <AlertTriangle className="w-3 h-3" /> Definir na aba Produtividade
                </p>
              ) : (
                <p className="text-[9px] font-semibold text-slate-400 mt-1.5">Vinculado à Produtividade</p>
              )}
            </div>

            {/* LINHA 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Modo de Inserção</label>
              <select 
                className="w-full h-10 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" 
                value={data.modoInsercaoSalario || "total"} 
                onChange={e => onChange({ modoInsercaoSalario: e.target.value as any })}
              >
                <option value="total">Modo: Total da Equipe</option>
                <option value="unitario">Modo: Por Operador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dedicação (%)</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                defaultValue={formatDec(data.dedicacaoFinal) || "100,00"} 
                onBlur={e => onChange({ dedicacaoFinal: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
            </div>

            {/* LINHA 3 (Condicional) */}
            {data.tipoSalario !== "bruto" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Encargos (Mult.)</label>
                <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" 
                  defaultValue={formatDec(data.encargosFinal) || "1,00"} 
                  onBlur={e => onChange({ encargosFinal: parseDecimal(e.target.value) || 1 })} placeholder="Ex: 1,90" />
              </div>
            )}
            
          </div>
        </div>

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
                defaultValue={formatDec(data.investimentoExtra)} 
                onBlur={e => onChange({ investimentoExtra: parseDecimal(e.target.value) })} placeholder="Ex: 5000,00" />
            </div>
          </div>
        </div>

      </div>

      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-36">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Custo Inicial" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Final" value={formatBRL(r.custoF)} />
          <KpiCard label="Redução Mensal" value={formatBRL(r.reducaoMensal)} />
          <KpiCard label="Payback" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} suffix={r.paybackMeses === 1 ? "mês" : "meses"} />
        </div>
        
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Laudo de Payback</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>
        
        <div className="mt-auto pt-4 min-h-[250px]">
          <ComparisonChart data={chartData} title={`Evolução do Custo por ${u.slice(0, -1)}`} />
        </div>
      </div>

    </div>
  );
}
