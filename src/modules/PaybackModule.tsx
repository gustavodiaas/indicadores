import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: PaybackData;
  prodData: ProdutividadeData;
  resumoData: ResumoData;
  onChange: (d: Partial<PaybackData>) => void;
}

export function PaybackModule({ data, prodData, resumoData, onChange }: Props) {
  // O motor de cálculo real, consumindo Produção, Turnos e Custos
  const r = calcPayback(data, prodData, resumoData);

  // Gráfico executivo: foco na redução do custo da peça e folha
  const chartData = [
    { name: "Custo/Peça (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) },
    { name: "Folha Total (k)", T1: Number((r.salI / 1000).toFixed(1)), T3: Number((r.salF / 1000).toFixed(1)) },
  ];

  const formatBRL = (val: number) => 
    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex gap-8 h-full">
      {/* Formulários Estratégicos */}
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Salário Base (R$)" value={data.salarioBaseInicial} onChange={v => onChange({ salarioBaseInicial: Number(v) || 0 })} />
          <InputField label="Encargos (Mult/%)" value={data.encargosInicial} onChange={v => onChange({ encargosInicial: Number(v) || 0 })} />
          <InputField label="Nº de Colaboradores" value={data.colaboradoresInicial} onChange={v => onChange({ colaboradoresInicial: Number(v) || 0 })} />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Salário Base (R$)" value={data.salarioBaseFinal} onChange={v => onChange({ salarioBaseFinal: Number(v) || 0 })} />
          <InputField label="Encargos (Mult/%)" value={data.encargosFinal} onChange={v => onChange({ encargosFinal: Number(v) || 0 })} />
          <InputField label="Nº de Colaboradores" value={data.colaboradoresFinal} onChange={v => onChange({ colaboradoresFinal: Number(v) || 0 })} />
        </div>

        <div className="col-span-2 space-y-4 pt-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Investimentos</h3>
          <div className="grid grid-cols-2 gap-8">
            <InputField label="Valor Consultoria (R$)" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) || 0 })} />
            <InputField label="Investimento Extra (R$)" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) || 0 })} />
          </div>
        </div>
      </div>

      {/* Dashboard de Impacto */}
      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Impacto Financeiro</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Custo Unitário T1" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Unitário T3" value={formatBRL(r.custoF)} />
        </div>
        
        <KpiCard 
          label="Redução Mensal" 
          value={formatBRL(r.reducaoMensal)} 
          trend={r.reducaoMensal} 
        />
        
        <KpiCard 
          label="Retorno (Payback)" 
          value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "—"} 
          suffix="meses" 
        />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Evolução de Custos" />
        </div>
      </div>
    </div>
  );
}
