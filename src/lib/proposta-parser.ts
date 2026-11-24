// Leitura da Proposta Comercial do Programa Brasil Mais Produtivo (modelo SENAI/SEBRAE).
// Tudo roda no navegador: o PDF nunca sai do computador do usuário.

export type PropostaObjeto = "manufatura" | "energia" | "";

export interface PropostaData {
  arquivo: string;
  importadoEm: string;
  numero: string;
  dataEmissao: string;
  validade: string;
  objeto: PropostaObjeto;
  unidadeSenai: string;
  contatoSenai: string;
  contatoSenaiTelefone: string;
  contatoSenaiEmail: string;
  razaoSocial: string;
  cnpj: string;
  cnae: string;
  segmento: string;
  funcionarios: number;
  endereco: string;
  cidade: string;
  uf: string;
  responsavelLegal: string;
  responsavelCargo: string;
  responsavelTelefone: string;
  responsavelEmail: string;
  acompanhamentoNome: string;
  acompanhamentoSetor: string;
  acompanhamentoTelefone: string;
  acompanhamentoEmail: string;
  prazoDias: number;
  metaPercentual: number;
  porte: "micro" | "pequena" | "";
}

export const emptyProposta: PropostaData = {
  arquivo: "", importadoEm: "", numero: "", dataEmissao: "", validade: "", objeto: "",
  unidadeSenai: "", contatoSenai: "", contatoSenaiTelefone: "", contatoSenaiEmail: "",
  razaoSocial: "", cnpj: "", cnae: "", segmento: "", funcionarios: 0, endereco: "", cidade: "", uf: "",
  responsavelLegal: "", responsavelCargo: "", responsavelTelefone: "", responsavelEmail: "",
  acompanhamentoNome: "", acompanhamentoSetor: "", acompanhamentoTelefone: "", acompanhamentoEmail: "",
  prazoDias: 0, metaPercentual: 0, porte: "",
};

const clean = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").replace(/^[\s,;:-]+|[\s,;:-]+$/g, "").trim();

const pick = (text: string, re: RegExp) => clean(text.match(re)?.[1]);

/** Trecho do texto entre dois títulos de seção (sem diferenciar maiúsculas). */
const section = (text: string, start: RegExp, end?: RegExp) => {
  const s = text.search(start);
  if (s < 0) return "";
  const rest = text.slice(s);
  if (!end) return rest;
  const e = rest.slice(1).search(end);
  return e < 0 ? rest : rest.slice(0, e + 1);
};

const EMAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;
const PHONE = /(\(?\d{2}\)?\s*\d{4,5}-?\s*\d{4})/;

