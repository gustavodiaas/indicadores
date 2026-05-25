import { type LeadTimeData, calcLeadTime } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: LeadTimeData;
  onChange: (d: Partial<LeadTimeData>) => void;
}

export function LeadTimeModule({ data, onChange }: Props) {
  const [copied, setCopied] = useState(false);

  const r = calcLeadTime(data);
  const tI = data.leadTimeT1 || data.tempoT1 || 0;
  const tF = data.leadTimeT3 || data.tempoT3 || 0;

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

  const melhoriasTxt = (data.melhorias || "").trim() || "das melhorias implementadas";
  const reducaoTxt = (data.reducaoObtida || "").trim() || "com a eliminação de desperdícios no fluxo";

  const laudo = `O tempo de atravessamento (lead time) inicial era de ${tI} ${getUnit(tI, uBase)}. Com a implementação ${melhoriasTxt}, o lead time foi reduzido para ${tF} ${getUnit(tF, uBase)}, representando uma redução de ${reducaoPercentual.toFixed(6).replace(".", ", ")}% no tempo total de entrega do produto. Essa evolução foi obtida ${reducaoTxt}.`;

  const chartData = [
    { name: "Tempo", T1: Number(tI.toFixed(6)), T3: Number(tF.toFixed(6)) }
  ];

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex gap-8 h-full animate-in fade-in duration-500">

      {/* LADO ESQUERDO: FORMULÁRIO MODERNO */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">

        {/* Configuração */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuração</span>
            <span className="text-sm font-semibold tracking-wide">Unidade de Tempo</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-12 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between gap-2 outline-none hover:bg-slate-100 transition-all focus:bg-white focus:ring-2 focus:ring-[#0057FF]">
                {uBase === "minutos" ? "Minutos" : uBase === "horas" ? "Horas" : "Dias"}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-48 bg-white border border-slate-100 p-2 rounded-2xl shadow-xl z-[150]">
              <DropdownMenuItem 
                onClick={() => onChange({ unidadeTempo: "minutos" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "minutos" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Minutos
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onChange({ unidadeTempo: "horas" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "horas" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Horas
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onChange({ unidadeTempo: "dias" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "dias" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Dias
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contexto do Laudo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Contexto do Laudo</h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Melhorias Implementadas</label>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
              placeholder="Ex: do mapeamento do fluxo de valor..."
              value={data.melhorias || ""}
              onChange={e => onChange({ melhorias: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Como a redução foi obtida</label>
            <input
              type="text"
              className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
              placeholder="Ex: com a eliminação de filas..."
              value={data.reducaoObtida || ""}
              onChange={e => onChange({ reducaoObtida: e.target.value })}
            />
          </div>
        </div>

        {/* Estados */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T1</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={tI ? tI.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ leadTimeT1: parseDecimal(e.target.value), tempoT1: parseDecimal(e.target.value) })}
                placeholder="Ex: 12" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Estado T3</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all"
                defaultValue={tF ? tF.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ leadTimeT3: parseDecimal(e.target.value), tempoT3: parseDecimal(e.target.value) })}
                placeholder="Ex: 5" />
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: DASHBOARD E LAUDO */}
      <div className="w-[40%] flex flex-col gap-6 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={`Redução (${u})`} value={reducaoAbsoluta.toFixed(6).replace(".", ",")} />
          <KpiCard label="Redução (%)" value={reducaoPercentual.toFixed(6).replace(".", ",")} suffix="%" trend={reducaoPercentual} />
        </div>

        <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => {
              navigator.clipboard.writeText(laudo);
              setCopied(true);
              toast.success("Copiado!");
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#0057FF] hover:text-white transition-all shadow-sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-[#0057FF] uppercase mb-3 tracking-widest">Laudo de Lead Time</h4>
          <p className="text-[13px] text-slate-700 leading-relaxed text-justify">{laudo}</p>
        </div>

        <div className="mt-auto min-h-[250px]">
          <ComparisonChart data={chartData} title={`Evolução do Lead Time (${u})`} />
        </div>
      </div>
    </div>
  );
}
