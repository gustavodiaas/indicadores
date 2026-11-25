import { useState } from "react";
import { ArrowUpRight, Search, X, LockKeyhole, SunMedium, MoonStar, Monitor, Check, FileUp, MapPin, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { moduleGroups, navigationModules } from "@/lib/module-navigation";
import { buildResults, isModuleFilled, trackedModules } from "@/lib/project-status";
import type { AppState, ModuleKey } from "@/store/useAppStore";

type Theme = "light" | "dark" | "system";
interface Props {
  onSelect: (key: ModuleKey) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  state?: AppState;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const objetoLabel: Record<string, string> = { manufatura: "Manufatura Enxuta", energia: "Eficiência Energética" };

function ThemeSwitch({ theme, onThemeChange }: Pick<Props, "theme" | "onThemeChange">) {
  return (
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
  );
}

function ProjectPanel({ state, onSelect }: { state: AppState; onSelect: Props["onSelect"] }) {
  const empresa = state.resumo.nomeEmpresa?.trim() || state.proposta?.razaoSocial?.trim();
  const local = [state.resumo.cidade || state.proposta?.cidade, state.proposta?.uf].filter(Boolean).join(" / ");
  const proposta = state.proposta;
  const done = trackedModules.filter(k => isModuleFilled(state, k));
  const pct = Math.round((done.length / trackedModules.length) * 100);
  const results = buildResults(state);
  const moduleByKey = (k: ModuleKey) => navigationModules.find(m => m.key === k);

  return (
    <section aria-label="Projeto em andamento" className="space-y-4">
      <div className="rounded-[24px] border border-border/50 bg-card/80 p-6 md:p-7">
        {empresa ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-blue-700 dark:text-blue-400">Projeto em andamento</p>
              <h2 className="mt-2 text-2xl md:text-[28px] leading-tight font-semibold tracking-[-0.03em] break-words">{empresa}</h2>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {local && <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="h-4 w-4" />{local}</span>}
                {proposta?.numero && <span className="inline-flex items-center gap-1.5"><FileText aria-hidden="true" className="h-4 w-4" />Proposta {proposta.numero}</span>}
                {proposta?.objeto && objetoLabel[proposta.objeto] && <span className="rounded-full bg-blue-700/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium">{objetoLabel[proposta.objeto]}</span>}
              </div>
            </div>
            <button onClick={() => onSelect("resumo")} className="self-start md:self-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Dados do projeto <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-blue-700 dark:text-blue-400">Novo projeto</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Comece pela proposta comercial</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Importe o PDF e os dados do cliente são preenchidos automaticamente.</p>
            </div>
            <button onClick={() => onSelect("proposta")} className="self-start md:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] transition-colors shadow-[0_4px_14px_rgba(29,78,216,0.24)]">
              <FileUp aria-hidden="true" className="h-4 w-4" /> Importar proposta
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2 rounded-[24px] border border-border/50 bg-card/80 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Andamento</h2>
            <span className="text-sm text-muted-foreground"><strong className="text-foreground font-semibold">{done.length}</strong> de {trackedModules.length} etapas</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden" role="progressbar" aria-label="Andamento do projeto" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-blue-700 dark:bg-blue-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {trackedModules.map(k => {
              const m = moduleByKey(k);
              if (!m) return null;
              const filled = done.includes(k);
              return (
                <li key={k}>
                  <button onClick={() => onSelect(k)} aria-label={`${m.label}: ${filled ? "com dados" : "pendente"}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filled ? "border-blue-700/25 bg-blue-700/10 text-blue-800 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300 hover:bg-blue-700/15 dark:hover:bg-blue-400/15" : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {filled ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />}
                    {m.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="xl:col-span-3 rounded-[24px] border border-border/50 bg-card/80 p-6">
          <h2 className="text-base font-semibold tracking-tight">Resultados</h2>
          {results.length ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map(r => {
                const TrendIcon = r.good ? TrendingUp : TrendingDown;
                return (
                  <button key={`${r.key}-${r.label}`} onClick={() => onSelect(r.key)} className="group text-left rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] p-4 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors min-w-0">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <TrendIcon aria-hidden="true" className={`h-3.5 w-3.5 ${r.good ? "text-blue-700 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`} />
                      {r.label}
                    </span>
                    <span className="mt-1.5 flex items-baseline gap-1 min-w-0">
                      <span className="text-xl font-semibold tracking-[-0.02em] truncate">{r.value}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{r.suffix}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Os resultados aparecem aqui quando você preencher o antes (T1) e o depois (T3) nos módulos de indicadores.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function HomeDashboard({ onSelect, theme, onThemeChange, state }: Props) {
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
        <ThemeSwitch theme={theme} onThemeChange={onThemeChange} />
      </header>

      {state && <ProjectPanel state={state} onSelect={onSelect} />}

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
                  const filled = state ? isModuleFilled(state, m.key) : false;
                  return <button key={m.key} onClick={() => onSelect(m.key)} className="group flex gap-4 items-start rounded-[20px] border border-border/50 bg-card/80 p-5 text-left transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
                    <span className={`relative shrink-0 rounded-xl p-3 ${group.color}`}>
                      <Icon aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" />
                      {filled && <span title="Com dados" className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 dark:bg-blue-500 text-white ring-2 ring-card"><Check aria-hidden="true" className="h-2.5 w-2.5" strokeWidth={3} /></span>}
                    </span>
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
        <LockKeyhole aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5" /><p>Seus dados ficam neste navegador. Use “Salvar” para guardar uma cópia do projeto em arquivo .lean.</p>
      </footer>
    </div>
  );
}
