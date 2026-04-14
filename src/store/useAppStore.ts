import { useState, useCallback } from "react";

export type ModuleKey =
  | "resumo"
  | "produtividade"
  | "payback"
  | "movimentacao"
  | "qualidade"
  | "disponibilidade"
  | "leadtime"
  | "area"
  | "gbo";

export interface ProdutividadeData {
  volumeT1: number; volumeT3: number;
  horasT1: number; horasT3: number;
  operadoresT1: number; operadoresT3: number;
}

export interface PaybackData {
  tipoSalario: "bruto" | "encargos";
  salarioBaseInicial: number;
  encargosInicial: number;
  colaboradoresInicial: number;
  dedicacaoInicial: number;
  salarioBaseFinal: number;
  encargosFinal: number;
  colaboradoresFinal: number;
  dedicacaoFinal: number;
  valorConsultoria: number;
  investimentoExtra: number;
}

export interface MovimentacaoData {
  distanciaT1: number; distanciaT3: number;
  tempoT1: number; tempoT3: number;
  unidadeTempo: "segundos" | "minutos" | "horas";
}

export interface QualidadeData {
  quantidadeT1: number; quantidadeT3: number;
  perdasT1: number; perdasT3: number;
}

export interface DisponibilidadeData {
  tempoTotalT1: number; tempoTotalT3: number;
  paradasPlanT1: number; paradasPlanT3: number;
  paradasNaoPlanT1: number; paradasNaoPlanT3: number;
  unidadeTempo: "segundos" | "minutos" | "horas";
}

export interface LeadTimeData {
  leadTimeT1: number; leadTimeT3: number;
}

export interface AreaData {
  areaT1: number; areaT3: number;
  valorAluguel: number;
}

export interface Acao5W2H {
  id: string;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  howMuch: string;
}

export interface ResumoData {
  nomeEmpresa: string;
  cidade: string;
  ramo: string;
  especialista: string;
  totalColaboradores: number;
  turnos: number;
  processos: string;
  metodo: "empurrada" | "puxada" | "";
  origem: string;
  oportunidades: string;
  problemas: string;
  atuacao: string;
  motivacao: string;
  ferramentas: string;
  acoes: Acao5W2H[];
}

export interface AppState {
  produtividade: ProdutividadeData;
  payback: PaybackData;
  movimentacao: MovimentacaoData;
  qualidade: QualidadeData;
  disponibilidade: DisponibilidadeData;
  leadtime: LeadTimeData;
  area: AreaData;
  resumo: ResumoData;
}

export interface GboOperation {
  id: string;
  name: string;
  time: number;
}

export interface GboData {
  turnoTempo: number; // Em horas ou minutos
  turnoUnidade: "minutes" | "hours";
  demanda: number;
  demandaUnidade: string;
  tempoUnidade: "minutes" | "seconds";
  operacoes: GboOperation[];
}
const defaultState: AppState = {
  produtividade: { volumeT1: 0, volumeT3: 0, horasT1: 8, horasT3: 8, operadoresT1: 1, operadoresT3: 1 },
  payback: { tipoSalario: "encargos", salarioBaseInicial: 0, encargosInicial: 1.9, colaboradoresInicial: 1, dedicacaoInicial: 100, salarioBaseFinal: 0, encargosFinal: 1.9, colaboradoresFinal: 1, dedicacaoFinal: 100, valorConsultoria: 0, investimentoExtra: 0 },
  movimentacao: { distanciaT1: 0, distanciaT3: 0, tempoT1: 0, tempoT3: 0, unidadeTempo: "minutos" },
  qualidade: { quantidadeT1: 0, quantidadeT3: 0, perdasT1: 0, perdasT3: 0 },
  disponibilidade: { tempoTotalT1: 480, tempoTotalT3: 480, paradasPlanT1: 0, paradasPlanT3: 0, paradasNaoPlanT1: 0, paradasNaoPlanT3: 0, unidadeTempo: "minutos" },
  leadtime: { leadTimeT1: 0, leadTimeT3: 0 },
  area: { areaT1: 0, areaT3: 0, valorAluguel: 0 },
  resumo: { nomeEmpresa: "", cidade: "", ramo: "", especialista: "", totalColaboradores: 0, turnos: 1, processos: "", metodo: "", origem: "", oportunidades: "", problemas: "", atuacao: "", motivacao: "", ferramentas: "", acoes: [] },
};

