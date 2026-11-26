// Coloca uma imagem (JPEG) dentro de uma célula/área mesclada de uma planilha .xlsx,
// mexendo só nas partes necessárias: a camada de desenhos da aba, os vínculos e o arquivo da imagem.
import type JSZip from "jszip";

const MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const DRAWING_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing";
const IMAGE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
const EMU_PER_PX = 9525;

export interface SheetImage {
  data: Uint8Array;
  width: number;
  height: number;
}

const colToNum = (col: string) => [...col].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
const splitRef = (ref: string) => {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  return m ? { col: colToNum(m[1]), row: Number(m[2]) } : { col: 1, row: 1 };
};

const byTag = (el: Document | Element, tag: string) => Array.from(el.getElementsByTagNameNS(MAIN_NS, tag));

/** Largura de coluna do Excel (em caracteres) → pixels. */
const colPx = (width: number) => Math.trunc(((256 * width + Math.trunc(128 / 7)) / 256) * 7);
const rowPx = (points: number) => (points * 96) / 72;

/** Área (início e fim) da célula, considerando a mesclagem que a contém. */
function mergedArea(doc: Document, ref: string) {
  const start = splitRef(ref);
  for (const m of byTag(doc, "mergeCell")) {
    const [a, b] = (m.getAttribute("ref") ?? "").split(":");
    if (!b) continue;
    const p = splitRef(a), q = splitRef(b);
    if (start.col >= p.col && start.col <= q.col && start.row >= p.row && start.row <= q.row) return { from: p, to: q };
  }
  return { from: start, to: start };
}

function columnWidths(doc: Document) {
  const fmt = byTag(doc, "sheetFormatPr")[0];
  const defaultWidth = Number(fmt?.getAttribute("defaultColWidth")) || (Number(fmt?.getAttribute("baseColWidth")) || 8) + 0.71;
  const custom = byTag(doc, "col").map(c => ({ min: Number(c.getAttribute("min")), max: Number(c.getAttribute("max")), width: Number(c.getAttribute("width")) }));
  return (col: number) => colPx(custom.find(c => col >= c.min && col <= c.max)?.width ?? defaultWidth);
}

function rowHeights(doc: Document) {
  const fmt = byTag(doc, "sheetFormatPr")[0];
  const defaultHeight = Number(fmt?.getAttribute("defaultRowHeight")) || 15;
  const custom = new Map<number, number>();
  for (const r of byTag(doc, "row")) {
    const ht = Number(r.getAttribute("ht"));
    if (ht) custom.set(Number(r.getAttribute("r")), ht);
  }
  return (row: number) => rowPx(custom.get(row) ?? defaultHeight);
}

/** Posição (índice 1-based e deslocamento em px) a `offset` px a partir do início da célula `start`. */
function walk(size: (i: number) => number, start: number, offset: number) {
  let i = start;
  let rest = offset;
  while (rest >= size(i) && size(i) > 0) { rest -= size(i); i++; }
  return { index: i, off: rest };
}

const resolve = (base: string, target: string) => {
  if (target.startsWith("/")) return target.slice(1);
  const parts = base.split("/").slice(0, -1);
  for (const seg of target.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
};
const relsPathOf = (part: string) => part.replace(/([^/]+)$/, "_rels/$1.rels");
const emptyRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${PKG_REL_NS}"></Relationships>`;

function nextRelId(relsXml: string) {
  const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map(m => Number(m[1]));
  return `rId${Math.max(0, ...ids) + 1}`;
}
const addRel = (relsXml: string, id: string, type: string, target: string) =>
  relsXml.replace("</Relationships>", `<Relationship Id="${id}" Type="${type}" Target="${target}"/></Relationships>`);

/** Elementos que vêm depois de <drawing> no XML da aba (a ordem é obrigatória). */
const AFTER_DRAWING = ["legacyDrawing", "legacyDrawingHF", "drawingHF", "picture", "oleObjects", "controls", "webPublishItems", "tableParts", "extLst"];

async function ensureDrawing(zip: JSZip, sheetPath: string, sheetDoc: Document): Promise<string> {
  const sheetRelsPath = relsPathOf(sheetPath);
  let sheetRels = (await zip.file(sheetRelsPath)?.async("string")) ?? emptyRels;
  const existing = /<Relationship [^>]*Type="[^"]*\/drawing"[^>]*>/.exec(sheetRels)?.[0];
  if (existing) return resolve(sheetPath, /Target="([^"]+)"/.exec(existing)![1]);

  // A aba não tem camada de desenhos: cria uma.
  const used = Object.keys(zip.files).map(f => /^xl\/drawings\/drawing(\d+)\.xml$/.exec(f)?.[1]).filter(Boolean).map(Number);
  const drawingPath = `xl/drawings/drawing${Math.max(0, ...used) + 1}.xml`;
  zip.file(drawingPath, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"></xdr:wsDr>`);
  const id = nextRelId(sheetRels);
  sheetRels = addRel(sheetRels, id, DRAWING_REL, `../drawings/${drawingPath.split("/").pop()}`);
  zip.file(sheetRelsPath, sheetRels);

  const ct = await zip.file("[Content_Types].xml")!.async("string");
  zip.file("[Content_Types].xml", ct.replace("</Types>", `<Override PartName="/${drawingPath}" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`));

  const root = sheetDoc.documentElement;
  if (!root.getAttribute("xmlns:r")) root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:r", REL_NS);
  const drawing = sheetDoc.createElementNS(MAIN_NS, "drawing");
  drawing.setAttributeNS(REL_NS, "r:id", id);
  const before = Array.from(root.children).find(c => AFTER_DRAWING.includes(c.localName));
  root.insertBefore(drawing, before ?? null);
  return drawingPath;
}

