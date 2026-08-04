import { useState, useCallback, useEffect } from "react";

export type ModuleKey = "home" | "resumo" | "produtividade" | "payback" | "movimentacao" | "qualidade" | "disponibilidade" | "leadtime" | "area" | "gbo" | "planoAcao" | "a3" | "manual";

export interface ProdutividadeData { 
  volumeT1: number; volumeT3: number; 
  horasT1: number; horasT3: number; 
  operadoresT1: number; operadoresT3: number; 
  unidade: string; 
}
export interface PaybackData { 
  tipoSalario: "bruto" | "encargos"; 
  modoInsercaoSalario?: "total" | "unitario";
  salarioBaseInicial: number; 
  encargosInicial: number; 
  dedicacaoInicial: number; 
  salarioBaseFinal: number; 
  encargosFinal: number; 
  dedicacaoFinal: number; 
  valorConsultoria: number; 
  investimentoExtra: number; 
}

export interface MovimentacaoData { 
  distanciaT1: number; distanciaT3: number; 
  tempoT1: number; tempoT3: number; 
  unidadeTempo: "segundos" | "minutos" | "horas"; 
  ferramentaUtilizada?: string; 
  acaoMelhoria?: string; 
  exibirNoLaudo?: "ambos" | "distancia" | "tempo";
}

export interface QualidadeData { quantidadeT1: number; quantidadeT3: number; perdasT1: number; perdasT3: number; }
export interface DisponibilidadeData { tempoTotalT1: number; tempoTotalT3: number; paradasPlanT1: number; paradasPlanT3: number; paradasNaoPlanT1: number; paradasNaoPlanT3: number; unidadeTempo: "segundos" | "minutos" | "horas"; }
export interface AreaData { areaT1: number; areaT3: number; valorAluguel: number; }

export interface PlanoAcaoItem { id: string; what: string; why: string; where: string; start: string; end: string; who: string; how: string; howMuch: string; percent: number; obs: string; status: string; origin?: "resumo" | "5w2h"; }
export interface PlanoAcaoMetadata { dataCriacao: string; respCriacao: string; objetivo: string; meta: string; dataRevisao: string; respRevisao: string; indicador: string; }
export interface PlanoAcaoData { metadata: PlanoAcaoMetadata; acoes: PlanoAcaoItem[]; }

export interface ResumoData { 
  nomeEmpresa: string; cidade: string; ramo: string; especialista: string; 
  totalColaboradores: number; turnos: number; processos: string; 
  metodo: "empurrada" | "puxada" | ""; origem: string; oportunidades: string; 
  problemas: string; atuacao: string; motivacao: string; ferramentas: string; 
  indicadoresConclusao: string[]; 
}
export interface GboOperation { id: string; name: string; time: number; }
export interface GboData { turnoTempo: number; turnoUnidade: "minutes" | "hours"; demanda: number; demandaUnidade: string; tempoUnidade: "minutes" | "seconds"; operacoes: GboOperation[]; tituloGrafico?: string; }

export interface LeadTimeData {
  leadTimeT1: number; leadTimeT3: number;
  unidadeTempo?: "segundos" | "minutos" | "horas" | "dias";
  tempoT1?: number; tempoT3?: number;
  melhorias?: string;
  reducaoObtida?: string;
}

export interface A3PlanoAcao { id: string; oque: string; quem: string; prazo: string; }
export interface A3Indicador { id: string; indicador: string; meta: string; status: string; }

export interface A3Data {
  titulo: string;
  data: string;
  aprovacoes: string;
  background: string;
  objetivos: string;
  estadoAtual: string;
  analise: string;
  estadoFuturo: string;
  planoAcao: A3PlanoAcao[];
  indicadores: A3Indicador[];
  observacoes: string;
}

export interface AppState { 
  produtividade: ProdutividadeData; payback: PaybackData; movimentacao: MovimentacaoData; 
  qualidade: QualidadeData; disponibilidade: DisponibilidadeData; leadtime: LeadTimeData; 
  area: AreaData; resumo: ResumoData; gbo: GboData; planoAcao: PlanoAcaoData; a3: A3Data; 
}

