import { type LeadTimeData, calcLeadTime } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: LeadTimeData;
  onChange: (d: Partial<LeadTimeData>) => void;
}

export function LeadTimeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);

  // Campos locais de contexto — não precisam persistir no store global
  const [melhorias, setMelhorias] = useState("");
  const [descricaoReducao, setDescricaoReducao] = useState("");

  const r = calcLeadTime(data);
  const tI = data.leadTimeT1 || 0;
  const tF = data.leadTimeT3 || 0;

  const reducaoAbsoluta = Math.max(0, tI - tF);
  const reducaoPercentual = tI > 0 ? (reducaoAbsoluta / tI) * 100 : 0;

  const uBase = data.unidadeTempo || "dias";
  const u = uBase;

  const getUnit = (val: number, unit: string) => {
    if (unit === "segundos") return val === 1 ? "segundo" : "segundos";
    if (unit === "minutos") return val === 1 ? "minuto" : "minutos";
    if (unit === "horas") return val === 1 ? "hora" : "horas";
    if (unit === "dias") return val === 1 ? "dia" : "dias";
    return unit;
  };

  // Textos com fallback neutro caso os campos fiquem em branco
  const melhoriasTxt = melhorias.trim() || "das melhorias implementadas";
  const reducaoTxt = descricaoReducao.trim() || "com a eliminação de desperdícios no fluxo";

  const laudo = `O tempo de atravessamento (lead time) inicial era de ${tI} ${getUnit(tI, uBase)}. Com a implementação ${melhoriasTxt}, o lead time foi reduzido para ${tF} ${getUnit(tF, uBase)}, representando uma redução de ${reducaoPercentual.toFixed(2)}% no tempo total de entrega do produto. Essa evolução foi obtida ${reducaoTxt}.\nCálculo: (${tI} - ${tF}) / ${tI > 0 ? tI : 1} × 100 = ${reducaoPercentual.toFixed(2)}%`;

  const chartData = [
    { name: "Tempo", T1: tI, T3: tF }
  ];

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">

      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">

        {/* Unidade de tempo */}
        <div className="p-5 bg-[#F8FAFC] text-slate-800 rounded-xl flex items-center justify-between shadow-sm mb-2 border border-slate-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
            <span className="text-sm font-semibold tracking-wide">Unidade de Tempo</span>
          </div>
          <select
            className="h-10 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
            value={uBase}
            onChange={e => onChange({ unidadeTempo: e.target.value as any })}
          >
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
            <option value="dias">Dias</option>
          </select>
        </div>

        {/* Campos de contexto do laudo */}
        <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-amber-200 pb-2 text-sm">Contexto do Laudo</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
              Melhorias Implementadas
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
              placeholder="Ex: do mapeamento do fluxo de valor e redução de esperas..."
              value={melhorias}
              onChange={e => setMelhorias(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
              Como a redução foi obtida
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
              placeholder="Ex: com a eliminação de filas entre processos e setup reduzido..."
              value={descricaoReducao}
              onChange={e => setDescricaoReducao(e.target.value)}
            />
          </div>
        </div>

        {/* Estado Inicial */}
        <div className="space-y-4 bg-slate-100/50 p-5 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tempo ({u})</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              defaultValue={data.leadTimeT1 ? data.leadTimeT1.toString().replace(".", ",") : ""}
              onBlur={e => onChange({ leadTimeT1: parseDecimal(e.target.value) })}
              placeholder="Ex: 12"
            />
          </div>
        </div>

        {/* Estado Final */}
        <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-slate-800 border-b border-indigo-200 pb-2">Estado Final (T3)</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tempo ({u})</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              defaultValue={data.leadTimeT3 ? data.leadTimeT3.toString().replace(".", ",") : ""}
              onBlur={e => onChange({ leadTimeT3: parseDecimal(e.target.value) })}
              placeholder="Ex: 5"
            />
          </div>
        </div>

      </div>

      {/* LADO DIREITO: DASHBOARD E LAUDO */}
      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-10">

        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={`Redução (${u})`} value={reducaoAbsoluta.toFixed(1)} />
          <KpiCard label="Redução (%)" value={reducaoPercentual.toFixed(1)} suffix="%" trend={reducaoPercentual} />
        </div>

        <div className="relative bg-blue-50/50 p-5 border border-blue-100 rounded-2xl shadow-sm">
          <button
            onClick={() => {
              navigator.clipboard.writeText(laudo);
              setCopied(true);
              toast.success("Copiado!");
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 p-2 rounded-md bg-white text-slate-400 hover:text-blue-600 transition-all shadow-sm border border-slate-100"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-3 tracking-widest">Laudo de Lead Time</h4>
          <p className="text-[13px] text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>

        <div className="mt-auto pt-4 min-h-[250px]">
          <ComparisonChart data={chartData} title={`Evolução do Lead Time (${u})`} />
        </div>

      </div>
    </div>
  );
}
