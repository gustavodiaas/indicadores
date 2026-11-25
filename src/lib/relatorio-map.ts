// O que o app sabe preencher no Relatório de Atendimento (modelo do Departamento Nacional).
// As células são encontradas pelo texto do rótulo, não pelo endereço, para continuar
// funcionando quando sai uma versão nova da planilha.
import {
  calcDisponibilidade, calcPayback, calcQualidade,
  type AppState, emptyRelatorio,
} from "@/store/useAppStore";
import { buildConclusao, buildDescricao } from "@/lib/resumo-textos";
import { buildLaudoPayback, buildLaudoProdutividade } from "@/lib/laudos";

export type CellValue = string | number;

/** Valor escrito na primeira célula creme à direita do rótulo. */
export interface LabelTarget {
  kind: "label";
  id: string;
  sheet: string;
  /** Início do texto do rótulo (sem diferenciar maiúsculas e acentos). */
  label: string;
  /** Procura o rótulo só abaixo deste outro rótulo (para rótulos repetidos, como "Cidade:"). */
  after?: string;
  /** Célula creme à esquerda do rótulo (caixas de marcar "X" da lista de ferramentas). */
  side?: "left";
  value: CellValue;
  campo: string;
  origem: string;
}

/** Indicadores extras: linhas creme logo abaixo de um rótulo (nome, valor e unidade). */
export interface SlotTarget {
  kind: "slot";
  id: string;
  sheet: string;
  /** Rótulo da linha acima do primeiro espaço livre. */
  below: string;
  index: number;
  /** Colunas creme da linha, da esquerda para a direita: 0 = primeira, -1 = última. */
  values: { position: number; value: CellValue }[];
  campo: string;
  origem: string;
}

/** Texto longo: primeira célula creme logo abaixo de um título (ex.: "3.1 Descrição do processo produtivo"). */
export interface BlockTarget {
  kind: "block";
  id: string;
  sheet: string;
  label: string;
  value: string;
  campo: string;
  origem: string;
}

export type RelatorioTarget = LabelTarget | SlotTarget | BlockTarget;

const DG = "DADOS GERAIS";
const RES = "RESUMO";
const REL = "RELATÓRIO";

/** Cidade e estado do SENAI/DR: o atendimento é sempre pelo SENAI-RS, em Porto Alegre. */
export const SENAI_DR = { cidade: "Porto Alegre", estado: "RS" } as const;

/** UO que realiza a consultoria (aba Resumo, "Nome UO"). */
export const NOME_UO = "IST - Mecatrônica";

const porteTexto = { micro: "MICRO EMPRESA", pequena: "PEQUENA EMPRESA", "": "" } as const;

/** "RUA DAS FLORES, 100, CENTRO, 95000000" → rua, número e bairro (só quando o formato é claro). */
export function splitEndereco(endereco: string): { rua: string; numero: string; bairro: string } | null {
  const parts = endereco.split(",").map(p => p.trim()).filter(Boolean);
  if (parts.length < 3 || !/^(\d+[A-Za-z]?|S\/?N)$/i.test(parts[1])) return null;
  return { rua: parts[0], numero: parts[1], bairro: parts[2] };
}

const has = (v: CellValue | undefined | null): v is CellValue =>
  typeof v === "number" ? Number.isFinite(v) && v !== 0 : Boolean(v && String(v).trim());

interface Indicador { nome: string; inicial: number; final: number; unidade: string; origem: string }

function indicadoresExtras(s: AppState): Indicador[] {
  const out: Indicador[] = [];
  const q = s.qualidade;
  if (q.quantidadeT1 > 0 && q.quantidadeT3 > 0) {
    const r = calcQualidade(q);
    out.push({ nome: "Índice de peças boas", inicial: r.indiceT1, final: r.indiceT3, unidade: "%", origem: "Qualidade" });
  }
  const d = s.disponibilidade;
  if ([d.paradasPlanT1, d.paradasNaoPlanT1, d.paradasPlanT3, d.paradasNaoPlanT3].some(v => v > 0)) {
    const r = calcDisponibilidade(d);
    out.push({ nome: "Disponibilidade", inicial: r.indT1, final: r.indT3, unidade: "%", origem: "Disponibilidade" });
  }
  const lt = s.leadtime;
  const ltI = lt.leadTimeT1 || lt.tempoT1 || 0;
  const ltF = lt.leadTimeT3 || lt.tempoT3 || 0;
  if (ltI > 0 && ltF > 0) out.push({ nome: "Lead Time", inicial: ltI, final: ltF, unidade: lt.unidadeTempo || "dias", origem: "Lead Time" });
  const m = s.movimentacao;
  if (m.distanciaT1 > 0 && m.distanciaT3 > 0) out.push({ nome: "Distância percorrida", inicial: m.distanciaT1, final: m.distanciaT3, unidade: "m", origem: "Movimentação" });
  if (m.tempoT1 > 0 && m.tempoT3 > 0) out.push({ nome: "Tempo de movimentação", inicial: m.tempoT1, final: m.tempoT3, unidade: m.unidadeTempo || "minutos", origem: "Movimentação" });
  const a = s.area;
  if (a.areaT1 > 0 && a.areaT3 > 0) out.push({ nome: "Área ocupada", inicial: a.areaT1, final: a.areaT3, unidade: "m²", origem: "Área" });
  return out;
}

