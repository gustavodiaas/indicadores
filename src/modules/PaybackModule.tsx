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
  const r = calcPayback(data, prodData, resumoData);

  const chartData = [
    { name: "Custo/Peça (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) },
    { name: "Folha Total (k)", T1: Number((r.salI / 1000).toFixed(1)), T3: Number((r.salF / 1000).toFixed(1)) },
  ];

  const formatBRL = (val: number) => 
    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePorteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const porte = e.target.value;
    let valor = data.valorConsultoria;
    if (porte === "micro") valor = 15834.40;
    if (porte === "pequena") valor = 21772.30;
    if (porte === "media") valor = 22800.00;
    onChange({ valorConsultoria: valor });
  };

  return (
    <div className="flex gap-8 h-full">
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
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Porte da Empresa</label>
              <select 
                className="h-10 bg-white border border-slate-300 text-sm shadow-sm focus-visible:ring-blue-600 rounded-md px-3 outline-none"
                onChange={handlePorteChange}
                defaultValue=""
              >
                <option value="" disabled>Tabela Padrão...</option>
                <option value="micro">Micro (R$ 15.834,40)</option>
                <option value="pequena">Pequena (R$ 21.772,30)</option>
                <option value="media">Média (R$ 22.800,00)</option>
              </select>
            </div>
            <InputField label="Valor Consultoria (R$)" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) || 0 })} />
            <InputField label="Investimento Extra (R$)" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) || 0 })} />
          </div>
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
        <h3 className="font-semibold text-slate-800 mb-2">Impacto Financeiro</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Custo Unitário T1" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Unitário T3" value={formatBRL(r.custoF)} />
        </div>
        
        <KpiCard label="Redução Mensal" value={formatBRL(r.reducaoMensal)} trend={r.reducaoMensal} />
        <KpiCard label="Retorno (Payback)" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "—"} suffix="meses" />
        
        <div className="mt-4 bg-white p-5 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed text-justify shadow-sm">
          <p className="font-bold text-slate-800 mb-2">Relatório do Indicador:</p>
          <p>
            O retorno do programa foi calculado considerando a redução do custo da mão de obra por kit/peça mensal. 
            No <strong>Estado Inicial (T1)</strong>, a folha total era de <strong>{formatBRL(r.salI)}</strong>. 
            Com produção de <strong>{r.prodMensalI.toLocaleString("pt-BR")} peças/mês</strong>, o custo unitário era <strong>{formatBRL(r.custoI)}</strong>.
          </p>
          <p className="mt-2">
            No <strong>Estado Final (T3)</strong>, a folha passou a ser <strong>{formatBRL(r.salF)}</strong>. 
            Com produção de <strong>{r.prodMensalF.toLocaleString("pt-BR")} peças/mês</strong>, o custo unitário caiu para <strong>{formatBRL(r.custoF)}</strong>.
          </p>
          <p className="mt-2 text-blue-800 bg-blue-50 p-2 rounded border border-blue-100">
            A redução de custo mensal é de <strong>{formatBRL(r.reducaoMensal)}</strong>. Frente ao investimento de <strong>{formatBRL(r.investTotal)}</strong>, o Payback é de <strong>{r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "—"} meses</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
