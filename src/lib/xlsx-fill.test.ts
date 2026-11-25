import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { fillWorkbook } from "./xlsx-fill";
import { buildRelatorioTargets, pendingTexts, reportFileName, splitEndereco, type RelatorioTarget } from "./relatorio-map";
import { defaultState } from "@/store/useAppStore";
import { buildConclusao, buildDescricao } from "./resumo-textos";
import { buildLaudoPayback, buildLaudoProdutividade } from "./laudos";

const CREAM = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7D6" } } as const;
const GOLD = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2CB" } } as const;
const BLUE = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6DDFF" } } as const;

/** Modelo fictício com o mesmo desenho do relatório (rótulo à esquerda, célula creme à direita). */
async function fakeTemplate() {
  const wb = new ExcelJS.Workbook();
  const dg = wb.addWorksheet("DADOS GERAIS");
  dg.getCell("B5").value = "CNPJ:"; dg.getCell("D5").fill = GOLD;
  dg.getCell("B6").value = "Razão Social:"; dg.getCell("D6").fill = GOLD; dg.getCell("D6").value = "CLIENTE ANTERIOR";
  dg.getCell("B10").value = "Porte da Empresa"; dg.getCell("D10").fill = GOLD;
  dg.getCell("B11").value = "HORAS"; dg.getCell("D11").value = { formula: 'IF(D10="MICRO EMPRESA","76","106")' }; dg.getCell("D11").fill = BLUE;
  dg.getCell("B13").value = "Endereço da empresa";
  dg.getCell("B14").value = "Cidade:"; dg.getCell("D14").fill = GOLD;
  dg.getCell("B23").value = "Cidade e estado do SENAI/DR";
  dg.getCell("B24").value = "Cidade:"; dg.getCell("D24").fill = CREAM;
  dg.getCell("B28").value = "Consultor(a) SENAI:"; dg.getCell("D28").fill = CREAM;
  dg.getCell("B29").value = "Consultor(a) SENAI (se aplicável):"; dg.getCell("D29").fill = CREAM;
  // Dados de um atendimento anterior e textos de instrução do modelo.
  dg.getCell("B9").value = "Família de produto:"; dg.getCell("D9").fill = GOLD; dg.getCell("D9").value = "PRODUTO ANTIGO";
  dg.getCell("D28").value = "CONSULTOR ANTIGO";
  dg.getCell("B30").value = "Total"; dg.getCell("D30").fill = CREAM; dg.getCell("D30").value = { formula: "1+1" };

  const rel = wb.addWorksheet("RELATÓRIO");
  rel.getCell("B4").value = "3.1"; rel.getCell("C4").value = "Descrição do processo produtivo";
  rel.getCell("B5").fill = CREAM; rel.getCell("B5").value = "Descreva o processo produtivo visualizado.";
  rel.getCell("B8").fill = CREAM; rel.getCell("B8").value = "Inserir imagem do MFV Estado Presente.";
  rel.getCell("B66").fill = CREAM; rel.getCell("B66").value = "X";
  rel.getCell("C22").value = "Número de operadores por turno antes da intervenção"; rel.getCell("D22").fill = CREAM; rel.getCell("I22").fill = CREAM;
  rel.getCell("C23").value = "Quantidade de horas por turno"; rel.getCell("D23").fill = CREAM;
  rel.getCell("C24").value = "Quantidade produzida por turno"; rel.getCell("D24").fill = CREAM;
  rel.getCell("C25").value = "Produtividade (medição inicial)"; rel.getCell("D25").value = { formula: "D24/D23/D22" };
  for (const r of [26, 27]) { rel.getCell(`C${r}`).fill = CREAM; rel.getCell(`D${r}`).fill = CREAM; rel.getCell(`I${r}`).fill = CREAM; }
  rel.getCell("C308").value = "Medições Finais";
  rel.getCell("C309").value = "Número de operadores por turno despois da intervenção"; rel.getCell("D309").fill = CREAM;
  rel.getCell("C310").value = "Quantidade de horas por turno"; rel.getCell("D310").fill = CREAM;
  rel.getCell("C311").value = "Quantidade produzida nas horas trabalhadas por turno"; rel.getCell("D311").fill = CREAM;
  rel.getCell("C312").value = "Produtividade (Final)";
  for (const r of [313, 314]) { rel.getCell(`C${r}`).value = { formula: `C${r - 287}` }; rel.getCell(`D${r}`).fill = CREAM; }
  rel.getCell("C329").value = "Ganho Financeiro mensal na empresa"; rel.getCell("E329").fill = CREAM;
  rel.getCell("B334").value = "3.11"; rel.getCell("C334").value = "Análise dos INDICADORES";
  rel.getCell("C335").fill = CREAM; rel.getCell("C335").value = "Descrever os impactos dos indicadores para empresa";
  rel.getCell("B338").value = "3.12"; rel.getCell("C338").value = "Análise do Retorno do Programa";
  rel.getCell("C339").fill = CREAM; rel.getCell("C339").value = "Gastos utilizados (Capex)";
  // Rótulo sem célula creme ao lado: não pode ser escrito.
  rel.getCell("C330").value = "Somatório de Investimento em Ações"; rel.getCell("E330").fill = BLUE;
  const res = wb.addWorksheet("RESUMO");
  res.getCell("B11").value = "Nome UO"; for (const r of [12, 13, 14]) res.getCell(`B${r}`).fill = CREAM;
  const conc = wb.addWorksheet("CONCLUSÃO");
  conc.getCell("B2").value = "5 - CONCLUSÃO"; conc.getCell("B4").fill = CREAM;
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

async function readBack(bytes: Uint8Array) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(bytes as unknown as ArrayBuffer);
  return wb;
}