/** "2026-11-25" → número de data do Excel (a planilha confere as datas com ÉNÚM). */
export function excelDate(iso: string | undefined): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return 0;
  return (Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 30)) / 86400000;
}

/** Linha de produção: a digitada no Relatório ou, se nunca editada, a do Resumo. */
export const relatorioLinha = (s: AppState) => (s.relatorio?.linha ?? (s.resumo.atuacao || s.resumo.processos || "")).trim();
/** Motivo da seleção da linha: o digitado no Relatório ou, se nunca editado, a motivação do Resumo. */
export const relatorioMotivo = (s: AppState) => (s.relatorio?.motivo ?? (s.resumo.motivacao || "")).trim();

/** Campos obrigatórios do relatório que ainda estão vazios (o download só libera sem pendências). */
export function missingRequired(s: AppState): string[] {
  const rel = { ...emptyRelatorio, ...(s.relatorio ?? {}) };
  const out: string[] = [];
  if (!relatorioLinha(s)) out.push("Linha de produção, processo e/ou produto");
  if (!relatorioMotivo(s)) out.push("Motivo para a seleção da linha");
  if (!rel.familia?.trim()) out.push("Família de produto");
  if (!rel.consultores?.[0]?.trim()) out.push("Consultor(a) SENAI");
  if (!excelDate(rel.dataAceitacao)) out.push("Data de aceitação");
  if (!excelDate(rel.dataExecucao)) out.push("Data de execução");
  if (!excelDate(rel.dataEncerramento)) out.push("Data de encerramento técnico");
  return out;
}

