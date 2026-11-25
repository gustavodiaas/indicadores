import { Home, FileText, FileUp, ChartNoAxesColumnIncreasing, ChartGantt, Workflow, TrendingUp, Coins, Route, BadgeCheck, Cog, Timer, Ruler, ClipboardList, PanelsTopLeft, BookOpen, type LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/store/useAppStore";

export const moduleGroups = [
  { id: "project", title: "Projeto e planejamento", description: "Organize o contexto, as ações e a solução de problemas.", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "process", title: "Processos e operação", description: "Entenda o fluxo, os tempos e o uso dos recursos.", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "results", title: "Resultados e desempenho", description: "Compare os indicadores e avalie o impacto das melhorias.", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
] as const;

type NavigationModule = {
  key: ModuleKey;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  group?: typeof moduleGroups[number]["id"];
};

// One icon and label source for the sidebar and Home.
export const navigationModules: NavigationModule[] = [
  { key: "home", label: "Home", title: "Home", description: "Visão geral dos módulos", icon: Home },
  { key: "proposta", label: "Proposta", title: "Proposta comercial", description: "Importe o PDF da proposta e preencha os módulos automaticamente.", icon: FileUp, group: "project" },
  { key: "resumo", label: "Resumo", title: "Resumo do projeto", description: "Dados da empresa, contexto e laudo técnico.", icon: FileText, group: "project" },
  { key: "gbo", label: "GBO", title: "GBO", description: "Balanceamento de operações e identificação de processos restritivos.", icon: ChartNoAxesColumnIncreasing, group: "process" },
  { key: "produtividade", label: "Produtividade", title: "Produtividade", description: "Produção por hora e ganhos de produtividade.", icon: TrendingUp, group: "results" },
  { key: "payback", label: "Payback", title: "Payback", description: "Investimento, economia e prazo de retorno.", icon: Coins, group: "results" },
  { key: "movimentacao", label: "Movimentação", title: "Movimentação", description: "Percursos, distâncias e tempos de transporte.", icon: Route, group: "process" },
  { key: "qualidade", label: "Qualidade", title: "Qualidade", description: "Peças conformes, perdas e redução de refugos.", icon: BadgeCheck, group: "results" },
  { key: "disponibilidade", label: "Disponibilidade", title: "Disponibilidade", description: "Paradas e tempo disponível das máquinas.", icon: Cog, group: "results" },
  { key: "leadtime", label: "Lead Time", title: "Lead Time", description: "Tempo total de atravessamento do processo.", icon: Timer, group: "process" },
  { key: "area", label: "Área", title: "Área de trabalho", description: "Espaço ocupado, layout e economia em m².", icon: Ruler, group: "process" },
  { key: "planoAcao", label: "5W2H", title: "Plano de ação 5W2H", description: "Ações, responsáveis e prazos de execução.", icon: ClipboardList, group: "project" },
  { key: "a3", label: "A3", title: "Modelo A3", description: "Análise estruturada e solução de problemas.", icon: PanelsTopLeft, group: "project" },
  { key: "gantt", label: "Gantt", title: "Gantt · Trabalho padronizado", description: "Linha do tempo, atividades e análise de vídeos.", icon: ChartGantt, group: "process" },
  { key: "mfv", label: "MFV", title: "MFV · Mapeamento de Fluxo de Valor", description: "Estado atual, estados futuros e simulação do fluxo.", icon: Workflow, group: "process" },
  { key: "manual", label: "Manual", title: "Manual técnico", description: "Orientações para usar cada módulo.", icon: BookOpen },
];
