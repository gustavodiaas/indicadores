import { type PaybackData, type ProdutividadeData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: PaybackData;
  prodData: ProdutividadeData;
  onChange: (d: Partial<PaybackData>) => void;
}

export function PaybackModule({ data, prodData, onChange }: Props) {
  const r = calcPayback(data, prodData);
  const reducaoColabs = prodData.operadoresT1 - prodData.operadoresT3;

  const chartData = [
    { name: "Operadores", T1: prodData.operadoresT1, T3: prodData.operadoresT3 },
    { name: "Custo Mensal (k)", T1: +(prodData.operadoresT1 * r.custoColab / 1000).toFixed(1), T3: +(prodData.operadoresT3 * r.custoColab / 1000).toFixed(1) },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Payback</h3>
        <InputField label="Salário Base" value={data.salarioBase} onChange={v => onChange({ salarioBase: Number(v) || 0 })} suffix="R$" />
        <InputField label="Encargos (multiplicador)" value={data.encargosMultiplicador} onChange={v => onChange({ encargosMultiplicador: Number(v) || 0 })} />
        <InputField label="Nº de Colaboradores Reduzidos" value={reducaoColabs} onChange={() => {}} suffix="do módulo Produtividade" />
        <InputField label="Valor da Consultoria" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) || 0 })} suffix="R$" />
        <InputField label="Investimento Extra" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) || 0 })} suffix="R$" />
        <p className="text-xs text-muted-foreground">* A redução de colaboradores vem do módulo Produtividade (T1 - T3 operadores).</p>
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Custo por Colaborador" value={`R$ ${r.custoColab.toLocaleString("pt-BR")}`} />
        <KpiCard label="Redução Mensal" value={`R$ ${r.reducaoMensal.toLocaleString("pt-BR")}`} trend={r.reducaoMensal} />
        <KpiCard label="Investimento Total" value={`R$ ${r.investTotal.toLocaleString("pt-BR")}`} />
        <KpiCard label="Payback" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(1) : "—"} suffix="meses" />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
