import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Download, FileSpreadsheet, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { emptyRelatorio, type AppState, type RelatorioData } from "@/store/useAppStore";
import { buildRelatorioTargets, displayValue, missingRequired, pendingTexts, relatorioLinha, relatorioMotivo, reportFileName } from "@/lib/relatorio-map";
import { fillWorkbook, type ClearedCell, type FillResult } from "@/lib/xlsx-fill";
import { deleteTemplate, loadTemplate, saveTemplate, type StoredTemplate } from "@/lib/template-store";

interface Props {
  state: AppState;
  onChange: (d: Partial<RelatorioData>) => void;
}

const isXlsx = (f: File) => f.name.toLowerCase().endsWith(".xlsx");

const fieldClass = "w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1D4ED8] transition-all";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 pl-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function RelatorioModule({ state, onChange }: Props) {
  const rel = { ...emptyRelatorio, ...(state.relatorio ?? {}) };
  const missingFields = useMemo(() => missingRequired(state), [state]);
  const extrasPreenchidos = [...(rel.consultores ?? []).slice(1), ...(rel.outrasUOs ?? [])].filter(v => v?.trim()).length;
  const [showExtras, setShowExtras] = useState(extrasPreenchidos > 0);
  const setList = (key: "consultores" | "outrasUOs", size: number, i: number, v: string) => {
    const list = Array.from({ length: size }, (_, n) => rel[key]?.[n] ?? "");
    list[i] = v;
    onChange({ [key]: list } as Partial<RelatorioData>);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<StoredTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<FillResult[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [cleared, setCleared] = useState<ClearedCell[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  const targets = useMemo(() => buildRelatorioTargets(state), [state]);

  useEffect(() => {
    loadTemplate().then(t => { if (t) setTemplate(t); }).finally(() => setLoading(false));
  }, []);

  // Prévia: onde cada valor vai cair na versão carregada.
  useEffect(() => {
    if (!template) { setPreview([]); setCleared([]); return; }
    let alive = true;
    setPreviewing(true);
    // Espera a digitação parar antes de reler a planilha.
    const timer = setTimeout(() => {
      fillWorkbook(template.data, targets, true)
        .then(r => { if (alive) { setPreview(r.results); setCleared(r.cleared); } })
        .finally(() => { if (alive) setPreviewing(false); })
        .catch(() => { if (alive) setError("Não consegui ler esta planilha. Verifique se é o arquivo .xlsx do Relatório de Atendimento."); });
    }, 400);
    return () => { alive = false; clearTimeout(timer); };
  }, [template, targets]);

  const readFile = async (file: File) => {
    setError("");
    setDownloaded(false);
    if (!isXlsx(file)) { setError("Carregue o relatório em Excel (.xlsx)."); return; }
    setBusy(true);
    try {
      const data = await file.arrayBuffer();
      await fillWorkbook(data, [], true); // confere se o arquivo abre
      const t = { name: file.name, savedAt: new Date().toISOString(), data };
      setTemplate(t);
      await saveTemplate(t).catch(() => undefined);
    } catch {
      setError("Não consegui abrir esta planilha. Verifique se é o arquivo .xlsx do Relatório de Atendimento e se não está protegido por senha de abertura.");
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!template) return;
    setBusy(true);
    setError("");
    try {
      const { file } = await fillWorkbook(template.data, targets);
      if (!file) return;
      const url = URL.createObjectURL(new Blob([file as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFileName(state, template.name);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloaded(true);
    } catch {
      setError("Não foi possível gerar o relatório preenchido.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    await deleteTemplate().catch(() => undefined);
    setTemplate(null);
    setDownloaded(false);
  };

  const pending = useMemo(() => pendingTexts(state, targets), [state, targets]);
  const found = preview.filter(r => r.cells.length > 0);
  const missing = preview.filter(r => r.cells.length === 0);

  return (
    <div className="space-y-6">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f); }}
        className={`input-section flex flex-col items-center justify-center gap-3 text-center py-10 border-2 border-dashed transition-colors ${dragging ? "border-[#1D4ED8] bg-blue-50/60 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}
      >
        {busy || loading ? <Loader2 className="h-9 w-9 animate-spin text-[#1D4ED8] dark:text-[#60A5FA]" /> : <FileSpreadsheet className="h-9 w-9 text-[#1D4ED8] dark:text-[#60A5FA]" />}
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {template ? "Carregar outra versão do relatório" : "Arraste aqui o Relatório de Atendimento (.xlsx)"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use a versão enviada pelo Departamento Nacional. Só as células em amarelo claro (creme) são preenchidas.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="h-9 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-60 transition-colors">
          Selecionar planilha
        </button>
        <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" aria-label="Arquivo do relatório em Excel"
          onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" /> A planilha fica guardada só neste navegador e não é enviada para nenhum servidor.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="input-section space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">Dados do relatório</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400"><span className="text-rose-500">*</span> obrigatório para baixar</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Linha de produção, processo e/ou produto (onde foi realizada a consultoria)" required>
            <input className={fieldClass} value={rel.linha ?? relatorioLinha(state)} onChange={e => onChange({ linha: e.target.value })} />
          </Field>
          <Field label="Família de produto (onde foi realizada a consultoria)" required>
            <input className={fieldClass} value={rel.familia} onChange={e => onChange({ familia: e.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Motivo para a seleção da linha" required>
              <textarea rows={2} className={`${fieldClass} h-auto py-2 resize-y`} value={rel.motivo ?? relatorioMotivo(state)} onChange={e => onChange({ motivo: e.target.value })} />
            </Field>
          </div>
          <Field label="Data de aceitação" required>
            <input type="date" className={fieldClass} value={rel.dataAceitacao} onChange={e => onChange({ dataAceitacao: e.target.value })} />
          </Field>
          <Field label="Data de execução" required>
            <input type="date" className={fieldClass} value={rel.dataExecucao} onChange={e => onChange({ dataExecucao: e.target.value })} />
          </Field>
          <Field label="Data de encerramento técnico" required>
            <input type="date" className={fieldClass} value={rel.dataEncerramento} onChange={e => onChange({ dataEncerramento: e.target.value })} />
          </Field>
          <Field label="Consultor(a) SENAI" required>
            <input className={fieldClass} value={rel.consultores?.[0] ?? ""} onChange={e => setList("consultores", 5, 0, e.target.value)} />
          </Field>
        </div>
        <button type="button" onClick={() => setShowExtras(v => !v)} aria-expanded={showExtras}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D4ED8] dark:text-[#60A5FA] hover:underline">
          {showExtras ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showExtras ? "Ocultar" : "Adicionar"} outros consultores ou UOs (se aplicável){!showExtras && extrasPreenchidos > 0 ? ` · ${extrasPreenchidos} preenchido${extrasPreenchidos > 1 ? "s" : ""}` : ""}
        </button>
        {showExtras && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Field key={i} label="Consultor(a) SENAI (se aplicável)">
              <input className={fieldClass} value={rel.consultores?.[i] ?? ""} onChange={e => setList("consultores", 5, i, e.target.value)} />
            </Field>
          ))}
          {[0, 1].map(i => (
            <Field key={`uo${i}`} label="Outra UO que realizou a consultoria (se aplicável)">
              <input className={fieldClass} value={rel.outrasUOs?.[i] ?? ""} onChange={e => setList("outrasUOs", 2, i, e.target.value)} />
            </Field>
          ))}
        </div>
        )}
      </div>

      {template && (
        <div className="input-section space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">Preenchimento automático</h3>
            <span className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Versão: <span className="font-medium text-slate-700 dark:text-slate-200">{template.name}</span>
              <button type="button" onClick={remove} aria-label="Remover a versão carregada" title="Remover a versão carregada"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>

          {previewing && preview.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Lendo a planilha…</p>
          ) : targets.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ainda não há dados para levar ao relatório. Importe a Proposta e preencha os módulos (Resumo, Produtividade, Payback…).
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estes dados do app vão para a planilha. O restante você completa no Excel. Fórmulas, gráficos e proteção da planilha não são alterados.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      <th className="py-2 pr-3">Aba</th>
                      <th className="py-2 pr-3">Campo</th>
                      <th className="py-2 pr-3">Valor</th>
                      <th className="py-2 pr-3">Origem</th>
                      <th className="py-2">Célula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {found.map(({ target: t, cells }) => (
                      <tr key={t.id} className="border-t border-slate-100 dark:border-white/5 align-top">
                        <td className="py-2.5 pr-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">{t.sheet}</td>
                        <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{t.campo}</td>
                        <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-100 break-words max-w-[320px]">{displayValue(t)}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{t.origem}</td>
                        <td className="py-2.5 whitespace-nowrap text-slate-400 dark:text-slate-500">{cells.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pending.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p className="font-medium text-slate-600 dark:text-slate-300">Textos que ainda não vão para o relatório:</p>
                  <ul className="mt-1 list-disc pl-5 space-y-0.5">
                    {pending.map(p => <li key={p.campo}>{p.campo}: {p.falta}.</li>)}
                  </ul>
                </div>
              )}
              {missing.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Não encontrei nesta versão: {missing.map(m => m.target.campo).join(", ")}.
                </p>
              )}
            </>
          )}

          {cleared.length > 0 && (
            <details className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <summary className="cursor-pointer font-medium">
                Esta planilha tem dados de outro atendimento: {cleared.length} {cleared.length === 1 ? "célula será limpa" : "células serão limpas"} ao gerar. Os textos de instrução do modelo são mantidos.
              </summary>
              <ul className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
                {cleared.map(c => (
                  <li key={`${c.sheet}!${c.ref}`}><span className="text-amber-600/80 dark:text-amber-400/80">{c.sheet} {c.ref}:</span> {c.text.length > 80 ? `${c.text.slice(0, 80)}…` : c.text}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" onClick={download} disabled={busy || previewing || missingFields.length > 0 || (found.length === 0 && cleared.length === 0)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-50 transition-colors">
              <Download className="h-4 w-4" /> Baixar relatório preenchido
            </button>
            {missingFields.length > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400">
                Para baixar, preencha em "Dados do relatório": {missingFields.join(", ")}.
              </span>
            )}
            {downloaded && (
              <span role="status" className="inline-flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="h-4 w-4" /> {found.length} {found.length === 1 ? "campo preenchido" : "campos preenchidos"}.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
