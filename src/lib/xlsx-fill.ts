// Preenche células de um .xlsx mexendo só no XML dessas células.
// Gráficos, imagens, fórmulas, proteção e formatação do restante ficam exatamente como vieram.
// Regra do Departamento Nacional: só células com fundo creme (amarelo claro) podem receber valor.
import JSZip from "jszip";
import type { CellValue, RelatorioTarget } from "@/lib/relatorio-map";
import { addPictureToCell } from "@/lib/xlsx-image";

/** Tons de amarelo claro usados nas células editáveis do modelo. */
export const CREAM_FILLS = new Set(["FFFFF7D6", "FFFEF2CB"]);

const MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export interface FillResult {
  target: RelatorioTarget;
  /** Células escritas, ex.: ["D22"]. Vazio quando o lugar não foi encontrado nesta versão. */
  cells: string[];
}

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim().replace(/\s*:$/, "");

const colToNum = (col: string) => [...col].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
const splitRef = (ref: string) => {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  return m ? { col: colToNum(m[1]), row: Number(m[2]) } : { col: 0, row: 0 };
};

const parse = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");
const serialize = (doc: Document) => new XMLSerializer().serializeToString(doc);
const byTag = (el: Document | Element, tag: string) => Array.from(el.getElementsByTagNameNS(MAIN_NS, tag));
const textOf = (el: Element) => byTag(el, "t").map(t => t.textContent ?? "").join("");

interface Cell { el: Element; ref: string; row: number; col: number; text: string; cream: boolean }

/** Nome da aba → caminho do XML dentro do pacote. */
async function sheetPaths(zip: JSZip): Promise<Map<string, { name: string; path: string }>> {
  const wb = parse(await zip.file("xl/workbook.xml")!.async("string"));
  const rels = parse(await zip.file("xl/_rels/workbook.xml.rels")!.async("string"));
  const targets = new Map<string, string>();
  for (const r of Array.from(rels.getElementsByTagName("Relationship"))) {
    const t = r.getAttribute("Target") ?? "";
    targets.set(r.getAttribute("Id") ?? "", t.startsWith("/") ? t.slice(1) : `xl/${t}`);
  }
  const out = new Map<string, { name: string; path: string }>();
  for (const s of byTag(wb, "sheet")) {
    const path = targets.get(s.getAttributeNS(REL_NS, "id") ?? "");
    const name = s.getAttribute("name") ?? "";
    if (path) out.set(normalize(name), { name, path });
  }
  return out;
}

/** Índices de estilo (atributo s da célula) cujo fundo é creme. */
async function creamStyles(zip: JSZip): Promise<Set<number>> {
  const styles = parse(await zip.file("xl/styles.xml")!.async("string"));
  const fills = byTag(byTag(styles, "fills")[0] ?? styles.documentElement, "fill").map(f => {
    const fg = byTag(f, "fgColor")[0];
    return (fg?.getAttribute("rgb") ?? "").toUpperCase();
  });
  const xfs = byTag(byTag(styles, "cellXfs")[0], "xf");
  const out = new Set<number>();
  xfs.forEach((xf, i) => { if (CREAM_FILLS.has(fills[Number(xf.getAttribute("fillId") ?? 0)] ?? "")) out.add(i); });
  return out;
}

async function sharedStrings(zip: JSZip): Promise<string[]> {
  const f = zip.file("xl/sharedStrings.xml");
  if (!f) return [];
  return byTag(parse(await f.async("string")), "si").map(textOf);
}

function readCells(doc: Document, strings: string[], cream: Set<number>): Cell[] {
  return byTag(doc, "c").map(el => {
    const ref = el.getAttribute("r") ?? "";
    const { row, col } = splitRef(ref);
    const t = el.getAttribute("t");
    const v = byTag(el, "v")[0]?.textContent ?? "";
    const text = t === "s" ? strings[Number(v)] ?? "" : t === "inlineStr" ? textOf(el) : v;
    return { el, ref, row, col, text, cream: cream.has(Number(el.getAttribute("s") ?? 0)) };
  }).filter(c => c.row > 0);
}

function writeCell(doc: Document, el: Element, value: CellValue) {
  while (el.firstChild) el.removeChild(el.firstChild);
  if (typeof value === "number") {
    el.removeAttribute("t");
    const v = doc.createElementNS(MAIN_NS, "v");
    v.textContent = String(value);
    el.appendChild(v);
  } else {
    el.setAttribute("t", "inlineStr");
    const is = doc.createElementNS(MAIN_NS, "is");
    const t = doc.createElementNS(MAIN_NS, "t");
    t.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
    t.textContent = value;
    is.appendChild(t);
    el.appendChild(is);
  }
}

function findLabel(cells: Cell[], label: string, fromRow = 0): Cell | undefined {
  const want = normalize(label);
  return cells
    .filter(c => !c.cream && c.row >= fromRow && c.text && normalize(c.text).startsWith(want))
    .sort((a, b) => a.row - b.row || a.col - b.col)[0];
}

