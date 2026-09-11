import { useState, useRef, useEffect } from "react";
import { Copy, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="relative bg-white/80 dark:bg-[#1C1C1E]/90 p-5 md:p-6 border border-black/[0.04] dark:border-white/[0.07] rounded-[20px] shadow-[0_14px_38px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      {/* Botões de ação */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {override !== null && !editing && (
          <Tooltip delayDuration={180}>
            <TooltipTrigger asChild>
              <button onClick={handleRestore} aria-label="Restaurar texto original" className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors border border-amber-100 dark:border-amber-500/20 text-xs font-medium px-2.5">
                Restaurar
              </button>
            </TooltipTrigger>
            <TooltipContent>Restaurar texto original</TooltipContent>
          </Tooltip>
        )}
        {!editing && (
          <Tooltip delayDuration={180}>
            <TooltipTrigger asChild>
              <button onClick={handleOpenEdit} aria-label="Editar texto" className="p-2 rounded-[10px] bg-black/[0.035] dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 hover:bg-black/[0.07] dark:hover:bg-white/[0.12] hover:text-slate-900 dark:hover:text-white transition-colors border border-black/[0.05] dark:border-white/10">
                <Pencil className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar texto</TooltipContent>
          </Tooltip>
        )}
        {!editing && (
          <Tooltip delayDuration={180}>
            <TooltipTrigger asChild>
              <button onClick={handleCopy} aria-label={copied ? "Texto copiado" : "Copiar texto"} className="p-2 rounded-[10px] bg-black/[0.035] dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 hover:bg-black/[0.07] dark:hover:bg-white/[0.12] hover:text-slate-900 dark:hover:text-white transition-colors border border-black/[0.05] dark:border-white/10">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Texto copiado" : "Copiar texto"}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Título */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 tracking-tight border-b border-black/[0.06] dark:border-white/10 pb-3 pr-28">
        {title}
        {override !== null && (
          <span className="ml-2 text-amber-500 font-bold">· editado</span>
        )}
      </h4>

      {/* Modo visualização */}
      {!editing && (
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-6 whitespace-pre-wrap">
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
            className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-black/[0.08] dark:border-white/10 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-[13px] leading-relaxed outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] transition-colors resize-y"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.07] text-slate-600 dark:text-slate-300 hover:bg-black/[0.07] dark:hover:bg-white/[0.12] transition-colors border border-black/[0.05] dark:border-white/10 text-xs font-medium"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#FF6B00] text-white hover:bg-[#E85F00] transition-colors text-xs font-semibold shadow-[0_4px_12px_rgba(255,107,0,0.20)]"
            >
              <Check className="h-3.5 w-3.5" /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
