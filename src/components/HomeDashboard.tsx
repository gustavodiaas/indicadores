import { useState } from "react";
import { ArrowUpRight, Search, X, LockKeyhole, SunMedium, MoonStar, Monitor } from "lucide-react";
import { moduleGroups, navigationModules } from "@/lib/module-navigation";
import type { ModuleKey } from "@/store/useAppStore";

type Theme = "light" | "dark" | "system";
interface Props {
  onSelect: (key: ModuleKey) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function HomeDashboard({ onSelect, theme, onThemeChange }: Props) {
  const [query, setQuery] = useState("");
  const modules = navigationModules.filter(m => m.group && normalize(`${m.title} ${m.description} ${m.label}`).includes(normalize(query.trim())));
  const manual = navigationModules.find(m => m.key === "manual")!;
  const ManualIcon = manual.icon;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 md:px-10 md:py-12 space-y-9">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-3">Consultoria Lean</p>
          <h1 className="text-3xl md:text-[40px] leading-tight font-semibold tracking-[-0.04em]">Seu espaço de análise.</h1>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">Do diagnóstico aos resultados: encontre as ferramentas para cada etapa do seu projeto.</p>
        </div>
        <fieldset className="shrink-0">
          <legend className="text-xs text-muted-foreground mb-2">Aparência</legend>
          <div className="flex gap-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] p-1">
            {([{ key: "light", label: "Claro", icon: SunMedium }, { key: "system", label: "Auto", icon: Monitor }, { key: "dark", label: "Escuro", icon: MoonStar }] as const).map(option => (
              <button key={option.key} aria-pressed={theme === option.key} onClick={() => onThemeChange(option.key)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${theme === option.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <option.icon aria-hidden="true" className="h-4 w-4" />{option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-y border-border/60 py-5">
        <div className="relative w-full md:max-w-md">
          <Search aria-hidden="true" className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input aria-label="Buscar módulos" placeholder="Buscar módulo ou atividade…" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-2xl border border-border/60 bg-card/80 pl-11 pr-11 py-3 text-sm placeholder:text-muted-foreground" />
          {query && <button aria-label="Limpar busca" onClick={() => setQuery("")} className="absolute right-2 top-2 p-2 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>}
        </div>
        <button onClick={() => onSelect("manual")} className="group inline-flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground self-start md:self-auto rounded-xl p-2">
          <ManualIcon aria-hidden="true" className="h-5 w-5" />Manual técnico<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-8">
        {moduleGroups.map(group => {
          const items = modules.filter(m => m.group === group.id);
          if (!items.length) return null;
          return (
            <section key={group.id} aria-labelledby={`home-${group.id}`}>
              <div className="mb-4">
                <h2 id={`home-${group.id}`} className="text-lg font-semibold tracking-tight">{group.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map(m => {
                  const Icon = m.icon;
                  return <button key={m.key} onClick={() => onSelect(m.key)} className="group flex gap-4 items-start rounded-[20px] border border-border/50 bg-card/80 p-5 text-left transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
                    <span className={`shrink-0 rounded-xl p-3 ${group.color}`}><Icon aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5">{m.title}</span><span className="block text-xs leading-5 text-muted-foreground mt-1.5">{m.description}</span></span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 mt-1 text-muted-foreground/60 group-hover:text-foreground" />
                  </button>;
                })}
              </div>
            </section>
          );
        })}
        {!modules.length && <p role="status" className="py-10 text-center text-muted-foreground">Nenhum módulo encontrado. Tente outro nome ou atividade.</p>}
      </div>
      <footer className="flex items-start gap-2 border-t border-border/60 pt-5 text-xs leading-5 text-muted-foreground">
        <LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5" /><p>Seus dados ficam neste navegador. Exporte uma cópia de segurança para guardar seu trabalho.</p>
      </footer>
    </div>
  );
}