const creamInRow = (cells: Cell[], row: number, minCol = 0) =>
  cells.filter(c => c.cream && c.row === row && c.col > minCol).sort((a, b) => a.col - b.col);

function locate(cells: Cell[], t: RelatorioTarget): { el: Element; ref: string; value: CellValue }[] {
  if (t.kind === "label") {
    const anchor = t.after ? findLabel(cells, t.after) : undefined;
    if (t.after && !anchor) return [];
    const lab = findLabel(cells, t.label, anchor ? anchor.row + 1 : 0); // abaixo do título da seção
    const target = lab && (t.side === "left"
      ? creamInRow(cells, lab.row).filter(c => c.col < lab.col).pop()
      : creamInRow(cells, lab.row, lab.col)[0]);
    return target ? [{ el: target.el, ref: target.ref, value: t.value }] : [];
  }
  if (t.kind === "block" || t.kind === "image") {
    const title = findLabel(cells, t.label);
    if (!title) return [];
    const target = cells
      .filter(c => c.cream && c.row > title.row && c.row <= title.row + 5)
      .sort((a, b) => a.row - b.row || a.col - b.col)[0];
    return target ? [{ el: target.el, ref: target.ref, value: t.kind === "block" ? t.value : "" }] : [];
  }
  const head = findLabel(cells, t.below);
  if (!head) return [];
  // Linhas seguidas com células creme logo abaixo do rótulo; cada uma é um espaço.
  let row = head.row + 1;
  for (let i = 0; i < t.index; i++, row++) if (!creamInRow(cells, row).length) return [];
  const slot = creamInRow(cells, row);
  if (!slot.length) return [];
  const out: { el: Element; ref: string; value: CellValue }[] = [];
  for (const { position, value } of t.values) {
    const c = position < 0 ? slot[slot.length + position] : slot[position];
    if (!c) return [];
    out.push({ el: c.el, ref: c.ref, value });
  }
  return out;
}

/**
 * Textos de instrução que o próprio modelo traz nas células creme ("Descreva…", "Inserir imagem…").
 * Ficam na planilha; algumas fórmulas dependem deles (ex.: "Indicar Unidade Aqui").
 */
const INSTRUCTION = /^(descreva|desceva|descrever|inserir|indicar unidade|aten[cç][aã]o|local em que|figura \d|nome da ferramenta|indicadores afetados|realizar a descri|gastos utilizados)/i;

export const isInstruction = (text: string) => INSTRUCTION.test(text.trim());

export interface ClearedCell { sheet: string; ref: string; text: string }

function clearCell(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
  el.removeAttribute("t");
}

/**
 * Escreve os valores no modelo e devolve o novo arquivo e onde cada valor foi parar.
 * As demais células creme com dados (de um atendimento anterior) são limpas;
 * os textos de instrução do modelo são mantidos.
 * Com `dryRun`, só localiza (para mostrar a prévia na tela).
 */
export async function fillWorkbook(data: ArrayBuffer | Uint8Array, targets: RelatorioTarget[], dryRun = false) {
  const zip = await JSZip.loadAsync(data);
  const [paths, cream, strings] = await Promise.all([sheetPaths(zip), creamStyles(zip), sharedStrings(zip)]);
  const results: FillResult[] = targets.map(target => ({ target, cells: [] }));
  const cleared: ClearedCell[] = [];

  for (const [sheet, { name, path }] of paths) {
    if (!zip.file(path)) continue;
    const doc = parse(await zip.file(path)!.async("string"));
    const cells = readCells(doc, strings, cream);
    const written = new Set<string>();
    let changed = false;

    for (const r of results.filter(x => normalize(x.target.sheet) === sheet)) {
      const spots = locate(cells, r.target);
      r.cells = spots.map(s => s.ref);
      for (const s of spots) {
        written.add(s.ref);
        if (dryRun) continue;
        if (r.target.kind === "image") {
          clearCell(s.el); // tira a instrução "Inserir imagem…" e põe a figura no lugar
          await addPictureToCell(zip, path, doc, s.ref, r.target.image, r.target.campo);
        } else {
          writeCell(doc, s.el, s.value);
        }
        changed = true;
      }
    }

    for (const c of cells) {
      if (!c.cream || written.has(c.ref) || !c.text.trim() || isInstruction(c.text)) continue;
      if (byTag(c.el, "f").length) continue; // nunca mexe em fórmula
      cleared.push({ sheet: name, ref: c.ref, text: c.text });
      if (!dryRun) { clearCell(c.el); changed = true; }
    }

    if (changed) zip.file(path, serialize(doc));
  }

  if (dryRun) return { results, cleared, file: null as Uint8Array | null };

  // Pede ao Excel para recalcular as fórmulas ao abrir (produtividade, resultados, SGT…).
  const wbPath = "xl/workbook.xml";
  const wb = parse(await zip.file(wbPath)!.async("string"));
  const calc = byTag(wb, "calcPr")[0];
  if (calc) { calc.setAttribute("fullCalcOnLoad", "1"); zip.file(wbPath, serialize(wb)); }

  const file = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return { results, cleared, file };
}
