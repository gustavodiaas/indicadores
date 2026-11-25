import { describe, expect, it } from "vitest";
import { buildResults, isModuleFilled, trackedModules } from "./project-status";
import { emptyProposta } from "./proposta-parser";
import { emptyRelatorio } from "@/store/useAppStore";
import type { AppState } from "@/store/useAppStore";

const base = (): AppState => ({
  produtividade: { volumeT1: 0, volumeT3: 0, horasT1: 8, horasT3: 8, operadoresT1: 1, operadoresT3: 1, unidade: "peças" },
  payback: { tipoSalario: "bruto", modoInsercaoSalario: "total", salarioBaseInicial: 0, encargosInicial: 0, dedicacaoInicial: 100, salarioBaseFinal: 0, encargosFinal: 0, dedicacaoFinal: 100, valorConsultoria: 0, investimentoExtra: 0 },
  movimentacao: { distanciaT1: 0, distanciaT3: 0, tempoT1: 0, tempoT3: 0, unidadeTempo: "minutos" },
  qualidade: { quantidadeT1: 0, quantidadeT3: 0, perdasT1: 0, perdasT3: 0 },
  disponibilidade: { tempoTotalT1: 480, tempoTotalT3: 480, paradasPlanT1: 0, paradasPlanT3: 0, paradasNaoPlanT1: 0, paradasNaoPlanT3: 0, unidadeTempo: "minutos" },
  leadtime: { leadTimeT1: 0, leadTimeT3: 0, unidadeTempo: "dias" },
  area: { areaT1: 0, areaT3: 0, valorAluguel: 0 },
  resumo: { nomeEmpresa: "", cidade: "", ramo: "", especialista: "", totalColaboradores: 0, turnos: 1, processos: "", metodo: "", origem: "", oportunidades: "", problemas: "", atuacao: "", motivacao: "", ferramentas: "", indicadoresConclusao: [] },
  gbo: { turnoTempo: 0, turnoUnidade: "hours", demanda: 0, demandaUnidade: "peças", tempoUnidade: "seconds", operacoes: [] },
  planoAcao: { metadata: { dataCriacao: "", respCriacao: "", objetivo: "", meta: "", dataRevisao: "", respRevisao: "", indicador: "" }, acoes: [] },
  a3: { titulo: "", data: "", aprovacoes: "", background: "", objetivos: "", estadoAtual: "", analise: "", estadoFuturo: "", planoAcao: [], indicadores: [], observacoes: "" },
  proposta: emptyProposta,
  relatorio: emptyRelatorio,
});

describe("project status", () => {
  it("treats a fresh project as having nothing filled and no results", () => {
    const s = base();
    expect(trackedModules.filter(k => isModuleFilled(s, k))).toEqual([]);
    expect(buildResults(s)).toEqual([]);
  });

  it("keeps each module's decimal places in the results", () => {
    const s = base();
    s.produtividade = { ...s.produtividade, volumeT1: 400, volumeT3: 520, operadoresT1: 4, operadoresT3: 4 };
    s.qualidade = { quantidadeT1: 1000, quantidadeT3: 1000, perdasT1: 60, perdasT3: 25 };
    s.area = { areaT1: 100, areaT3: 80, valorAluguel: 0 };
    s.leadtime = { leadTimeT1: 10, leadTimeT3: 12, unidadeTempo: "dias" };
    const byKey = Object.fromEntries(buildResults(s).map(r => [r.key, r]));
    expect(byKey.produtividade.value).toBe("+30,000000");
    expect(byKey.qualidade.value).toBe("+3,7");
    expect(byKey.area.value).toBe("20,0");
    // Igual ao módulo Lead Time: piora não vira redução negativa.
    expect(byKey.leadtime.value).toBe("0,000000");
  });

  it("marks modules as filled from their own data", () => {
    const s = base();
    s.resumo.nomeEmpresa = "Empresa";
    s.planoAcao.acoes = [{ id: "1" } as any];
    s.disponibilidade.paradasNaoPlanT1 = 30;
    expect(isModuleFilled(s, "resumo")).toBe(true);
    expect(isModuleFilled(s, "planoAcao")).toBe(true);
    expect(isModuleFilled(s, "disponibilidade")).toBe(true);
    expect(isModuleFilled(s, "produtividade")).toBe(false);
  });
});
