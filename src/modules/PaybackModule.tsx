import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { CalendarDays } from "lucide-react";

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
        
        {/* CONFIGURAÇÃO */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Configuração</span>
            <span className="text-sm font-bold text-slate-800">Modelo de Cálculo</span>
          </div>
          <div className="flex gap-2">
            {/* SELO DOS 21 DIAS */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-slate-600">21 dias úteis/mês</span>
            </div>
            <select
              className="h-9 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              value={data.tipoSalario}
              onChange={e => onChange({ tipoSalario: e.target.value as any })}
            >
              <option value="bruto">Somente Salário Bruto</option>
              <option value="encargos">Salário + Encargos</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Mão de Obra Total (R$)" value={data.salarioBaseInicial} onChange={v => onChange({ salarioBaseInicial: Number(v) })} />
            <InputField label="Colaboradores" value={prodData.operadoresT1} onChange={() => {}} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Dedicação (%)" value={data.dedicacaoInicial} onChange={v => onChange({ dedicacaoInicial: Number(v) })} />
            {data.tipoSalario === "encargos" && (
              <InputField label="Fator de Encargos" value={data.encargosInicial} onChange={v => onChange({ encargosInicial: Number(v) })} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Mão de Obra Total (R$)" value={data.salarioBaseFinal} onChange={v => onChange({ salarioBaseFinal: Number(v) })} />
            <InputField label="Colaboradores" value={prodData.operadoresT3} onChange={() => {}} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Dedicação (%)" value={data.dedicacaoFinal} onChange={v => onChange({ dedicacaoFinal: Number(v) })} />
            {data.tipoSalario === "encargos" && (
              <InputField label="Fator de Encargos" value={data.encargosFinal} onChange={v => onChange({ encargosFinal: Number(v) })} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Investimento</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Valor da Consultoria (R$)" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) })} />
            <InputField label="Investimentos Extras (R$)" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) })} />
          </div>
        </div>
      </div>

      {/* LADO DIREITO: DASHBOARD */}
      <div className="w-[40%] flex flex-col gap-4">
        <KpiCard 
          label="Payback Estimado" 
          value={pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(1) : "0.0"} 
          suffix={pb.paybackMeses === 1 ? " mês" : " meses"}
          trend={-pb.paybackMeses} 
          reverseTrend
        />

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhamento Mensal</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Custo MOD (T1)</span>
              <span className="font-bold text-slate-700">R$ {pb.custoI.toFixed(2)} / peça</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Custo MOD (T3)</span>
              <span className="font-bold text-emerald-600">R$ {pb.custoF.toFixed(2)} / peça</span>
            </div>
            <div className="pt-2 border-t border-dashed flex justify-between items-center text-sm">
              <span className="font-bold text-slate-700">Ganho Mensal Real</span>
              <span className="font-bold text-blue-600">R$ {pb.reducaoMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
