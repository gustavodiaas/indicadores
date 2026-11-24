import type { AppState } from "@/store/useAppStore";
import type { PropostaData } from "@/lib/proposta-parser";

export type FillModule = "resumo" | "planoAcao" | "a3";

export interface FillItem {
  id: string;
  modulo: FillModule;
  moduloLabel: string;
  campo: string;
  atual: string;
  novo: string;
}

const moduloLabels: Record<FillModule, string> = { resumo: "Resumo", planoAcao: "5W2H", a3: "A3" };

const metaTexto = (p: PropostaData) => {
  const pct = p.metaPercentual || (p.objeto === "energia" ? 10 : 20);
  return p.objeto === "energia"
    ? { objetivo: "Reduzir o consumo de energia nas cargas alvo escolhidas", meta: `Redução de ${pct}% do consumo de energia`, indicador: "Consumo de energia", a3: `Meta do Programa Brasil Mais Produtivo: redução de ${pct}% do consumo de energia nas cargas alvo escolhidas.` }
    : { objetivo: "Aumentar a produtividade no processo objeto da intervenção", meta: `Aumento de ${pct}% de produtividade`, indicador: "Produtividade", a3: `Meta do Programa Brasil Mais Produtivo: aumento de ${pct}% de produtividade no processo objeto da intervenção.` };
};

/** Campos dos módulos que a proposta consegue preencher, com o valor atual para comparação. */
export function buildFillItems(p: PropostaData, state: AppState): FillItem[] {
  const m = metaTexto(p);
  const consultoria = p.objeto === "energia" ? "Consultoria em Eficiência Energética" : "Consultoria em Manufatura Enxuta";
  const raw: Omit<FillItem, "moduloLabel">[] = [
    { id: "resumo.nomeEmpresa", modulo: "resumo", campo: "Empresa", atual: state.resumo.nomeEmpresa, novo: p.razaoSocial },
    { id: "resumo.cidade", modulo: "resumo", campo: "Cidade", atual: state.resumo.cidade, novo: p.cidade },
    { id: "resumo.ramo", modulo: "resumo", campo: "Ramo de atuação", atual: state.resumo.ramo, novo: p.segmento },
    { id: "resumo.totalColaboradores", modulo: "resumo", campo: "Total de colaboradores", atual: state.resumo.totalColaboradores ? String(state.resumo.totalColaboradores) : "", novo: p.funcionarios ? String(p.funcionarios) : "" },
    { id: "planoAcao.objetivo", modulo: "planoAcao", campo: "Objetivo", atual: state.planoAcao.metadata.objetivo, novo: p.objeto ? m.objetivo : "" },
    { id: "planoAcao.meta", modulo: "planoAcao", campo: "Meta", atual: state.planoAcao.metadata.meta, novo: p.objeto ? m.meta : "" },
    { id: "planoAcao.indicador", modulo: "planoAcao", campo: "Indicador", atual: state.planoAcao.metadata.indicador, novo: p.objeto ? m.indicador : "" },
    { id: "a3.titulo", modulo: "a3", campo: "Título / Tema", atual: state.a3.titulo, novo: p.razaoSocial ? `${consultoria} – ${p.razaoSocial}` : "" },
    { id: "a3.objetivos", modulo: "a3", campo: "Metas e objetivos", atual: state.a3.objetivos, novo: p.objeto ? m.a3 : "" },
  ];
  return raw.filter(item => item.novo).map(item => ({ ...item, atual: item.atual ?? "", moduloLabel: moduloLabels[item.modulo] }));
}

/** Itens marcados por padrão: os campos vazios ou que já têm o mesmo valor. Os já preenchidos ficam para o usuário decidir. */
export const defaultSelection = (items: FillItem[]) =>
  new Set(items.filter(i => !i.atual.trim() || i.atual.trim() === i.novo.trim()).map(i => i.id));

/** Converte os itens escolhidos em atualizações por módulo. */
export function buildPatches(items: FillItem[], selected: Set<string>, state: AppState) {
  const chosen = items.filter(i => selected.has(i.id));
  const value = (id: string) => chosen.find(i => i.id === id)?.novo;
  const resumo: Partial<AppState["resumo"]> = {};
  const metadata: Partial<AppState["planoAcao"]["metadata"]> = {};
  const a3: Partial<AppState["a3"]> = {};

  if (value("resumo.nomeEmpresa") !== undefined) resumo.nomeEmpresa = value("resumo.nomeEmpresa");
  if (value("resumo.cidade") !== undefined) resumo.cidade = value("resumo.cidade");
  if (value("resumo.ramo") !== undefined) resumo.ramo = value("resumo.ramo");
  if (value("resumo.totalColaboradores") !== undefined) resumo.totalColaboradores = Number(value("resumo.totalColaboradores")) || 0;
  if (value("planoAcao.objetivo") !== undefined) metadata.objetivo = value("planoAcao.objetivo");
  if (value("planoAcao.meta") !== undefined) metadata.meta = value("planoAcao.meta");
  if (value("planoAcao.indicador") !== undefined) metadata.indicador = value("planoAcao.indicador");
  if (value("a3.titulo") !== undefined) a3.titulo = value("a3.titulo");
  if (value("a3.objetivos") !== undefined) a3.objetivos = value("a3.objetivos");

  const patches: { [K in FillModule]?: Partial<AppState[K]> } = {};
  if (Object.keys(resumo).length) patches.resumo = resumo;
  if (Object.keys(metadata).length) patches.planoAcao = { metadata: { ...state.planoAcao.metadata, ...metadata } };
  if (Object.keys(a3).length) patches.a3 = a3;
  return { patches, count: chosen.length };
}
