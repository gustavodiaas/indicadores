import {
  calcArea, calcDisponibilidade, calcMovimentacao, calcPayback, calcProdutividade, calcQualidade,
  type AppState, type ModuleKey,
} from "@/store/useAppStore";

// Módulos cujo andamento a Home acompanha. Gantt e MFV guardam os dados à parte e ficam de fora.
const filledRules: Partial<Record<ModuleKey, (s: AppState) => boolean>> = {
  proposta: s => Boolean(s.proposta?.importadoEm),
  planoAcao: s => (s.planoAcao.acoes?.length ?? 0) > 0,
  resumo: s => Boolean(s.resumo.nomeEmpresa?.trim() || s.resumo.processos?.trim()),
  produtividade: s => s.produtividade.volumeT1 > 0 && s.produtividade.volumeT3 > 0,
  payback: s => s.payback.valorConsultoria > 0 || s.payback.salarioBaseInicial > 0,
  gbo: s => (s.gbo?.operacoes?.length ?? 0) > 0,
  movimentacao: s => s.movimentacao.distanciaT1 > 0 || s.movimentacao.tempoT1 > 0,
  qualidade: s => s.qualidade.quantidadeT1 > 0,
  disponibilidade: s => [s.disponibilidade.paradasPlanT1, s.disponibilidade.paradasNaoPlanT1, s.disponibilidade.paradasPlanT3, s.disponibilidade.paradasNaoPlanT3].some(v => v > 0),
  leadtime: s => (s.leadtime.leadTimeT1 || s.leadtime.tempoT1 || 0) > 0,
  area: s => s.area.areaT1 > 0,
  a3: s => Boolean(s.a3.titulo?.trim() || s.a3.background?.trim() || s.a3.estadoAtual?.trim()),
};

export const trackedModules = Object.keys(filledRules) as ModuleKey[];

export function isModuleFilled(state: AppState, key: ModuleKey) {
  try {
    return filledRules[key]?.(state) ?? false;
  } catch {
    return false;
  }
}

export interface ResultTile {
  key: ModuleKey;
  label: string;
  value: string;
  suffix: string;
  /** true quando o resultado é uma melhoria (ganho, redução de perda/tempo/área). */
  good: boolean;
}

// Mesmo formato numérico usado em cada módulo (as casas decimais não mudam).
const dec = (v: number, digits: number) => v.toFixed(digits).replace(".", ",");
const signed = (v: number, digits: number) => `${v > 0 ? "+" : ""}${dec(v, digits)}`;

/** Resultados principais de cada módulo que já tem antes (T1) e depois (T3). */
export function buildResults(state: AppState): ResultTile[] {
  const tiles: ResultTile[] = [];
  const s = state;

  if (s.produtividade.volumeT1 > 0 && s.produtividade.volumeT3 > 0) {
    const r = calcProdutividade(s.produtividade);
    tiles.push({ key: "produtividade", label: "Ganho de produtividade", value: signed(r.ganho, 6), suffix: "%", good: r.ganho > 0 });
  }
  if (s.produtividade.volumeT3 > 0 && (s.payback.valorConsultoria + s.payback.investimentoExtra) > 0) {
    const r = calcPayback(s.payback, s.produtividade, s.resumo);
    if (r.reducaoMensal > 0) tiles.push({ key: "payback", label: "Payback", value: dec(r.paybackMeses, 2), suffix: r.paybackMeses === 1 ? "mês" : "meses", good: true });
  }
  if (s.qualidade.quantidadeT1 > 0 && s.qualidade.quantidadeT3 > 0) {
    const r = calcQualidade(s.qualidade);
    tiles.push({ key: "qualidade", label: "Aumento de qualidade", value: signed(r.aumento, 1), suffix: "%", good: r.aumento > 0 });
  }
  if (filledRules.disponibilidade!(s)) {
    const r = calcDisponibilidade(s.disponibilidade);
    tiles.push({ key: "disponibilidade", label: "Aumento de disponibilidade", value: signed(r.aumento, 6), suffix: "%", good: r.aumento > 0 });
  }
  if ((s.leadtime.leadTimeT1 || s.leadtime.tempoT1 || 0) > 0 && (s.leadtime.leadTimeT3 || s.leadtime.tempoT3 || 0) > 0) {
    // Mesmo cálculo do módulo Lead Time (redução nunca negativa).
    const tI = s.leadtime.leadTimeT1 || s.leadtime.tempoT1 || 0;
    const tF = s.leadtime.leadTimeT3 || s.leadtime.tempoT3 || 0;
    const reducao = tI > 0 ? (Math.max(0, tI - tF) / tI) * 100 : 0;
    tiles.push({ key: "leadtime", label: "Redução de lead time", value: dec(reducao, 6), suffix: "%", good: reducao > 0 });
  }
  if (s.movimentacao.distanciaT1 > 0 || s.movimentacao.tempoT1 > 0) {
    const r = calcMovimentacao(s.movimentacao);
    const porDistancia = s.movimentacao.distanciaT1 > 0;
    const v = porDistancia ? r.reducaoDist : r.reducaoTempo;
    tiles.push({ key: "movimentacao", label: porDistancia ? "Redução de distância" : "Redução de tempo de movimentação", value: dec(v, 6), suffix: "%", good: v > 0 });
  }
  if (s.area.areaT1 > 0 && s.area.areaT3 > 0) {
    const r = calcArea(s.area);
    tiles.push({ key: "area", label: "Redução de área", value: dec(r.reducaoPercent, 1), suffix: "%", good: r.reducaoPercent > 0 });
  }
  return tiles;
}