const defaultState: AppState = {
  produtividade: { volumeT1: 0, volumeT3: 0, horasT1: 8, horasT3: 8, operadoresT1: 1, operadoresT3: 1, unidade: "peças" },
  payback: { tipoSalario: "bruto", modoInsercaoSalario: "total", salarioBaseInicial: 0, encargosInicial: 0, dedicacaoInicial: 100, salarioBaseFinal: 0, encargosFinal: 0, dedicacaoFinal: 100, valorConsultoria: 0, investimentoExtra: 0 },
  movimentacao: { distanciaT1: 0, distanciaT3: 0, tempoT1: 0, tempoT3: 0, unidadeTempo: "minutos", ferramentaUtilizada: "", acaoMelhoria: "", exibirNoLaudo: "ambos" },
  qualidade: { quantidadeT1: 0, quantidadeT3: 0, perdasT1: 0, perdasT3: 0 },
  disponibilidade: { tempoTotalT1: 480, tempoTotalT3: 480, paradasPlanT1: 0, paradasPlanT3: 0, paradasNaoPlanT1: 0, paradasNaoPlanT3: 0, unidadeTempo: "minutos" },
  leadtime: { leadTimeT1: 0, leadTimeT3: 0, unidadeTempo: "dias", melhorias: "", reducaoObtida: "" },
  area: { areaT1: 0, areaT3: 0, valorAluguel: 0 },
  resumo: { nomeEmpresa: "", cidade: "", ramo: "", especialista: "", totalColaboradores: 0, turnos: 1, processos: "", metodo: "", origem: "", oportunidades: "", problemas: "", atuacao: "", motivacao: "", ferramentas: "", indicadoresConclusao: ["produtividade", "payback"] }, 
  gbo: { turnoTempo: 0, turnoUnidade: "hours", demanda: 0, demandaUnidade: "peças", tempoUnidade: "seconds", operacoes: [], tituloGrafico: "Gráfico de Balanceamento de Operações (GBO)" },
  planoAcao: { metadata: { dataCriacao: "", respCriacao: "", objetivo: "", meta: "", dataRevisao: "", respRevisao: "", indicador: "" }, acoes: [] },
  a3: { titulo: "", data: "", aprovacoes: "", background: "", objetivos: "", estadoAtual: "", analise: "", estadoFuturo: "", planoAcao: [], indicadores: [], observacoes: "" }
};

const mergeDeep = (target: any, source: any) => {
  const output = Object.assign({}, target);
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = { ...target[key], ...source[key] };
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

const safeDiv = (num: number, den: number) => {
  const n = Number(num);
  const d = Number(den);
  return (d > 0 && !isNaN(n) && !isNaN(d)) ? n / d : 0;
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem("consultoria-lean-state");
      if (!saved) return defaultState;
      const parsed = JSON.parse(saved);
      return mergeDeep(defaultState, parsed);
    } catch {
      return defaultState;
    }
  });
  
  const [activeModule, setActiveModule] = useState<ModuleKey>(() => {
    try { return (localStorage.getItem("consultoria-lean-module") as ModuleKey) || "home"; } catch { return "home"; }
  });

  useEffect(() => { localStorage.setItem("consultoria-lean-state", JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem("consultoria-lean-module", activeModule); }, [activeModule]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem("consultoria-lean-state");
        if (saved) setState(mergeDeep(defaultState, JSON.parse(saved)));
      } catch {}
    };
    window.addEventListener("app-data-sync", handleSync);
    return () => window.removeEventListener("app-data-sync", handleSync);
  }, []);

  const updateModule = useCallback(<K extends keyof AppState>(key: K, data: Partial<AppState[K]>) => {
    setState(prev => ({ ...prev, [key]: { ...prev[key], ...data } as any }));
  }, []);

  const loadState = useCallback((data: AppState) => { setState(mergeDeep(defaultState, data)); }, []);
  const clearData = useCallback(() => { 
    localStorage.removeItem("consultoria-lean-state"); 
    window.location.reload(); 
  }, []);

  return { state, activeModule, setActiveModule, updateModule, loadState, clearData };
}

export function calcProdutividade(d: ProdutividadeData) { 
  const pphT1 = safeDiv(d.volumeT1, (d.horasT1 * d.operadoresT1)); 
  const pphT3 = safeDiv(d.volumeT3, (d.horasT3 * d.operadoresT3)); 
  const ganho = pphT1 > 0 ? ((pphT3 - pphT1) / pphT1) * 100 : 0; 
  return { pphT1, pphT3, ganho }; 
}

