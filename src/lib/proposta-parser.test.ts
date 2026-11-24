import { describe, expect, it } from "vitest";
import { camposEncontrados, parseProposta, whatsappUrl } from "./proposta-parser";

describe("whatsappUrl", () => {
  it("adds Brazil's code to local numbers", () => {
    expect(whatsappUrl("(54) 96666-3333")).toBe("https://wa.me/5554966663333");
    expect(whatsappUrl("(54) 3333-4444")).toBe("https://wa.me/555433334444");
    expect(whatsappUrl("+55 54 96666-3333")).toBe("https://wa.me/5554966663333");
  });
  it("rejects incomplete numbers", () => {
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl("9666-3333")).toBeNull();
  });
});
import { buildFillItems, buildPatches, defaultSelection } from "./proposta-fill";

// Texto no mesmo formato que o pdf.js extrai da Proposta Comercial do Brasil Mais Produtivo (dados fictícios).
const proposta = `PROPOSTA COMERCIAL
Versão 06_26
INFORMAÇÕES DAS UNIDADES DEMANDANTE/EXECUTORA
Sebrae/DR RS SENAI/DR RS
Unidade/IST Emissora: 100 / IST EXEMPLO Revisão: 0
Objeto da Proposta:
☒ Consultoria em Manufatura Enxuta
☐ Consultoria em Eficiência Energética
Nº da Proposta: COT-12345-ABCDE Data Emissão: 3/2/2026 Validade: 30 DIAS
Nome Contato: Maria Exemplo da Silva
Telefone: (51) 98888-1111 E-mail: maria.exemplo@senai.example
INFORMAÇÕES DO CLIENTE
Razão Social: METALURGICA FICTICIA LTDA
CNPJ: 12.345.678/0001-90 CNAE: 2599-3/99
Segmento
Industrial:
Fabricação de produtos de metal
não especificados anteriormente
Número de
Funcionários:
42
Endereço:
RUA DAS FLORES, 100, CENTRO,
95000000
Cidade: Caxias do Sul UF: RS
Responsável Legal: JOAO FICTICIO
CPF: 000.000.000-00 Cargo: Diretor
Telefone: (54) 97777-2222 E-mail: joao@ficticia.example
INFORMAÇÕES DO RESPONSÁVEL POR ACOMPANHAR O ATENDIMENTO
Nome Contato: ANA TESTE
Setor: Produção Telefone: (54) 96666-3333
E-
mail:
producao@ficticia.example
INFORMAÇÕES DO PRODUTO
Produtividade – Aumento de 20% de produtividade no processo
objeto da intervenção
Eficiência Energética – Redução de 10% do consumo de energia
• Os serviços de consultoria serão executados no prazo de até
120 (cento e vinte) dias contados da data da aprovação do
( ) Sou uma Micro empresa com faturamento anual igual ou
( X ) Sou uma Pequena empresa com faturamento anual superior a`;

describe("parseProposta", () => {
  const p = parseProposta(proposta);

  it("reads the proposal and SENAI data", () => {
    expect(p).toMatchObject({
      numero: "COT-12345-ABCDE", dataEmissao: "3/2/2026", validade: "30 DIAS", objeto: "manufatura",
      unidadeSenai: "100 / IST EXEMPLO", contatoSenai: "Maria Exemplo da Silva",
      contatoSenaiTelefone: "(51) 98888-1111", contatoSenaiEmail: "maria.exemplo@senai.example",
      prazoDias: 120, metaPercentual: 20, porte: "pequena",
    });
  });

  it("reads the client data across broken label lines", () => {
    expect(p).toMatchObject({
      razaoSocial: "METALURGICA FICTICIA LTDA", cnpj: "12.345.678/0001-90", cnae: "2599-3/99",
      segmento: "Fabricação de produtos de metal não especificados anteriormente",
      funcionarios: 42, endereco: "RUA DAS FLORES, 100, CENTRO, 95000000", cidade: "Caxias do Sul", uf: "RS",
      responsavelLegal: "JOAO FICTICIO", responsavelCargo: "Diretor",
      responsavelTelefone: "(54) 97777-2222", responsavelEmail: "joao@ficticia.example",
      acompanhamentoNome: "ANA TESTE", acompanhamentoSetor: "Produção",
      acompanhamentoTelefone: "(54) 96666-3333", acompanhamentoEmail: "producao@ficticia.example",
    });
  });

  it("never keeps CPF numbers", () => {
    expect(JSON.stringify(p)).not.toContain("000.000.000-00");
  });

  it("uses the energy goal when that consultancy is checked", () => {
    const energia = parseProposta(proposta.replace("☒ Consultoria em Manufatura", "☐ Consultoria em Manufatura").replace("☐ Consultoria em Eficiência", "☒ Consultoria em Eficiência"));
    expect(energia.objeto).toBe("energia");
    expect(energia.metaPercentual).toBe(10);
  });

  it("recognises unrelated PDFs as not a proposal", () => {
    expect(camposEncontrados(parseProposta("Relatório mensal de vendas"))).toBeLessThan(3);
  });
});

describe("proposal fill", () => {
  const p = parseProposta(proposta);
  const state = {
    resumo: { nomeEmpresa: "", cidade: "Outra cidade", ramo: "", totalColaboradores: 0 },
    planoAcao: { metadata: { dataCriacao: "01/01/2026", respCriacao: "", objetivo: "", meta: "", dataRevisao: "", respRevisao: "", indicador: "" }, acoes: [] },
    a3: { titulo: "", objetivos: "" },
  } as any;

  it("keeps fields the user already filled unselected", () => {
    const items = buildFillItems(p, state);
    const selected = defaultSelection(items);
    expect(selected.has("resumo.nomeEmpresa")).toBe(true);
    expect(selected.has("resumo.cidade")).toBe(false);
  });

  it("builds patches that keep the other 5W2H metadata", () => {
    const items = buildFillItems(p, state);
    const { patches, count } = buildPatches(items, defaultSelection(items), state);
    expect(count).toBe(items.length - 1);
    expect(patches.resumo).toEqual({ nomeEmpresa: "METALURGICA FICTICIA LTDA", ramo: p.segmento, totalColaboradores: 42 });
    expect(patches.planoAcao?.metadata).toMatchObject({ dataCriacao: "01/01/2026", meta: "Aumento de 20% de produtividade", indicador: "Produtividade" });
    expect(patches.a3?.titulo).toBe("Consultoria em Manufatura Enxuta – METALURGICA FICTICIA LTDA");
  });
});