export function parseProposta(rawText: string): PropostaData {
  // Os rótulos do PDF quebram linha no meio ("Número de / Funcionários:"), então o texto é lido como uma linha só.
  const text = rawText.replace(/\s+/g, " ");

  const senai = section(text, /INFORMAÇÕES DAS UNIDADES/i, /INFORMAÇÕES DO CLIENTE/i);
  const cliente = section(text, /INFORMAÇÕES DO CLIENTE/i, /INFORMAÇÕES DO RESPONSÁVEL/i);
  const acomp = section(text, /INFORMAÇÕES DO RESPONSÁVEL/i, /INFORMAÇÕES DO PRODUTO/i);
  const responsavel = section(cliente, /Responsável Legal/i);

  const marcado = text.match(/[☒☑✓✔■]\s*Consultoria em (Manufatura Enxuta|Eficiência Energética)/i)?.[1] ?? "";
  const objeto: PropostaObjeto = /manufatura/i.test(marcado) ? "manufatura" : /energ/i.test(marcado) ? "energia" : "";

  const metaRe = objeto === "energia"
    ? /Redução de (\d+(?:[.,]\d+)?)\s*%\s*do consumo/i
    : /Aumento de (\d+(?:[.,]\d+)?)\s*%\s*de produtividade/i;

  const porteMatch = text.match(/\(\s*[Xx]\s*\)\s*Sou uma (Micro|Pequena)/i)?.[1] ?? "";

  return {
    ...emptyProposta,
    numero: pick(text, /N[º°o]\.? da Proposta:\s*(\S+)/i),
    dataEmissao: pick(text, /Data Emiss[ãa]o:\s*(\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{4})/i).replace(/\s/g, ""),
    validade: pick(text, /Validade:\s*(.+?)\s+(?:Nome Contato|INFORMAÇÕES)/i),
    objeto,
    unidadeSenai: pick(senai, /Unidade\/IST Emissora:\s*(.+?)\s+Revis[ãa]o:/i),
    contatoSenai: pick(senai, /Nome Contato:\s*(.+?)\s+Telefone:/i),
    contatoSenaiTelefone: pick(senai, new RegExp("Telefone:\\s*" + PHONE.source, "i")),
    contatoSenaiEmail: pick(senai, new RegExp("E-?\\s*mail:\\s*" + EMAIL.source, "i")),
    razaoSocial: pick(cliente, /Raz[ãa]o Social:\s*(.+?)\s+CNPJ:/i),
    cnpj: pick(cliente, /CNPJ:\s*([\d./-]{14,18})/i),
    cnae: pick(cliente, /CNAE:\s*([\d./-]+)/i),
    segmento: pick(cliente, /Segmento\s+Industrial:\s*(.+?)\s+N[úu]mero de\s+Funcion[áa]rios:/i),
    funcionarios: Number(pick(cliente, /Funcion[áa]rios:\s*(\d+)/i)) || 0,
    endereco: pick(cliente, /Endereço:\s*(.+?)\s+Cidade:/i),
    cidade: pick(cliente, /Cidade:\s*(.+?)\s+UF:/i),
    uf: pick(cliente, /UF:\s*([A-Z]{2})\b/),
    responsavelLegal: pick(cliente, /Responsável Legal:\s*(.+?)\s+CPF:/i),
    responsavelCargo: pick(cliente, /Cargo:\s*(.+?)\s+Telefone:/i),
    responsavelTelefone: pick(responsavel, new RegExp("Telefone:\\s*" + PHONE.source, "i")),
    responsavelEmail: pick(responsavel, new RegExp("E-?\\s*mail:\\s*" + EMAIL.source, "i")),
    acompanhamentoNome: pick(acomp, /Nome Contato:\s*(.+?)\s+Setor:/i),
    acompanhamentoSetor: pick(acomp, /Setor:\s*(.+?)\s+Telefone:/i),
    acompanhamentoTelefone: pick(acomp, new RegExp("Telefone:\\s*" + PHONE.source, "i")),
    acompanhamentoEmail: pick(acomp, new RegExp("E-?\\s*mail:\\s*" + EMAIL.source, "i")),
    prazoDias: Number(pick(text, /prazo de até\s*(\d+)/i)) || 0,
    metaPercentual: Number(pick(text, metaRe).replace(",", ".")) || 0,
    porte: porteMatch ? (porteMatch.toLowerCase() as "micro" | "pequena") : "",
  };
}

/** Quantos dos campos principais foram encontrados; usado para avisar quando o PDF não é do modelo esperado. */
export function camposEncontrados(p: PropostaData) {
  const principais: (keyof PropostaData)[] = ["numero", "razaoSocial", "cnpj", "segmento", "funcionarios", "cidade", "objeto"];
  return principais.filter(k => Boolean(p[k])).length;
}

/** Extrai o texto do PDF com pdf.js, mantendo uma linha por linha visual da página. */
export async function extractPdfText(file: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let current = "";
    let lastY: number | null = null;
    let lastEnd = 0;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const [, , , , x, y] = item.transform as number[];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(current);
        current = "";
      } else if (current && x - lastEnd > 1 && !current.endsWith(" ") && !item.str.startsWith(" ")) {
        current += " ";
      }
      current += item.str;
      lastY = y;
      lastEnd = x + (item.width ?? 0);
    }
    lines.push(current);
    pages.push(lines.filter(l => l.trim()).join("\n"));
  }
  await doc.destroy();
  return pages.join("\n");
}
