// Botões de ação padrão, iguais aos da barra do topo (Salvar / Abrir / Baixar Word).
export const actionButton = {
  secondary:
    "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-black/[0.07] dark:hover:bg-white/[0.13] rounded-[10px] transition-colors active:scale-[0.98] disabled:opacity-50",
  primary:
    "inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#1D4ED8] text-white hover:bg-[#1E40AF] rounded-[10px] transition-colors shadow-[0_4px_14px_rgba(29,78,216,0.24)] active:scale-[0.98] disabled:opacity-50",
} as const;