const state = () => {
  const s = structuredClone(defaultState);
  s.proposta = { ...s.proposta, cnpj: "00.000.000/0001-00", razaoSocial: "Empresa Fictícia Ltda", porte: "micro", cidade: "Cidade Exemplo", uf: "RS" };
  s.resumo = { ...s.resumo, especialista: "Consultor Exemplo", nomeEmpresa: "Empresa Fictícia Ltda", processos: "corte, dobra e solda" };
  s.produtividade = { ...s.produtividade, volumeT1: 120.5, volumeT3: 150, horasT1: 8, horasT3: 7.5, operadoresT1: 3, operadoresT3: 2 };
  s.qualidade = { quantidadeT1: 1000, perdasT1: 50, quantidadeT3: 1000, perdasT3: 20 };
  s.area = { areaT1: 80, areaT3: 60, valorAluguel: 0 };
  s.payback = { ...s.payback, investimentoExtra: 5000, salarioBaseInicial: 9000, salarioBaseFinal: 6000 };
  return s;
};

describe("Relatório de atendimento", () => {
  it("writes only cream cells found by label and keeps everything else", async () => {
    const targets = buildRelatorioTargets(state());
    const { results, cleared, file } = await fillWorkbook(await fakeTemplate(), targets);
    const wb = await readBack(file!);
    const dg = wb.getWorksheet("DADOS GERAIS")!;
    const rel = wb.getWorksheet("RELATÓRIO")!;

    expect(dg.getCell("D5").value).toBe("00.000.000/0001-00");
    expect(dg.getCell("D6").value).toBe("Empresa Fictícia Ltda");
    expect(dg.getCell("D10").value).toBe("MICRO EMPRESA");
    expect(dg.getCell("D14").value).toBe("Cidade Exemplo"); // cidade da empresa, não a do SENAI
    expect(dg.getCell("D24").value).toBe("Porto Alegre"); // SENAI/DR, sempre Porto Alegre - RS
    expect(wb.getWorksheet("RESUMO")!.getCell("B12").value).toBe("IST - Mecatrônica");
    expect(wb.getWorksheet("RESUMO")!.getCell("B13").value).toBeNull();
    expect(dg.getCell("D28").value).toBeNull(); // "Especialista em" é a especialidade da empresa, não o consultor
    expect(dg.getCell("D29").value).toBeNull();
    expect((dg.getCell("D11").value as ExcelJS.CellFormulaValue).formula).toContain("MICRO EMPRESA");

    expect([rel.getCell("D22").value, rel.getCell("D23").value, rel.getCell("D24").value]).toEqual([3, 8, 120.5]);
    expect(rel.getCell("I22").value).toBeNull();
    expect([rel.getCell("D309").value, rel.getCell("D310").value, rel.getCell("D311").value]).toEqual([2, 7.5, 150]);
    expect((rel.getCell("D25").value as ExcelJS.CellFormulaValue).formula).toBe("D24/D23/D22");

    // Indicadores extras: nome, valor inicial e unidade; valor final na linha correspondente.
    expect([rel.getCell("C26").value, rel.getCell("D26").value, rel.getCell("I26").value]).toEqual(["Índice de peças boas", 95, "%"]);
    expect([rel.getCell("C27").value, rel.getCell("D27").value, rel.getCell("I27").value]).toEqual(["Área ocupada", 80, "m²"]);
    expect([rel.getCell("D313").value, rel.getCell("D314").value]).toEqual([98, 60]);

    expect(rel.getCell("B5").value).toBe(buildDescricao(state().resumo).tela);
    expect(String(rel.getCell("B5").value)).toContain("corte, dobra e solda");
    expect(wb.getWorksheet("CONCLUSÃO")!.getCell("B4").value).toBe(buildConclusao(state()).textoTela);

    // Limpeza: dados antigos saem, instruções e fórmulas ficam.
    expect(dg.getCell("D9").value).toBeNull();
    expect(rel.getCell("B66").value).toBeNull();
    expect(rel.getCell("B8").value).toBe("Inserir imagem do MFV Estado Presente.");
    expect((dg.getCell("D30").value as ExcelJS.CellFormulaValue).formula).toBe("1+1");
    expect(cleared.map(c => `${c.sheet}!${c.ref}`).sort()).toEqual(["DADOS GERAIS!D28", "DADOS GERAIS!D9", "RELATÓRIO!B66"]);

    expect(rel.getCell("C335").value).toBe(buildLaudoProdutividade(state().produtividade));
    expect(rel.getCell("C339").value).toBe(buildLaudoPayback(state().payback, state().produtividade, state().resumo));

    expect(rel.getCell("E330").value).toBeNull();
    expect(results.find(r => r.target.id === "invest")!.cells).toEqual([]);
    expect(results.find(r => r.target.id === "cidade")!.cells).toEqual(["D14"]);
  });

  it("dry run locates without changing the file", async () => {
    const targets: RelatorioTarget[] = [{ kind: "label", id: "x", sheet: "DADOS GERAIS", label: "CNPJ", value: "1", campo: "CNPJ", origem: "Teste" }];
    const { results, file } = await fillWorkbook(await fakeTemplate(), targets, true);
    expect(file).toBeNull();
    expect(results[0].cells).toEqual(["D5"]);
  });

  it("uses the texts edited on the Resumo screen", () => {
    const s = state();
    s.resumo = { ...s.resumo, descricaoEditada: "Descrição escrita à mão.", conclusaoEditada: "Conclusão escrita à mão." };
    s.produtividade = { ...s.produtividade, laudoEditado: "Laudo operacional à mão." };
    s.payback = { ...s.payback, laudoEditado: "Laudo de payback à mão." };
    const t = buildRelatorioTargets(s);
    expect(t.find(x => x.id === "descricao")).toMatchObject({ value: "Descrição escrita à mão." });
    expect(t.find(x => x.id === "conclusao")).toMatchObject({ value: "Conclusão escrita à mão." });
    expect(t.find(x => x.id === "laudoProd")).toMatchObject({ value: "Laudo operacional à mão." });
    expect(t.find(x => x.id === "laudoPay")).toMatchObject({ value: "Laudo de payback à mão." });
  });

  it("sends laudos as soon as the tab has data and lists what is missing", () => {
    const s = structuredClone(defaultState);
    s.produtividade = { ...s.produtividade, volumeT1: 100 }; // só o inicial
    s.payback = { ...s.payback, valorConsultoria: 16516 }; // só o porte
    const t = buildRelatorioTargets(s);
    expect(t.map(x => x.id)).toEqual(expect.arrayContaining(["laudoProd", "laudoPay"]));
    expect(pendingTexts(s, t).map(p => p.campo)).toEqual(["3.1 Descrição do processo produtivo", "5 Conclusão"]);
  });

  it("names the file with the CNPJ digits and _RA", () => {
    const s = state();
    expect(reportFileName(s, "T4.2_V10.xlsx")).toBe("00000000000100_RA.xlsx");
    s.proposta = { ...s.proposta, cnpj: "" };
    expect(reportFileName(s, "T4.2_V10.xlsx")).toBe("T4.2_V10 - Empresa Fictícia Ltda.xlsx");
  });

  it("skips empty data and splits clear addresses only", () => {
    expect(buildRelatorioTargets(structuredClone(defaultState)).map(t => t.id)).toEqual(["senaiCidade", "senaiEstado", "nomeUO"]);
    expect(splitEndereco("RUA DAS FLORES, 100, CENTRO, 95000000")).toEqual({ rua: "RUA DAS FLORES", numero: "100", bairro: "CENTRO" });
    expect(splitEndereco("Rodovia sem número")).toBeNull();
  });
});
