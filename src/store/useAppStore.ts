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

export interface AppState {
  produtividade: ProdutividadeData;
  payback: PaybackData;
  movimentacao: MovimentacaoData;
  qualidade: QualidadeData;
  disponibilidade: DisponibilidadeData;
  leadtime: LeadTimeData;
  area: AreaData;
  resumo: ResumoData;
  gbo: GboData;
}

const defaultState: AppState = {
  produtividade: { volumeT1: 0, volumeT3: 0, horasT1: 8, horasT3: 8, operadoresT1: 1, operadoresT3: 1 },
  payback: { tipoSalario: "encargos", salarioBaseInicial: 0, encargosInicial: 1.9, colaboradoresInicial: 1, dedicacaoInicial: 100, salarioBaseFinal: 0, encargosFinal: 1.9, colaboradoresFinal: 1, dedicacaoFinal: 100, valorConsultoria: 0, investimentoExtra: 0 },
  movimentacao: { distanciaT1: 0, distanciaT3: 0, tempoT1: 0, tempoT3: 0, unidadeTempo: "minutos" },
  qualidade: { quantidadeT1: 0, quantidadeT3: 0, perdasT1: 0, perdasT3: 0 },
  disponibilidade: { tempoTotalT1: 480, tempoTotalT3: 480, paradasPlanT1: 0, paradasPlanT3: 0, paradasNaoPlanT1: 0, paradasNaoPlanT3: 0, unidadeTempo: "min
