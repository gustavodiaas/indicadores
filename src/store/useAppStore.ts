import { useState, useCallback } from "react";

export type ModuleKey =
  | "resumo"
  | "produtividade"
  | "payback"
  | "movimentacao"
  | "qualidade"
  | "disponibilidade"
  | "leadtime"
  | "area";

export interface ProdutividadeData {
  volumeT1: number; volumeT3: number;
  horasT1: number; horasT3: number;
  operadoresT1: number; operadoresT3: number;
}

export interface PaybackData {
  salarioBase: number;
  encargosMultiplicador: number;
  colaboradores: number;
  valorConsultoria: number;
  investimentoExtra: number;
}

export interface MovimentacaoData {
  distanciaT1: number; distanciaT3: number;
  tempoT1: number; tempoT3: number;
}

export interface QualidadeData {
  quantidadeT1: number; quantidadeT3: number;
  perdasT1: number; perdasT3: number;
}

export interface DisponibilidadeData {
  tempoTotalT1: number; tempoTotalT3: number;
  paradasPlanT1: number; paradasPlanT3: number;
  paradasNaoPlanT1: number; paradasNaoPlanT3: number;
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
  turnos: number;
  processos: string;
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

const defaultState: AppState = {
  produtividade: { volumeT1: 0, volumeT3: 0, horasT1: 8, horasT3: 8, operadoresT1: 1, operadoresT3: 1 },
  payback: { salarioBase: 2000, encargosMultiplicador: 2.5, colaboradores: 0, valorConsultoria: 0, investimentoExtra: 0 },
  movimentacao: { distanciaT1: 0, distanciaT3: 0, tempoT1: 0, tempoT3: 0 },
  qualidade: { quantidadeT1: 0, quantidadeT3: 0, perdasT1: 0, perdasT3: 0 },
  disponibilidade: { tempoTotalT1: 480, tempoTotalT3: 480, paradasPlanT1: 0, paradasPlanT3: 0, paradasNaoPlanT1: 0, paradasNaoPlanT3: 0 },
  leadtime: { leadTimeT1: 0, leadTimeT3: 0 },
  area: { areaT1: 0, areaT3: 0, valorAluguel: 0 },
  resumo: { nomeEmpresa: "", cidade: "", ramo: "", turnos: 1, processos: "", ferramentas: "", acoes: [] },
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeModule, setActiveModule] = useState<ModuleKey>("resumo");

  const updateModule = useCallback(<K extends keyof AppState>(key: K, data: Partial<AppState[K]>) => {
    setState(prev => ({ ...prev, [key]: { ...prev[key], ...data } }));
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consultoria-lean.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setState({ ...defaultState, ...data });
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
  }, []);

  const loadState = useCallback((data: AppState) => {
    setState({ ...defaultState, ...data });
  }, []);

  return { state, activeModule, setActiveModule, updateModule, exportJSON, importJSON, loadState };
}

// Calculation helpers
export function calcProdutividade(d: ProdutividadeData) {
  const pphT1 = d.horasT1 > 0 && d.operadoresT1 > 0 ? d.volumeT1 / d.horasT1 / d.operadoresT1 : 0;
  const pphT3 = d.horasT3 > 0 && d.operadoresT3 > 0 ? d.volumeT3 / d.horasT3 / d.operadoresT3 : 0;
  const ganho = pphT1 > 0 ? ((pphT3 - pphT1) / pphT1) * 100 : 0;
  return { pphT1, pphT3, ganho };
}

export function calcPayback(d: PaybackData, prod: ProdutividadeData) {
  const custoColab = d.salarioBase * d.encargosMultiplicador;
  const reducaoColabs = prod.operadoresT1 - prod.operadoresT3;
  const reducaoMensal = reducaoColabs > 0 ? reducaoColabs * custoColab : 0;
  const investTotal = d.valorConsultoria + d.investimentoExtra;
  const paybackMeses = reducaoMensal > 0 ? investTotal / reducaoMensal : 0;
  return { custoColab, reducaoMensal, paybackMeses, investTotal };
}

export function calcMovimentacao(d: MovimentacaoData) {
  const reducaoDist = d.distanciaT1 > 0 ? ((d.distanciaT1 - d.distanciaT3) / d.distanciaT1) * 100 : 0;
  const reducaoTempo = d.tempoT1 > 0 ? ((d.tempoT1 - d.tempoT3) / d.tempoT1) * 100 : 0;
  return { reducaoDist, reducaoTempo };
}

export function calcQualidade(d: QualidadeData) {
  const indiceT1 = d.quantidadeT1 > 0 ? ((d.quantidadeT1 - d.perdasT1) / d.quantidadeT1) * 100 : 0;
  const indiceT3 = d.quantidadeT3 > 0 ? ((d.quantidadeT3 - d.perdasT3) / d.quantidadeT3) * 100 : 0;
  const aumento = indiceT3 - indiceT1;
  return { indiceT1, indiceT3, aumento };
}

export function calcDisponibilidade(d: DisponibilidadeData) {
  const dispT1 = d.tempoTotalT1 > 0 ? ((d.tempoTotalT1 - d.paradasPlanT1 - d.paradasNaoPlanT1) / d.tempoTotalT1) * 100 : 0;
  const dispT3 = d.tempoTotalT3 > 0 ? ((d.tempoTotalT3 - d.paradasPlanT3 - d.paradasNaoPlanT3) / d.tempoTotalT3) * 100 : 0;
  const aumento = dispT3 - dispT1;
  return { dispT1, dispT3, aumento };
}

export function calcLeadTime(d: LeadTimeData) {
  const reducao = d.leadTimeT1 > 0 ? ((d.leadTimeT1 - d.leadTimeT3) / d.leadTimeT1) * 100 : 0;
  return { reducao };
}

export function calcArea(d: AreaData) {
  const reducaoArea = d.areaT1 > 0 ? ((d.areaT1 - d.areaT3) / d.areaT1) * 100 : 0;
  const economiaM2 = d.areaT1 - d.areaT3;
  const economiaMensal = d.areaT1 > 0 ? (economiaM2 / d.areaT1) * d.valorAluguel : 0;
  return { reducaoArea, economiaM2, economiaMensal };
}
