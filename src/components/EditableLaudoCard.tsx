import { useState, useRef, useEffect } from "react";
import { Copy, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";

interface EditableLaudoCardProps {
  title: string;
  laudo: string;
  /** Texto que vai para o Word (pode ser diferente do laudo de tela) */
  laudoWord?: string;
}

export function EditableLaudoCard({ title, laudo, laudoWord }: EditableLaudoCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [override, setOverride] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quando os dados mudam e o usuário NÃO está editando, reseta o override
  // para que o texto gerado continue dinâmico
  const prevLaudo = useRef(laudo);
  useEffect(() => {
    if (prevLaudo.current !== laudo) {
      prevLaudo.current = laudo;
      // Se o texto gerado mudou e não há override ativo, nada a fazer.
      // Se há override, mantemos — o usuário decidiu manualmente.
    }
  }, [laudo]);

  // Ao abrir o editor, popula o draft com o texto atual (override ou gerado)
  const handleOpenEdit = () => {
    setDraft(override !== null ? override : laudo);
    setEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      // Move cursor para o fim
      const len = textareaRef.current?.value.length ?? 0;
      textareaRef.current?.setSelectionRange(len, len);
    }, 50);
  };

  const handleSave = () => {
    setOverride(draft);
    setEditing(false);
    toast.success("Texto salvo!");
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleRestore = () => {
    setOverride(null);
    setEditing(false);
    toast("Texto restaurado ao original.");
  };

  const textoExibido = override !== null ? override : laudo;
  // Para o Word: usa laudoWord como base se fornecido, senão usa laudo.
  // Se há override, substitui o texto base pelo override.
  const textoParaCopiar = override !== null
    ? (laudoWord ? laudoWord.replace(laudo, override) : override)
    : (laudoWord ?? laudo);

  const handleCopy = () => {
    navigator.clipboard.writeText(textoParaCopiar);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-white dark:bg-[#001833] p-6 border border-slate-100 dark:border-[#002D72]/30/60 rounded-2xl shadow-sm">
      {/* Botões de ação */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {override !== null && !editing && (
          <button
            onClick={handleRestore}
            title="Restaurar texto original"
            className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all shadow-sm border border-amber-100 dark:border-amber-900/40 text-[10px] font-bold uppercase tracking-wider px-2.5"
          >
            Restaurar
          </button>
        )}
        {!editing && (
          <button
            onClick={handleOpenEdit}
            title="Editar texto"
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#001022] text-slate-400 dark:text-slate-500 hover:bg-[#002D72] dark:hover:bg-[#002D72] hover:text-white transition-all shadow-sm border border-slate-100 dark:border-[#002D72]/30/40"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {!editing && (
          <button
            onClick={handleCopy}
            title="Copiar texto"
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#001022] text-slate-400 dark:text-slate-500 hover:bg-[#002D72] dark:hover:bg-[#002D72] hover:text-white transition-all shadow-sm border border-slate-100 dark:border-[#002D72]/30/40"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Título */}
      <h4 className="text-[10px] font-bold text-[#002D72] uppercase mb-4 tracking-widest border-b border-slate-100 dark:border-[#002D72]/30 pb-2 pr-28">
        {title}
        {override !== null && (
          <span className="ml-2 text-amber-500 font-bold">· editado</span>
        )}
      </h4>

      {/* Modo visualização */}
      {!editing && (
        <p className="text-[13px] text-slate-600 dark:text-slate-200 leading-relaxed text-justify whitespace-pre-wrap">
          {textoExibido}
        </p>
      )}

      {/* Modo edição */}
      {editing && (
        <div className="flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-[#002D72]/30 bg-slate-50 dark:bg-[#001022] text-slate-800 dark:text-slate-200 text-[13px] leading-relaxed outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all resize-y"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#001022] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#002D72]/30 transition-colors border border-slate-100 dark:border-[#002D72]/30 text-[11px] font-bold uppercase tracking-wider"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#002D72] text-white hover:bg-[#E55A00] transition-colors text-[11px] font-bold uppercase tracking-wider shadow-md"
            >
              <Check className="h-3.5 w-3.5" /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
