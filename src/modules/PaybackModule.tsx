import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
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

export function PaybackModule({ data, prodData, resumoData, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const r = calcPayback(data, prodData, resumoData);

  const chartData = [{ name: "Custo/Peça (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) }];
  const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const laudo = `No estágio inicial, havia ${data.colaboradoresInicial} funcionários, com custo total por mês de ${formatBRL(data.salarioBaseInicial * (data.encargosInicial > 10 ? 1 + data.encargosInicial/100 : data.encargosInicial) * data.colaboradoresInicial)}, ${data.dedicacaoInicial}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString()} pçs/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${data.colaboradoresFinal} funcionários, com custo total por mês de ${formatBRL(data.salarioBaseFinal * (data.encargosFinal > 10 ? 1 + data.encargosFinal/100 : data.encargosFinal) * data.colaboradoresFinal)}, ${data.dedicacaoFinal}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString()} pçs/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses.toFixed(1)} meses.`;

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto pr-2 pb-10">
        <div className="col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 uppercase">Modelo de Cálculo</span>
          <select className="h-9 bg-white border border-blue-200 text-xs rounded-md px-2 outline-none" value={data.tipoSalario} onChange={e => onChange({ tipoSalario: e.target.value as any })}>
            <option value="encargos">Salário + Encargos</option>
            <option value="bruto">Salário Bruto</option>
          </select>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Salário Base" value={data.salarioBaseInicial} onChange={v => onChange({ salarioBaseInicial: Number(v) })} />
          {data.tipoSalario !== "bruto" && <InputField label="Encargos" value={data.encargosInicial} onChange={v => onChange({ encargosInicial: Number(v) })} />}
          <InputField label="Colaboradores" value={data.colaboradoresInicial} onChange={v => onChange({ colaboradoresInicial: Number(v) })} />
          <InputField label="Dedicação" value={data.dedicacaoInicial} onChange={v => onChange({ dedicacaoInicial: Number(v) })} suffix="%" />
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Salário Base" value={data.salarioBaseFinal} onChange={v => onChange({ salarioBaseFinal: Number(v) })} />
          {data.tipoSalario !== "bruto" && <InputField label="Encargos" value={data.encargosFinal} onChange={v => onChange({ encargosFinal: Number(v) })} />}
          <InputField label="Colaboradores" value={data.colaboradoresFinal} onChange={v => onChange({ colaboradoresFinal: Number(v) })} />
          <InputField label="Dedicação" value={data.dedicacaoFinal} onChange={v => onChange({ dedicacaoFinal: Number(v) })} suffix="%" />
        </div>
        <div className="col-span-2 space-y-4 pt-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Investimentos</h3>
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Consultoria" value={data.valorConsultoria} onChange={v => onChange({ valorConsultoria: Number(v) })} suffix="R$" />
            <InputField label="Extra" value={data.investimentoExtra} onChange={v => onChange({ investimentoExtra: Number(v) })} suffix="R$" />
          </div>
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Custo T1" value={formatBRL(r.custoI)} />
          <KpiCard label="Payback" value={r.paybackMeses.toFixed(1)} suffix="meses" />
        </div>
        <div className="relative bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <button onClick={() => { navigator.clipboard.writeText(laudo); setCopied(true); toast.success("Copiado!"); setTimeout(() => setCopied(false), 2000); }} className="absolute top-3 right-3 p-2 rounded-md bg-slate-50 text-slate-400 hover:text-blue-600 transition-all">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-3 tracking-widest">Laudo de Payback</h4>
          <p className="text-xs text-slate-600 leading-relaxed text-justify">{laudo}</p>
        </div>
        <div className="mt-auto pt-6 min-h-[250px]">
          <ComparisonChart data={chartData} title="Evolução de Custos" />
        </div>
      </div>
    </div>
  );
}
