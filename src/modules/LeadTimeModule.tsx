import { type LeadTimeData, calcLeadTime } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { ChevronDown } from "lucide-react";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: LeadTimeData;
  onChange: (d: Partial<LeadTimeData>) => void;
}

export function LeadTimeModule({ data, onChange }: Props) {

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

  const laudo = `O tempo de atravessamento (lead time) inicial era de ${tI} ${getUnit(tI, uBase)}. Com a implementação ${melhoriasTxt}, o lead time foi reduzido para ${tF} ${getUnit(tF, uBase)}, representando uma redução de ${reducaoPercentual.toFixed(6).replace(".", ",")}% no tempo total de entrega do produto. Essa evolução foi obtida ${reducaoTxt}.`;

  const chartData = [
    { name: "Tempo", T1: Number(tI.toFixed(6)), T3: Number(tF.toFixed(6)) }
  ];

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in duration-500">

      {/* LADO ESQUERDO: FORMULÁRIO MODERNO */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">

        {/* Configuração */}
        <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Configuração</span>
            <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">Unidade de Tempo</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 outline-none hover:bg-slate-100 dark:hover:bg-[#001833] transition-all focus:ring-2 focus:ring-[#FF6B00] border border-transparent dark:border-white/10">
                {uBase === "minutos" ? "Minutos" : uBase === "horas" ? "Horas" : "Dias"}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-2 rounded-lg shadow-md z-[150]">
              <DropdownMenuItem
                onClick={() => onChange({ unidadeTempo: "minutos" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "minutos" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                Minutos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onChange({ unidadeTempo: "horas" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "horas" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                Horas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onChange({ unidadeTempo: "dias" })}
                className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${
                  uBase === "dias" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                Dias
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contexto do Laudo */}
        <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">Contexto do Laudo</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Melhorias Implementadas</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-transparent dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
              placeholder="Ex: do mapeamento do fluxo de valor..."
              value={data.melhorias || ""}
              onChange={e => onChange({ melhorias: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Como a redução foi obtida</label>
            <input
              type="text"
              className="w-full h-10 px-3 rounded-lg border border-transparent dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
              placeholder="Ex: com a eliminação de filas..."
              value={data.reducaoObtida || ""}
              onChange={e => onChange({ reducaoObtida: e.target.value })}
            />
          </div>
        </div>

        {/* Estados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">Estado T1</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-transparent dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                defaultValue={tI ? tI.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ leadTimeT1: parseDecimal(e.target.value), tempoT1: parseDecimal(e.target.value) })}
                placeholder="Ex: 12" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">Estado T3</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-10 px-3 rounded-lg border border-transparent dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                defaultValue={tF ? tF.toString().replace(".", ",") : ""}
                onBlur={e => onChange({ leadTimeT3: parseDecimal(e.target.value), tempoT3: parseDecimal(e.target.value) })}
                placeholder="Ex: 5" />
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: DASHBOARD E LAUDO */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={`Redução (${u})`} value={reducaoAbsoluta.toFixed(6).replace(".", ",")} />
          <KpiCard label="Redução (%)" value={reducaoPercentual.toFixed(6).replace(".", ",")} suffix="%" trend={reducaoPercentual} />
        </div>

          <EditableLaudoCard title="Laudo de Lead Time" laudo={laudo} />

        <div className="mt-auto min-h-[250px] bg-white dark:bg-[#1C1C1E] rounded-xl p-4 border border-slate-200 dark:border-white/10">
          <ComparisonChart data={chartData} title={`Evolução do Lead Time (${u})`} />
        </div>
      </div>
    </div>
  );
}
