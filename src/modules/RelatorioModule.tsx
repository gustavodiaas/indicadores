import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import type { AppState } from "@/store/useAppStore";
import { buildRelatorioTargets, displayValue } from "@/lib/relatorio-map";
import { fillWorkbook, type FillResult } from "@/lib/xlsx-fill";
import { deleteTemplate, loadTemplate, saveTemplate, type StoredTemplate } from "@/lib/template-store";

interface Props {
  state: AppState;
}

const isXlsx = (f: File) => f.name.toLowerCase().endsWith(".xlsx");

export function RelatorioModule({ state }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<StoredTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<FillResult[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const targets = useMemo(() => buildRelatorioTargets(state), [state]);

  useEffect(() => {
    loadTemplate().then(t => { if (t) setTemplate(t); }).finally(() => setLoading(false));
  }, []);

  // Prévia: onde cada valor vai cair na versão carregada.
  useEffect(() => {
    if (!template) { setPreview([]); return; }
    let alive = true;
    setPreviewing(true);
    fillWorkbook(template.data, targets, true)
      .then(r => { if (alive) setPreview(r.results); })
      .finally(() => { if (alive) setPreviewing(false); })
      .catch(() => { if (alive) setError("Não consegui ler esta planilha. Verifique se é o arquivo .xlsx do Relatório de Atendimento."); });
    return () => { alive = false; };
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
      const cliente = (state.proposta?.razaoSocial || state.resumo.nomeEmpresa || "").replace(/[\\/:*?"<>|]+/g, "").trim();
      const base = template.name.replace(/\.xlsx$/i, "");
      const url = URL.createObjectURL(new Blob([file as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}${cliente ? ` - ${cliente}` : ""}.xlsx`;
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
              {missing.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Não encontrei nesta versão: {missing.map(m => m.target.campo).join(", ")}.
                </p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" onClick={download} disabled={busy || previewing || found.length === 0}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-50 transition-colors">
              <Download className="h-4 w-4" /> Baixar relatório preenchido
            </button>
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
