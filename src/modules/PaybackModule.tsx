import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { CalendarDays, Info } from "lucide-react";

interface Props {
  data: PaybackData;
  prodData: ProdutividadeData;
  resumoData: ResumoData;
  onChange: (d: Partial<PaybackData>) => void;
}

export function PaybackModule({ data, prodData, resumoData, onChange }: Props) {
  const pb = calcPayback(data, prodData, resumoData);

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      
      {/* LADO ESQUERDO: INPUTS */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        {/* CONFIGURAÇÃO COM CAMPO TRAVADO */}
        <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
              <h3 className="text-sm font-bold text-slate-800">Modelo de Cálculo</h3>
            </div>
            
            <div className="flex gap-3">
              {/* CAMPO TRAVADO (21 DIAS) */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-200/50 border border-slate-300 rounded-lg select-none cursor-not-allowed">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-600">21 dias úteis/mês</span>
              </div>

              <select
                className="h-10 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                value={data.tipoSalario}
                onChange={e => onChange({ tipoSalario: e.target.value as any })}
              >
                <option value="bruto">Somente Salário Bruto</option>
                <option value="encargos">Salário + Encargos</option>
              </select>
            </div>
          </div>
        </div>

        {/* ESTADO INICIAL (T1) */}
        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Estado Inicial (T1)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <InputField 
              label="Mão de Obra Total (R$)" 
              value={data.salarioBaseInicial} 
              onChange={v => onChange({ salarioBaseInicial: Number(v) })} 
              placeholder="Ex: 87000,00"
            />
            <div className="relative">
              <InputField label="Colaboradores" value={prodData.operadoresT1} onChange={() => {}} disabled />
              <span className="absolute -bottom-5 left-0 text-[9px] text-slate-400 font-medium italic">Vinculado à Produtividade</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField 
              label="Dedicação ao Processo (%)" 
              value={data.dedicacaoInicial} 
              onChange={v => onChange({ dedicacaoInicial: Number(v) })} 
              type="number"
            />
            {data.tipoSalario === "encargos" && (
              <InputField 
                label="Fator de Encargos (Ex: 1.9)" 
                value={data.encargosInicial} 
                onChange={v => onChange({ encargosInicial: Number(v) })} 
              />
            )}
          </div>
        </div>

        {/* ESTADO FINAL (T3) */}
        <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100 space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h3 className="font-bold text-indigo-900 uppercase text-xs tracking-wider">Estado Final (T3)</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField 
              label="Mão de Obra Total (R$)" 
              value={data.salarioBaseFinal} 
              onChange={v => onChange({ salarioBaseFinal: Number(v) })} 
              placeholder="Ex: 87000,00"
            />
            <div className="relative">
              <InputField label="Colaboradores" value={prodData.operadoresT3} onChange={() => {}} disabled />
              <span className="absolute -bottom-5 left-0 text-[9px] text-slate-400 font-medium italic">Vinculado à Produtividade</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField 
              label="Dedicação ao Processo (%)" 
              value={data.dedicacaoFinal} 
              onChange={v => onChange({ dedicacaoFinal: Number(v) })} 
              type="number"
            />
            {data.tipoSalario === "encargos" && (
              <InputField 
                label="Fator de Encargos (Ex: 1.9)" 
                value={data.encargosFinal} 
                onChange={v => onChange({ encargosFinal: Number(v) })} 
              />
            )}
          </div>
        </div>

        {/* INVESTIMENTO */}
        <div className="p-6 bg-amber-50/30 rounded-2xl border border-amber-100 space-y-4">
          <h3 className="font-bold text-amber-900 uppercase text-xs tracking-wider border-b border-amber-100 pb-3">Investimento</h3>
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Valor da Consultoria (R$)" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) })} />
            <InputField label="Investimentos Extras (R$)" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) })} />
          </div>
        </div>
      </div>

      {/* LADO DIREITO: DASHBOARD */}
      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-10">
        <div className="grid grid-cols-1 gap-4">
          <KpiCard 
            label="Payback Estimado" 
            value={pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(1) : "0.0"} 
            suffix={pb.paybackMeses === 1 ? " mês" : " meses"}
            trend={-pb.paybackMeses} 
            reverseTrend
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhamento Mensal</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Custo MOD (T1)</span>
              <span className="text-sm font-bold text-slate-700">R$ {pb.custoI.toFixed(2)} / peça</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Custo MOD (T3)</span>
              <span className="text-sm font-bold text-emerald-600">R$ {pb.custoF.toFixed(2)} / peça</span>
            </div>
            <div className="pt-2 border-t border-dashed flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Ganho Mensal Real</span>
              <span className="text-sm font-bold text-blue-600">R$ {pb.reducaoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 opacity-80" />
            <div>
              <p className="text-[11px] font-medium leading-relaxed opacity-90">
                O ganho é calculado sobre a diferença do custo de mão de obra unitário entre T1 e T3, multiplicado pela nova capacidade produtiva mensal (21 dias).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