// Funções Utilitárias fora dos objetos
const safeDiv = (num: number, den: number) => (den > 0 ? num / den : 0);
const tratarEncargo = (v: number) => (v <= 0 ? 1 : v > 10 ? 1 + (v / 100) : v);

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeModule, setActiveModule] = useState<ModuleKey>("resumo");

  const updateModule = useCallback(<K extends keyof AppState>(key: K, data: Partial<AppState[K]>) => {
    setState(prev => ({ ...prev, [key]: { ...prev[key], ...data } as any }));
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consultoria-lean-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setState({ ...defaultState, ...data });
      } catch {
        alert("Erro ao importar arquivo JSON. Formato inválido.");
      }
    };
    reader.readAsText(file);
  }, []);

  const loadState = useCallback((data: AppState) => {
    setState({ ...defaultState, ...data });
  }, []);

  return { state, activeModule, setActiveModule, updateModule, exportJSON, importJSON, loadState };
}

export function calcProdutividade(d: ProdutividadeData) {
  const pphT1 = safeDiv(d.volumeT1, (d.horasT1 * d.operadoresT1));
  const pphT3 = safeDiv(d.volumeT3, (d.horasT3 * d.operadoresT3));
  const ganho = pphT1 > 0 ? ((pphT3 - pphT1) / pphT1) * 100 : 0;
  return { pphT1, pphT3, ganho };
}

export function calcPayback(d: PaybackData, prod: ProdutividadeData, res: ResumoData) {
  const turnos = res.turnos || 1;
  const prodMensalI = prod.volumeT1 * turnos * 21;
  const prodMensalF = prod.volumeT3 * turnos * 21;

  const encI = d.tipoSalario === "bruto" ? 1 : tratarEncargo(d.encargosInicial);
  const encF = d.tipoSalario === "bruto" ? 1 : tratarEncargo(d.encargosFinal);

  const salI = d.salarioBaseInicial * encI * d.colaboradoresInicial * safeDiv(d.dedicacaoInicial, 100);
  const salF = d.salarioBaseFinal * encF * d.colaboradoresFinal * safeDiv(d.dedicacaoFinal, 100);

  const custoI = safeDiv(salI, prodMensalI);
  const custoF = safeDiv(salF, prodMensalF);

  const reducaoMensal = (custoI - custoF) * prodMensalF;
  const investTotal = d.valorConsultoria + d.investimentoExtra;
  const paybackMeses = safeDiv(investTotal, reducaoMensal);

  return { 
    prodMensalI, prodMensalF, 
    salI, salF, 
    custoI, custoF, 
    reducaoMensal, investTotal, paybackMeses 
  };
}

export function calcMovimentacao(d: MovimentacaoData) {
  const reducaoDist = d.distanciaT1 > 0 ? ((d.distanciaT1 - d.distanciaT3) / d.distanciaT1) * 100 : 0;
  const reducaoTempo = d.tempoT1 > 0 ? ((d.tempoT1 - d.tempoT3) / d.tempoT1) * 100 : 0;
  return { reducaoDist, reducaoTempo };
}

export function calcQualidade(d: QualidadeData) {
  const boasT1 = Math.max(0, d.quantidadeT1 - d.perdasT1);
  const boasT3 = Math.max(0, d.quantidadeT3 - d.perdasT3);
  
  const indiceT1 = safeDiv(boasT1, d.quantidadeT1) * 100;
  const indiceT3 = safeDiv(boasT3, d.quantidadeT3) * 100;
  
  const aumento = indiceT1 > 0 ? ((indiceT3 - indiceT1) / indiceT1) * 100 : 0;
  return { boasT1, boasT3, indiceT1, indiceT3, aumento };
}

export function calcDisponibilidade(d: DisponibilidadeData) {
  const dispT1 = d.tempoTotalT1 - d.paradasPlanT1;
  const realT1 = dispT1 - d.paradasNaoPlanT1;
  const indT1 = safeDiv(realT1, dispT1) * 100;

  const dispT3 = d.tempoTotalT3 - d.paradasPlanT3;
  const realT3 = dispT3 - d.paradasNaoPlanT3;
  const indT3 = safeDiv(realT3, dispT3) * 100;

  const aumento = indT1 > 0 ? ((indT3 - indT1) / indT1) * 100 : 0;
  return { dispT1, realT1, indT1, dispT3, realT3, indT3, aumento };
}

export function calcLeadTime(d: LeadTimeData) {
  const reducao = d.leadTimeT1 > 0 ? ((d.leadTimeT1 - d.leadTimeT3) / d.leadTimeT1) * 100 : 0;
  return { reducao };
}

export function calcArea(d: AreaData) {
  const reducaoPercent = d.areaT1 > 0 ? ((d.areaT1 - d.areaT3) / d.areaT1) * 100 : 0;
  const economiaM2 = d.areaT1 - d.areaT3;
  const economiaMensal = economiaM2 * d.valorAluguel;
  return { reducaoPercent, economiaM2, economiaMensal };
}
