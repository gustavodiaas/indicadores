import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { Info } from "lucide-react";

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
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-blue-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                O cálculo de payback e a projeção de produção mensal utilizam o padrão de 21 dias úteis por mês.
              </div>
            </div>
          </div>
          <select
            className="h-10 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            value={data.tipoSalario}
            onChange={e => onChange({ tipoSalario: e.target.value as any })}
          >
            <option value="bruto">Salário Bruto</option>
            <option value="encargos">Salário + Encargos</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <InputField label="Salário Base (Total R$)" value={data.salarioBaseInicial} onChange={v => onChange({ salarioBaseInicial: Number(v) })} placeholder="Ex: 87000,00" />
              <span className="absolute -bottom-4 left-0 text-[9px] text-slate-500 italic">*Insira a soma do salário de TODOS os operadores</span>
            </div>
            <div className="relative">
              <InputField label="Colaboradores" value={prodData.operadoresT1} onChange={() => {}} disabled />
              <span className="absolute -bottom-4 left-0 text-[9px] text-slate-400 italic">Vinculado à Produtividade</span>
            </div>
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
            <div className="relative">
              <InputField label="Salário Base (Total R$)" value={data.salarioBaseFinal} onChange={v => onChange({ salarioBaseFinal: Number(v) })} placeholder="Ex: 87000,00" />
              <span className="absolute -bottom-4 left-0 text-[9px] text-slate-500 italic">*Insira a soma do salário de TODOS os operadores</span>
            </div>
            <div className="relative">
              <InputField label="Colaboradores" value={prodData.operadoresT3} onChange={() => {}} disabled />
              <span className="absolute -bottom-4 left-0 text-[9px] text-slate-400 italic">Vinculado à Produtividade</span>
            </div>
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

      <div className="w-[40%] flex flex-col gap-4">
        <KpiCard 
          label="Payback Estimado" 
          value={pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(1) : "0.0"} 
          suffix=" meses"
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