/**
 * Insere a imagem centralizada na área (mesclada) da célula `ref`, sem distorcer.
 * `sheetDoc` é o XML da aba já carregado (pode receber a tag <drawing>); quem chama grava a aba depois.
 */
export async function addPictureToCell(zip: JSZip, sheetPath: string, sheetDoc: Document, ref: string, image: SheetImage, name: string) {
  const { from, to } = mergedArea(sheetDoc, ref);
  const colW = columnWidths(sheetDoc);
  const rowH = rowHeights(sheetDoc);
  let areaW = 0, areaH = 0;
  for (let c = from.col; c <= to.col; c++) areaW += colW(c);
  for (let r = from.row; r <= to.row; r++) areaH += rowH(r);

  const margin = 10;
  const scale = Math.min((areaW - margin * 2) / image.width, (areaH - margin * 2) / image.height);
  const w = Math.max(1, image.width * scale);
  const h = Math.max(1, image.height * scale);
  const offX = (areaW - w) / 2;
  const offY = (areaH - h) / 2;
  const start = { c: walk(colW, from.col, offX), r: walk(rowH, from.row, offY) };
  const end = { c: walk(colW, from.col, offX + w), r: walk(rowH, from.row, offY + h) };
  const emu = (px: number) => Math.round(px * EMU_PER_PX);

  // Arquivo da imagem
  const usedMedia = Object.keys(zip.files).map(f => /^xl\/media\/image(\d+)\.\w+$/.exec(f)?.[1]).filter(Boolean).map(Number);
  const mediaName = `image${Math.max(0, ...usedMedia) + 1}.jpeg`;
  zip.file(`xl/media/${mediaName}`, image.data);
  let ct = await zip.file("[Content_Types].xml")!.async("string");
  if (!/Extension="jpeg"/i.test(ct)) {
    ct = ct.replace("</Types>", `<Default Extension="jpeg" ContentType="image/jpeg"/></Types>`);
    zip.file("[Content_Types].xml", ct);
  }

  // Vínculo da camada de desenhos com a imagem
  const drawingPath = await ensureDrawing(zip, sheetPath, sheetDoc);
  const drawingRelsPath = relsPathOf(drawingPath);
  let drawingRels = (await zip.file(drawingRelsPath)?.async("string")) ?? emptyRels;
  const relId = nextRelId(drawingRels);
  drawingRels = addRel(drawingRels, relId, IMAGE_REL, `../media/${mediaName}`);
  zip.file(drawingRelsPath, drawingRels);

  // A figura na camada de desenhos
  let drawing = await zip.file(drawingPath)!.async("string");
  const prefix = /<(\w+):wsDr\b/.exec(drawing)?.[1] ?? "xdr";
  const aPrefix = /xmlns:(\w+)="http:\/\/schemas\.openxmlformats\.org\/drawingml\/2006\/main"/.exec(drawing)?.[1];
  if (!aPrefix) drawing = drawing.replace(new RegExp(`<${prefix}:wsDr\\b`), `<${prefix}:wsDr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"`);
  const a = aPrefix ?? "a";
  const shapeId = Math.max(1, ...[...drawing.matchAll(/cNvPr id="(\d+)"/g)].map(m => Number(m[1]))) + 1;
  const x = prefix;
  const anchor =
    `<${x}:twoCellAnchor editAs="oneCell">` +
    `<${x}:from><${x}:col>${start.c.index - 1}</${x}:col><${x}:colOff>${emu(start.c.off)}</${x}:colOff><${x}:row>${start.r.index - 1}</${x}:row><${x}:rowOff>${emu(start.r.off)}</${x}:rowOff></${x}:from>` +
    `<${x}:to><${x}:col>${end.c.index - 1}</${x}:col><${x}:colOff>${emu(end.c.off)}</${x}:colOff><${x}:row>${end.r.index - 1}</${x}:row><${x}:rowOff>${emu(end.r.off)}</${x}:rowOff></${x}:to>` +
    `<${x}:pic><${x}:nvPicPr><${x}:cNvPr id="${shapeId}" name="${name.replace(/"/g, "")}"/><${x}:cNvPicPr><${a}:picLocks noChangeAspect="1"/></${x}:cNvPicPr></${x}:nvPicPr>` +
    `<${x}:blipFill><${a}:blip xmlns:r="${REL_NS}" r:embed="${relId}"/><${a}:stretch><${a}:fillRect/></${a}:stretch></${x}:blipFill>` +
    `<${x}:spPr><${a}:xfrm><${a}:off x="0" y="0"/><${a}:ext cx="${emu(w)}" cy="${emu(h)}"/></${a}:xfrm><${a}:prstGeom prst="rect"><${a}:avLst/></${a}:prstGeom></${x}:spPr></${x}:pic>` +
    `<${x}:clientData/></${x}:twoCellAnchor>`;
  drawing = drawing.replace(new RegExp(`</${prefix}:wsDr>\\s*$`), `${anchor}</${prefix}:wsDr>`);
  zip.file(drawingPath, drawing);
}
