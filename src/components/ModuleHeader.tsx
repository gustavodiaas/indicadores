import type { ReactNode } from "react";
import { navigationModules } from "@/lib/module-navigation";
import type { ModuleKey } from "@/store/useAppStore";

interface Props {
  moduleKey: ModuleKey;
  /** Botões próprios do módulo (importar, baixar planilha, ajuda…), alinhados à direita. */
  actions?: ReactNode;
  /** Margem inferior; módulos que já espaçam o conteúdo com gap usam um valor menor. */
  spacing?: "default" | "compact";
}

/** Cabeçalho padrão de todos os módulos: título e descrição vêm do menu, para ficarem sempre iguais. */
export function ModuleHeader({ moduleKey, actions, spacing = "default" }: Props) {
  const module = navigationModules.find(m => m.key === moduleKey);
  if (!module) return null;
  return (
    <header className={`${spacing === "compact" ? "mb-2" : "mb-8"} border-b border-border/60 pb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{module.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{module.description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
