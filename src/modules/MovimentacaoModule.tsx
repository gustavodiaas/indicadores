"use client"

import { type MovimentacaoData, calcMovimentacao } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { ChevronDown } from "lucide-react";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: MovimentacaoData;
  onChange: (d: Partial<MovimentacaoData>) => void;
}

export function MovimentacaoModule({ data, onChange }: Props) {

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
  const exibir = data.exibirNoLaudo || "ambos";

  const getUnit = (val: number, unit: string) => {
    if (unit === "segundos") return val === 1 ? "segundo" : "segundos";
    if (unit === "minutos") return val === 1 ? "minuto" : "minutos";
    if (unit === "horas") return val === 1 ? "hora" : "horas";
    return unit;
  };

  // Lógica inteligente para o laudo
  const rawFerramenta = (data.ferramentaUtilizada || "").trim();
  const descricaoTxt = (data.acaoMelhoria || "").trim() || "com as melhorias realizadas";
  const isPlural = /,| e |\//i.test(rawFerramenta);
  
  let ferramentaComPreposicao = "da ferramenta aplicada";
  if (rawFerramenta) {
    ferramentaComPreposicao = isPlural 
      ? `das ferramentas ${rawFerramenta}` 
      : `da ferramenta ${rawFerramenta}`;
  }

  const formatDec = (val: number) => val.toString().replace(".", ",");

  let laudo = `Por intermédio ${ferramentaComPreposicao} foi realizado ${descricaoTxt}.`;

  if (exibir === "ambos" || exibir === "distancia") {
    laudo += `\n\nDistância: A medição inicial era de ${formatDec(dI)}m, reduzida para ${formatDec(dF)}m, representando redução de ${redD}% em distância.`;
  }

  if (exibir === "ambos" || exibir === "tempo") {
    laudo += `\n\nTempo: O tempo inicial era de ${formatDec(tI)} ${getUnit(tI, uBase)}, reduzido para ${formatDec(tF)} ${getUnit(tF, uBase)}, representando redução de ${redT}% em tempo.`;
  }

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, "");
    return Number(cleaned.replace(",", "."));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      {/* COLUNA ESQUERDA: CONFIGURAÇÕES E ENTRADA DE DADOS */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">

        {/* Configurações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#4A6FA5]/35">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 pl-1">Unidade de Tempo</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#0A2347] text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none hover:bg-slate-100 dark:hover:bg-[#001833] transition-all focus:ring-2 focus:ring-[#FF6B00] border border-transparent dark:border-[#4A6FA5]/30">
                  {uBase === "segundos" ? "Segundos" : uBase === "horas" ? "Horas" : "Minutos"}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-[#001833] border border-slate-100 dark:border-[#4A6FA5]/40 p-2 rounded-2xl shadow-xl z-[150]">
                <DropdownMenuItem onClick={() => onChange({ unidadeTempo: "segundos" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${uBase === "segundos" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Segundos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ unidadeTempo: "minutos" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${uBase === "minutos" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Minutos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ unidadeTempo: "horas" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${uBase === "horas" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Horas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#4A6FA5]/35">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 pl-1">Exibir no Laudo</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#0A2347] text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none hover:bg-slate-100 dark:hover:bg-[#001833] transition-all focus:ring-2 focus:ring-[#FF6B00] border border-transparent dark:border-[#4A6FA5]/30">
                  {exibir === "distancia" ? "Apenas Distância" : exibir === "tempo" ? "Apenas Tempo" : "Distância e Tempo"}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-[#001833] border border-slate-100 dark:border-[#4A6FA5]/40 p-2 rounded-2xl shadow-xl z-[150]">
                <DropdownMenuItem onClick={() => onChange({ exibirNoLaudo: "ambos" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${exibir === "ambos" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Distância e Tempo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ exibirNoLaudo: "distancia" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${exibir === "distancia" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Apenas Distância</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ exibirNoLaudo: "tempo" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${exibir === "tempo" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#002D72]/30"}`}>Apenas Tempo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contexto */}
        <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#4A6FA5]/35 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-[#4A6FA5]/40 pb-2">Contexto do Laudo</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Ferramenta Utilizada</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" value={data.ferramentaUtilizada || ""} onChange={e => onChange({ ferramentaUtilizada: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Ação / Melhoria Realizada</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" value={data.acaoMelhoria || ""} onChange={e => onChange({ acaoMelhoria: e.target.value })} />
          </div>
        </div>

        {/* Estados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#4A6FA5]/35 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-[#4A6FA5]/40 pb-2">Estado T1</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Distância (m)</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" defaultValue={data.distanciaT1 ? data.distanciaT1.toString().replace(".", ",") : ""} onBlur={e => onChange({ distanciaT1: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" defaultValue={data.tempoT1 ? data.tempoT1.toString().replace(".", ",") : ""} onBlur={e => onChange({ tempoT1: parseDecimal(e.target.value) })} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#4A6FA5]/35 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-[#4A6FA5]/40 pb-2">Estado T3</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Distância (m)</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" defaultValue={data.distanciaT3 ? data.distanciaT3.toString().replace(".", ",") : ""} onBlur={e => onChange({ distanciaT3: parseDecimal(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Tempo ({u})</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-[#4A6FA5]/30 bg-slate-50 dark:bg-[#0A2347] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all" defaultValue={data.tempoT3 ? data.tempoT3.toString().replace(".", ",") : ""} onBlur={e => onChange({ tempoT3: parseDecimal(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: KPIs E LAUDO */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Redução Dist." value={redD} suffix="%" trend={r.reducaoDist} />
          <KpiCard label="Redução Tempo" value={redT} suffix="%" trend={r.reducaoTempo} />
        </div>

          <EditableLaudoCard title="Laudo de Movimentação" laudo={laudo} />

        <div className="mt-auto min-h-[250px] bg-white dark:bg-[#001833] rounded-2xl p-4 border border-slate-100 dark:border-[#4A6FA5]/30 shadow-sm">
          <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
        </div>
      </div>
    </div>
  );
}
