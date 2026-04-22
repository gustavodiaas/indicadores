import { type MovimentacaoData, calcMovimentacao } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: MovimentacaoData;
  onChange: (d: Partial<MovimentacaoData>) => void;
}

export function MovimentacaoModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);

  const r = calcMovimentacao(data);

  const chartData = [
    { name: "Distância (m)", T1: Number((data.distanciaT1 || 0).toFixed(6)), T3: Number((data.distanciaT3 || 0).toFixed(6)) },
    { name: "Tempo", T1: Number((data.tempoT1 || 0).toFixed(6)), T3: Number((data.tempoT3 || 0).toFixed(6)) },
  ];

  const dI = data.distanciaT1 || 0;
  const dF = data.distanciaT3 || 0;
  const tI = data.tempoT1 || 0;
  const tF = data.tempoT3 || 0;
  
  const redD = r.reducaoDist.toFixed(6).replace(".", ",");
  const redT = r.reducaoTempo.toFixed(6).replace(".", ",");

  const uBase = data.unidadeTempo || "minutos";
  const u = uBase;

  const getUnit = (val: number, unit: string) => {
    if (unit === "segundos") return val === 1 ? "segundo" : "segundos";
    if (unit === "minutos") return val === 1 ? "minuto" : "minutos";
    if (unit === "horas") return val === 1 ? "hora" : "horas";
    return unit;
  };

  const ferramentaTxt = (data.ferramentaUtilizada || "").trim() || "da ferramenta aplicada";
  const descricaoTxt = (data.acaoMelhoria || "").trim() || "com as melhorias realizadas";

  const formatDec = (val: number) => val.toString().replace(".", ",");

  const laudo = `Por intermédio ${ferramentaTxt} foi realizado ${descricaoTxt}.\n\nDistância: A medição inicial de movimentação/transporte era de ${formatDec(dI)}m (ida e volta), onde foi reduzido para ${formatDec(dF)}m (ida e volta), representando redução de ${redD}% em distância.\nCálculo Distância: (${formatDec(dI)} - ${formatDec(dF)}) / ${dI > 0 ? formatDec(dI) : 1} × 100 = ${redD}%\n\nTempo: O tempo de movimentação era de ${formatDec(tI)} ${getUnit(tI, uBase)}, onde foi reduzido para ${formatDec(tF)} ${getUnit(tF, uBase)}, representando redução de ${redT}% em tempo ${descricaoTxt}.\nCálculo Tempo: (${formatDec(tI)} - ${formatDec(tF)}) / ${tI > 0 ? formatDec(tI) : 1} × 100 = ${redT}%`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, "");
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">

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
            <option value="segundos">Segundos</option>
            <option value="minutos">Minutos</option>
            <option value="horas">Horas</option>
          </select>
        </div>

        <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-amber-200 pb-2 text-sm">Contexto do Laudo</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
              Ferramenta Utilizada
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
              placeholder="Ex: da ferramenta 5S, do Kaizen, do layout celular..."
              value={data.ferramentaUtilizada || ""}
              onChange={e => onChange({ ferramentaUtilizada: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
              Ação / Melhoria Realizada
            </label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
              placeholder="Ex: a reorganização do layout da célula produtiva..."
              value={data.acaoMelhoria || ""}
              onChange={e => onChange({ acaoMelhoria: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4 bg-slate-100/50 p-5 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Estado Inicial (T1)</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Distância Inicial (m)</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                defaultValue={data.distanciaT1 ? data.distanciaT1.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ distanciaT1: parseDecimal(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tempo Inicial ({u})</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                defaultValue={data.tempoT1 ? data.tempoT1.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ tempoT1: parseDecimal(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-slate-800 border-b border-indigo-200 pb-2">Estado Final (T3)</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Distância Final (m)</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                defaultValue={data.distanciaT3 ? data.distanciaT3.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ distanciaT3: parseDecimal(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tempo Final ({u})</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                defaultValue={data.tempoT3 ? data.tempoT3.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ tempoT3: parseDecimal(e.target.value) })}
              />
            </div>
          </div>
        </div>

      </div>

      <div className="w-[40%] flex flex-col gap-4 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Redução de Distância" value={redD} suffix="%" trend={r.reducaoDist} />
          <KpiCard label={`Redução de Tempo (${u})`} value={redT} suffix="%" trend={r.reducaoTempo} />
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
          <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-3 tracking-widest">Laudo de Movimentação</h4>
          <p className="text-[13px] text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">{laudo}</p>
        </div>

        <div className="flex-1 mt-2 min-h-[200px]">
          <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
        </div>
      </div>
    </div>
  );
}