export function calcPayback(d: PaybackData, prod: ProdutividadeData, res?: ResumoData) { 
  const prodMensalI = prod.volumeT1 * 21; 
  const prodMensalF = prod.volumeT3 * 21; 
  const encI = d.tipoSalario === "bruto" ? 1 : (d.encargosInicial ?? 0); 
  const encF = d.tipoSalario === "bruto" ? 1 : (d.encargosFinal ?? 0); 
  const dedI = (d.dedicacaoInicial || 100) / 100; 
  const dedF = (d.dedicacaoFinal || 100) / 100; 

  const baseI = d.modoInsercaoSalario === "unitario" ? d.salarioBaseInicial * (prod.operadoresT1 || 1) : d.salarioBaseInicial;
  const baseF = d.modoInsercaoSalario === "unitario" ? d.salarioBaseFinal * (prod.operadoresT3 || 1) : d.salarioBaseFinal;

  const salI = baseI * encI * dedI; 
  const salF = baseF * encF * dedF; 
  
  const rawCustoI = safeDiv(salI, prodMensalI); 
  const rawCustoF = safeDiv(salF, prodMensalF); 
  const custoI = Math.round(rawCustoI * 100) / 100; 
  const custoF = Math.round(rawCustoF * 100) / 100; 
  const reducaoMOD = Math.round((custoI - custoF) * 100) / 100; 
  const reducaoMensal = Math.max(0, reducaoMOD * prodMensalF); 
  const investTotal = d.valorConsultoria + d.investimentoExtra; 
  const paybackMeses = safeDiv(investTotal, reducaoMensal); 
  
  return { prodMensalI, prodMensalF, salI, salF, custoI, custoF, reducaoMensal, investTotal, paybackMeses }; 
}

export function calcMovimentacao(d: MovimentacaoData) { const reducaoDist = d.distanciaT1 > 0 ? ((d.distanciaT1 - d.distanciaT3) / d.distanciaT1) * 100 : 0; const reducaoTempo = d.tempoT1 > 0 ? ((d.tempoT1 - d.tempoT3) / d.tempoT1) * 100 : 0; return { reducaoDist, reducaoTempo }; }
export function calcQualidade(d: QualidadeData) { const boasT1 = Math.max(0, d.quantidadeT1 - d.perdasT1); const boasT3 = Math.max(0, d.quantidadeT3 - d.perdasT3); const indiceT1 = safeDiv(boasT1, d.quantidadeT1) * 100; const indiceT3 = safeDiv(boasT3, d.quantidadeT3) * 100; const aumento = indiceT1 > 0 ? ((indiceT3 - indiceT1) / indiceT1) * 100 : 0; return { boasT1, boasT3, indiceT1, indiceT3, aumento }; }
export function calcDisponibilidade(d: DisponibilidadeData) { const dispT1 = d.tempoTotalT1 - d.paradasPlanT1; const realT1 = dispT1 - d.paradasNaoPlanT1; const indT1 = safeDiv(realT1, dispT1) * 100; const dispT3 = d.tempoTotalT3 - d.paradasPlanT3; const realT3 = dispT3 - d.paradasNaoPlanT3; const indT3 = safeDiv(realT3, dispT3) * 100; const aumento = indT1 > 0 ? ((indT3 - indT1) / indT1) * 100 : 0; return { dispT1, realT1, indT1, dispT3, realT3, indT3, aumento }; }
export function calcLeadTime(d: LeadTimeData) { const tI = d.leadTimeT1 || d.tempoT1 || 0; const tF = d.leadTimeT3 || d.tempoT3 || 0; const reducao = tI > 0 ? ((tI - tF) / tI) * 100 : 0; return { reducao }; }
export function calcArea(d: AreaData) { const reducaoPercent = d.areaT1 > 0 ? ((d.areaT1 - d.areaT3) / d.areaT1) * 100 : 0; const economiaM2 = d.areaT1 - d.areaT3; const economiaMensal = economiaM2 * d.valorAluguel; return { reducaoPercent, economiaM2, economiaMensal }; }