/** Lista do que pode ser escrito na planilha com os dados atuais do app (só campos com valor). */
export function buildRelatorioTargets(s: AppState): RelatorioTarget[] {
  const p = s.proposta;
  const r = s.resumo;
  const prod = s.produtividade;
  const end = p?.endereco ? splitEndereco(p.endereco) : null;
  const pay = calcPayback(s.payback, prod, r);
  const rel = { ...emptyRelatorio, ...(s.relatorio ?? {}) };

  const labels: Omit<LabelTarget, "kind">[] = [
    { id: "cnpj", sheet: DG, label: "CNPJ", value: p?.cnpj, campo: "CNPJ", origem: "Proposta" },
    { id: "razao", sheet: DG, label: "Razão Social", value: p?.razaoSocial || r.nomeEmpresa, campo: "Razão social", origem: p?.razaoSocial ? "Proposta" : "Resumo" },
    { id: "linha", sheet: DG, label: "Linha de produção", value: relatorioLinha(s), campo: "Linha de produção / processo", origem: "Relatório" },
    { id: "motivo", sheet: DG, label: "Motivo para a seleção da linha", value: relatorioMotivo(s), campo: "Motivo para a seleção da linha", origem: "Relatório" },
    { id: "familia", sheet: DG, label: "Família de produto", value: rel.familia?.trim(), campo: "Família de produto", origem: "Relatório" },
    { id: "porte", sheet: DG, label: "Porte da Empresa", value: porteTexto[p?.porte ?? ""], campo: "Porte da empresa", origem: "Proposta" },
    { id: "cidade", sheet: DG, label: "Cidade", after: "Endereço da empresa", value: p?.cidade || r.cidade, campo: "Cidade da empresa", origem: p?.cidade ? "Proposta" : "Resumo" },
    { id: "uf", sheet: DG, label: "Estado", after: "Endereço da empresa", value: p?.uf, campo: "Estado da empresa", origem: "Proposta" },
    { id: "rua", sheet: DG, label: "Rua", after: "Endereço da empresa", value: end?.rua, campo: "Rua", origem: "Proposta" },
    { id: "numero", sheet: DG, label: "Nº", after: "Endereço da empresa", value: end?.numero, campo: "Número", origem: "Proposta" },
    { id: "bairro", sheet: DG, label: "Bairro", after: "Endereço da empresa", value: end?.bairro, campo: "Bairro", origem: "Proposta" },
    { id: "senaiCidade", sheet: DG, label: "Cidade", after: "Cidade e estado do SENAI", value: SENAI_DR.cidade, campo: "Cidade do SENAI/DR", origem: "Fixo" },
    { id: "senaiEstado", sheet: DG, label: "Estado", after: "Cidade e estado do SENAI", value: SENAI_DR.estado, campo: "Estado do SENAI/DR", origem: "Fixo" },
    { id: "empresario", sheet: DG, label: "Empresário(a)", value: p?.responsavelLegal, campo: "Empresário(a)", origem: "Proposta" },
    { id: "proposta", sheet: RES, label: "Número da proposta comercial", value: p?.numero, campo: "Número da proposta comercial", origem: "Proposta" },
    { id: "dataAceitacao", sheet: RES, label: "Data de Aceitação", value: excelDate(rel.dataAceitacao), campo: "Data de aceitação", origem: "Relatório" },
    { id: "dataExecucao", sheet: RES, label: "Data de Execução", value: excelDate(rel.dataExecucao), campo: "Data de execução", origem: "Relatório" },
    { id: "dataEncerramento", sheet: RES, label: "Data de Encerramento Técnico", value: excelDate(rel.dataEncerramento), campo: "Data de encerramento técnico", origem: "Relatório" },

    { id: "opT1", sheet: REL, label: "Número de operadores por turno antes", value: prod.volumeT1 > 0 ? prod.operadoresT1 : 0, campo: "Operadores por turno (inicial)", origem: "Produtividade" },
    { id: "hT1", sheet: REL, label: "Quantidade de horas por turno", after: "Número de operadores por turno antes", value: prod.volumeT1 > 0 ? prod.horasT1 : 0, campo: "Horas por turno (inicial)", origem: "Produtividade" },
    { id: "volT1", sheet: REL, label: "Quantidade produzida", after: "Número de operadores por turno antes", value: prod.volumeT1, campo: "Quantidade produzida por turno (inicial)", origem: "Produtividade" },
    { id: "opT3", sheet: REL, label: "Número de operadores por turno de", after: "Medições Finais", value: prod.volumeT3 > 0 ? prod.operadoresT3 : 0, campo: "Operadores por turno (final)", origem: "Produtividade" },
    { id: "hT3", sheet: REL, label: "Quantidade de horas por turno", after: "Medições Finais", value: prod.volumeT3 > 0 ? prod.horasT3 : 0, campo: "Horas por turno (final)", origem: "Produtividade" },
    { id: "volT3", sheet: REL, label: "Quantidade produzida", after: "Medições Finais", value: prod.volumeT3, campo: "Quantidade produzida por turno (final)", origem: "Produtividade" },
    { id: "ganho", sheet: REL, label: "Ganho Financeiro mensal", value: pay.reducaoMensal, campo: "Ganho financeiro mensal (R$)", origem: "Payback" },
  ];

  const targets: RelatorioTarget[] = labels
    .filter(t => has(t.value))
    .map(t => ({ ...t, kind: "label", value: t.value as CellValue }));

  // 3.8 Ferramentas utilizadas: MFV e Gerenciamento Diário são obrigatórias e vão sempre marcadas.
  for (const [id, label] of [["ferrMFV", "Mapa de Fluxo de Valor"], ["ferrGD", "Gerenciamento Diário"]] as const) {
    targets.push({ kind: "label", id, sheet: REL, label, after: "Ferramentas utilizadas", side: "left", value: "X", campo: `Ferramenta utilizada: ${label}`, origem: "Fixo" });
  }

  // Somatório de Investimento em Ações (E330:G330): sempre R$ 0,00.
  targets.push({ kind: "label", id: "invest", sheet: REL, label: "Somatório de Investimento", value: 0, campo: "Investimento em ações (R$)", origem: "Fixo" });
  targets.push({ kind: "block", id: "nomeUO", sheet: RES, label: "Nome UO", value: NOME_UO, campo: "Nome UO", origem: "Fixo" });
  (rel.outrasUOs ?? []).slice(0, 2).forEach((uo, i) => {
    if (uo?.trim()) targets.push({ kind: "slot", id: `uo${i + 1}`, sheet: RES, below: "Nome UO", index: i + 1, values: [{ position: 0, value: uo.trim() }], campo: "Outra UO", origem: "Relatório" });
  });
  (rel.consultores ?? []).slice(0, 5).forEach((nome, i) => {
    if (nome?.trim()) targets.push({ kind: "slot", id: `consultor${i}`, sheet: DG, below: "Consultor(es) SENAI", index: i, values: [{ position: 0, value: nome.trim() }], campo: i === 0 ? "Consultor(a) SENAI" : "Consultor(a) SENAI (se aplicável)", origem: "Relatório" });
  });

  // Textos do Resumo (o editado na tela, se houver).
  const resumoPreenchido = Boolean(r.nomeEmpresa?.trim() || r.processos?.trim());
  const descricao = r.descricaoEditada ?? (resumoPreenchido ? buildDescricao(r).tela : "");
  const conclusao = r.conclusaoEditada ?? (resumoPreenchido ? buildConclusao(s).textoTela : "");
  if (descricao.trim()) targets.push({ kind: "block", id: "descricao", sheet: REL, label: "Descrição do processo produtivo", value: descricao, campo: "3.1 Descrição do processo produtivo", origem: "Resumo (Descrição do Processo)" });
  if (conclusao.trim()) targets.push({ kind: "block", id: "conclusao", sheet: "CONCLUSÃO", label: "5 - Conclusão", value: conclusao, campo: "5 Conclusão", origem: "Resumo (Conclusão do Projeto)" });

  // Laudos das abas Produtividade (3.11) e Payback (3.12), o editado na tela se houver.
  const prodPreenchida = prod.volumeT1 > 0 || prod.volumeT3 > 0;
  const pb = s.payback;
  const paybackPreenchido = [pb.salarioBaseInicial, pb.salarioBaseFinal, pb.valorConsultoria, pb.investimentoExtra].some(v => (v || 0) > 0);
  const laudoProd = prod.laudoEditado ?? (prodPreenchida ? buildLaudoProdutividade(prod) : "");
  const laudoPay = s.payback.laudoEditado ?? (paybackPreenchido ? buildLaudoPayback(s.payback, prod, r) : "");
  if (laudoProd.trim()) targets.push({ kind: "block", id: "laudoProd", sheet: REL, label: "Análise dos indicadores", value: laudoProd, campo: "3.11 Análise dos indicadores", origem: "Produtividade (Laudo Operacional)" });
  if (laudoPay.trim()) targets.push({ kind: "block", id: "laudoPay", sheet: REL, label: "Análise do retorno do programa", value: laudoPay, campo: "3.12 Análise do retorno do programa", origem: "Payback (Laudo de Payback)" });

  indicadoresExtras(s).slice(0, 5).forEach((ind, i) => {
    targets.push({
      kind: "slot", id: `indI${i}`, sheet: REL, below: "Produtividade (medição inicial)", index: i,
      values: [{ position: 0, value: ind.nome }, { position: 1, value: ind.inicial }, { position: -1, value: ind.unidade }],
      campo: `${ind.nome} (inicial, ${ind.unidade})`, origem: ind.origem,
    });
    targets.push({
      kind: "slot", id: `indF${i}`, sheet: REL, below: "Produtividade (Final)", index: i,
      values: [{ position: 0, value: ind.final }],
      campo: `${ind.nome} (final, ${ind.unidade})`, origem: ind.origem,
    });
  });

  return targets;
}

