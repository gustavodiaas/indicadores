// Laudos das abas Produtividade e Payback.
// Usados na tela de cada aba e no Relatório de Atendimento (3.11 e 3.12), para mostrarem o mesmo texto.
import {
  calcPayback, calcProdutividade,
  type PaybackData, type ProdutividadeData, type ResumoData,
} from "@/store/useAppStore";

/** Laudo Operacional (aba Produtividade). */
export function buildLaudoProdutividade(data: ProdutividadeData): string {
  const r = calcProdutividade(data);
  const u = data.unidade || "peças";
  const opTxt1 = data.operadoresT1 === 1 ? "operador" : "operadores";
  const opTxt3 = data.operadoresT3 === 1 ? "operador" : "operadores";
  return `No estágio inicial, a produtividade era de ${r.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op, produzindo ${data.volumeT1 || 0} ${u} com ${data.operadoresT1 || 0} ${opTxt1} em ${data.horasT1 || 0}h. Após as melhorias, a produtividade subiu para ${r.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, produzindo ${data.volumeT3 || 0} ${u} com ${data.operadoresT3 || 0} ${opTxt3} em ${data.horasT3 || 0}h. Isso representa um ganho direto de ${r.ganho.toFixed(6).replace(".", ",")}% na produtividade operacional da célula.`;
}

/** Laudo de Payback (aba Payback). */
export function buildLaudoPayback(data: PaybackData, prodData: ProdutividadeData, resumoData?: ResumoData): string {
  const r = calcPayback(data, prodData, resumoData);
  const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const op1 = prodData.operadoresT1 || 0;
  const op3 = prodData.operadoresT3 || 0;
  const u = prodData.unidade || "peças";
  const colabTxt1 = op1 === 1 ? "colaborador" : "colaboradores";
  const colabTxt3 = op3 === 1 ? "colaborador" : "colaboradores";
  return `No estágio inicial, havia ${op1} ${colabTxt1}, com custo total por mês de ${formatBRL(r.salI)}, ${data.dedicacaoInicial || 100}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${op3} ${colabTxt3}, com custo total por mês de ${formatBRL(r.salF)}, ${data.dedicacaoFinal || 100}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra por ${u}, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses > 0 ? r.paybackMeses.toFixed(2) : "0,00"} ${r.paybackMeses === 1 ? "mês" : "meses"}.`;
}