/** Valor como aparece na lista da tela (vírgula decimal, sem arredondar). */
/** Textos do relatório que ainda não têm de onde vir, com o que falta preencher. */
export function pendingTexts(s: AppState, targets: RelatorioTarget[]): { campo: string; falta: string }[] {
  const has = (id: string) => targets.some(t => t.id === id);
  const out: { campo: string; falta: string }[] = [];
  if (!has("descricao")) out.push({ campo: "3.1 Descrição do processo produtivo", falta: "preencha a aba Resumo (empresa ou processo)" });
  if (!has("laudoProd")) out.push({ campo: "3.11 Análise dos indicadores", falta: "preencha o Volume na aba Produtividade" });
  if (!has("laudoPay")) out.push({ campo: "3.12 Análise do retorno do programa", falta: "preencha os salários ou o porte na aba Payback" });
  if (!has("conclusao")) out.push({ campo: "5 Conclusão", falta: "preencha a aba Resumo (empresa ou processo)" });
  return out;
}

/** Nome do arquivo baixado: CNPJ só com números + "_RA" (ex.: 00000000000100_RA.xlsx). */
export function reportFileName(s: AppState, templateName: string): string {
  const cnpj = (s.proposta?.cnpj || "").replace(/\D/g, "");
  if (cnpj) return `${cnpj}_RA.xlsx`;
  const cliente = (s.proposta?.razaoSocial || s.resumo.nomeEmpresa || "").replace(/[\\/:*?"<>|]+/g, "").trim();
  return `${templateName.replace(/\.xlsx$/i, "")}${cliente ? ` - ${cliente}` : ""}.xlsx`;
}

export function displayValue(t: RelatorioTarget): string {
  if (t.kind === "block") return t.value.length > 160 ? `${t.value.slice(0, 160).trimEnd()}…` : t.value;
  if (t.kind === "label" && t.id.startsWith("data") && typeof t.value === "number") {
    return new Date(Date.UTC(1899, 11, 30) + t.value * 86400000).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }
  const v = t.kind === "label" ? t.value : (t.values.find(x => typeof x.value === "number") ?? t.values[0])?.value ?? "";
  return typeof v === "number" ? String(v).replace(".", ",") : v;
}
