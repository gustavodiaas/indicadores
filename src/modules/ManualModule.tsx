import { useState } from "react";
import {
  BookOpen, FileText, GanttChartSquare, BarChart2, Calculator,
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, ClipboardList,
  LayoutTemplate, Settings2, AlertTriangle, Info, CheckCircle2, XCircle
} from "lucide-react";

// ---------- Blocos reutilizáveis ----------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-3 mt-8 first:mt-0">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5 border-b border-slate-100 dark:border-white/10 last:border-b-0">
      <span className="block text-[11px] font-bold text-[#002D72] dark:text-[#FF6B00] uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{children}</span>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-[#2C2C2E] rounded-xl p-4 border border-slate-100 dark:border-white/10 mb-4">
      {children}
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 dark:bg-black text-[#FF6B00] font-mono text-[12px] rounded-xl p-4 mb-4 overflow-x-auto whitespace-pre leading-relaxed">
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-[#002D72]/5 dark:bg-white/[0.08] border border-[#002D72]/15 dark:border-white/10 rounded-xl p-4 mb-4">
      <Info className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
      <span className="text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed">{children}</span>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 mb-4">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <span className="text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed">{children}</span>
    </div>
  );
}

function DoDont({ can, children }: { can: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 mb-2">
      {can
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        : <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
      <span className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">{children}</span>
    </div>
  );
}

// ---------- Conteúdo das seções ----------

const sections = [
  { id: "geral", label: "Visão Geral", icon: BookOpen },
  { id: "topbar", label: "Barra Superior", icon: Settings2 },
  { id: "resumo", label: "Resumo", icon: FileText },
  { id: "gbo", label: "GBO", icon: GanttChartSquare },
  { id: "produtividade", label: "Produtividade", icon: BarChart2 },
  { id: "payback", label: "Payback", icon: Calculator },
  { id: "movimentacao", label: "Movimentação", icon: ArrowRightLeft },
  { id: "qualidade", label: "Qualidade", icon: ShieldCheck },
  { id: "disponibilidade", label: "Disponibilidade", icon: Clock },
  { id: "leadtime", label: "Lead Time", icon: Timer },
  { id: "area", label: "Área de Trabalho", icon: Square },
  { id: "planoacao", label: "Plano de Ação 5W2H", icon: ClipboardList },
  { id: "a3", label: "Modelo A3", icon: LayoutTemplate },
  { id: "boaspraticas", label: "Boas Práticas", icon: AlertTriangle },
] as const;

type SectionId = typeof sections[number]["id"];

function renderContent(id: SectionId) {
  switch (id) {

    case "geral":
      return (
        <>
          <SectionTitle>O que é esta ferramenta</SectionTitle>
          <P>
            É o painel de indicadores usado para estruturar consultorias de Manufatura Enxuta (Lean). Cada aba representa
            um indicador ou uma ferramenta de análise. Você preenche os dados do estágio inicial (T1) e do estágio final
            após a melhoria (T3), e o sistema calcula os ganhos automaticamente e gera os textos de laudo prontos para o
            relatório final.
          </P>

          <SectionTitle>Fluxo de uso recomendado</SectionTitle>
          <FieldGroup>
            <Field label="1. Resumo">Cadastre os dados da empresa e do projeto. Escolha quais indicadores vão entrar na conclusão do laudo.</Field>
            <Field label="2. Módulos técnicos">Preencha GBO, Produtividade, Payback, Movimentação, Qualidade, Disponibilidade, Lead Time e Área conforme o que foi medido em campo.</Field>
            <Field label="3. Plano de Ação 5W2H">Registre as ações de melhoria aplicadas.</Field>
            <Field label="4. Modelo A3">Opcional, para estruturar a análise de problema de forma visual.</Field>
            <Field label="5. Baixar Word">Na barra superior, gere o laudo final consolidado em .docx.</Field>
          </FieldGroup>

          <SectionTitle>Onde ficam os dados</SectionTitle>
          <Tip>
            Tudo é salvo apenas no navegador do computador em que você está trabalhando (armazenamento local). Nada é
            enviado para nenhum servidor. Isso significa que os dados não sincronizam entre computadores e podem ser
            perdidos se você limpar o cache do navegador. Use "Exportar Dados" com frequência para não perder o trabalho.
          </Tip>
        </>
      );

    case "topbar":
      return (
        <>
          <P>
            A barra superior aparece na maioria das abas (some em Home, GBO, 5W2H e A3, que têm seus próprios controles).
            Ela tem três funções:
          </P>
          <FieldGroup>
            <Field label="Exportar Dados">Baixa um arquivo .lean (formato JSON) com os dados de Resumo, Produtividade, Payback, Movimentação, Qualidade, Disponibilidade, Lead Time e Área. Serve como backup do projeto.</Field>
            <Field label="Importar Dados">Carrega um arquivo .lean exportado anteriormente e preenche essas mesmas abas automaticamente.</Field>
            <Field label="Baixar Word">Gera o laudo técnico completo em .docx, já formatado, com introdução, plano de ação, resultados de cada indicador selecionado e conclusão.</Field>
          </FieldGroup>
          <Warn>
            O Exportar/Importar Dados NÃO inclui GBO, Plano de Ação 5W2H e Modelo A3. Esses três módulos têm exportação
            própria (em Excel), explicada nas seções respectivas.
          </Warn>
        </>
      );

    case "resumo":
      return (
        <>
          <P>
            É o ponto de partida do projeto. Reúne os dados institucionais da empresa e monta o texto de conclusão do
            laudo a partir dos resultados calculados nas outras abas.
          </P>

          <SectionTitle>Campos de cadastro</SectionTitle>
          <FieldGroup>
            <Field label="Empresa / Cidade / Ramo de Atuação / Especialista em">Identificação institucional, usada na introdução do laudo.</Field>
            <Field label="Total de Colaboradores / Turno(s)">Dimensionamento da operação.</Field>
            <Field label="Processo Produtivo Mapeado">Descrição do processo analisado.</Field>
            <Field label="Método (Puxada/Empurrada) e Demanda originada por">Caracterização do sistema produtivo.</Field>
            <Field label="Oportunidades / Problemas / Ferramentas Lean Aplicadas">Diagnóstico e ferramentas usadas na intervenção.</Field>
            <Field label="Área de Atuação/Intervenção e Motivação da Escolha">Justificativa do projeto.</Field>
          </FieldGroup>

          <SectionTitle>Resumo das Ações</SectionTitle>
          <P>
            Campo rápido para registrar ações que aparecem no corpo do laudo. É diferente da aba Plano de Ação 5W2H:
            aqui você só anota o "o que será feito", sem responsável, prazo ou custo.
          </P>

          <SectionTitle>Indicadores da Conclusão</SectionTitle>
          <P>
            Botões que definem quais indicadores entram no texto de conclusão e no laudo Word. Produtividade e Payback
            ficam sempre marcados (não é possível desmarcar). Os demais — Movimentação, Qualidade, Disponibilidade,
            Lead Time, Área de Trabalho — só entram no laudo se estiverem selecionados aqui.
          </P>
          <Warn>
            Se um módulo tiver dados preenchidos mas o indicador correspondente não estiver marcado aqui, esse resultado
            NÃO aparece no laudo final.
          </Warn>

          <SectionTitle>Texto de Conclusão</SectionTitle>
          <P>
            É montado automaticamente com base nos indicadores marcados. Pode ser editado manualmente clicando no lápis
            (o texto editado fica marcado como "· editado" e pode ser restaurado ao original a qualquer momento) ou
            copiado com formatação estruturada pelo ícone de cópia.
          </P>

          <SectionTitle>Limpar Dados</SectionTitle>
          <Warn>
            O botão "Limpar Dados" no Resumo apaga TODOS os dados do sistema, de todas as abas, sem exceção. É a única
            ação irreversível da ferramenta. Exporte um backup (.lean) antes de usar.
          </Warn>
        </>
      );

    case "gbo":
      return (
        <>
          <P>
            Gráfico de Balanceamento de Operações. Mostra o tempo de cada operação da célula comparado ao takt time,
            revelando gargalos e ociosidade.
          </P>

          <SectionTitle>Configuração do Takt Time</SectionTitle>
          <FieldGroup>
            <Field label="Tempo de Turno">Tempo disponível de produção, em minutos ou horas.</Field>
            <Field label="Demanda">Quantidade a produzir, por dia ou por mês (o sistema converte automaticamente para demanda diária dividindo por 21 dias úteis quando "mês" é selecionado).</Field>
          </FieldGroup>
          <Formula>{"Takt Time = Tempo de Turno disponível ÷ Demanda"}</Formula>

          <SectionTitle>Operações</SectionTitle>
          <P>
            Cadastre cada operação da célula com nome e tempo de execução (em segundos ou minutos). A lista pode ser
            reordenada por arraste. O gráfico é atualizado automaticamente e mostra quais operações ultrapassam o takt
            time (gargalo).
          </P>

          <SectionTitle>Exportar / Importar</SectionTitle>
          <FieldGroup>
            <Field label="Baixar Excel">Gera uma planilha com a lista de operações e tempos.</Field>
            <Field label="Importar Excel">Carrega uma planilha de operações já preenchida.</Field>
            <Field label="Exportar Gráfico em PDF">Salva a imagem do gráfico de balanceamento.</Field>
          </FieldGroup>
          <Tip>O GBO não entra no laudo Word automático nem no Exportar Dados (.lean). Guarde o Excel e o PDF separadamente.</Tip>
        </>
      );

    case "produtividade":
      return (
        <>
          <P>Mede peças produzidas por hora por operador, comparando o estágio inicial (T1) e o final (T3).</P>
          <FieldGroup>
            <Field label="Volume T1 / T3">Quantidade total produzida em cada estágio.</Field>
            <Field label="Horas T1 / T3">Horas trabalhadas em cada estágio.</Field>
            <Field label="Operadores T1 / T3">Número de operadores envolvidos em cada estágio.</Field>
            <Field label="Unidade">Nome da peça/produto, usado nos textos do laudo (ex: "peças", "unidades").</Field>
          </FieldGroup>
          <Formula>{"PPH = Volume ÷ (Horas × Operadores)\nGanho % = (PPH_T3 - PPH_T1) ÷ PPH_T1 × 100"}</Formula>
          <Tip>Este indicador é obrigatório: sempre entra no laudo de conclusão, junto com Payback.</Tip>
        </>
      );

    case "payback":
      return (
        <>
          <P>
            Calcula o retorno financeiro do investimento em consultoria, com base na redução do custo de mão de obra
            por peça produzida.
          </P>

          <SectionTitle>Modelo de Cálculo</SectionTitle>
          <FieldGroup>
            <Field label="Salário Bruto">O valor informado é usado diretamente, sem multiplicador de encargos.</Field>
            <Field label="Salário + Encargos">Aplica um fator multiplicador sobre o salário (ex: 1,90 = salário + 90% de encargos trabalhistas).</Field>
          </FieldGroup>

          <SectionTitle>Modo de Inserção</SectionTitle>
          <FieldGroup>
            <Field label="Total da Equipe">O valor digitado já representa o custo total de todos os operadores daquele estágio.</Field>
            <Field label="Por Operador">O valor digitado é o salário de um único operador; o sistema multiplica pelo número de operadores informado na aba Produtividade.</Field>
          </FieldGroup>

          <SectionTitle>Outros campos</SectionTitle>
          <FieldGroup>
            <Field label="Dedicação (%)">Percentual do tempo do operador dedicado a este processo específico (100% se for dedicação exclusiva).</Field>
            <Field label="Porte da Empresa">Preenche automaticamente o valor de consultoria conforme a tabela do programa (Micro, Pequena ou Média).</Field>
            <Field label="Investimentos Adicionais">Qualquer custo extra do projeto, somado ao valor da consultoria.</Field>
          </FieldGroup>
          <Formula>{"Custo Unitário = Custo Mensal de MOD ÷ Produção Mensal (Volume diário × 21)\nRedução Mensal = (Custo Inicial - Custo Final) × Produção Mensal Final\nPayback (meses) = (Consultoria + Investimento Extra) ÷ Redução Mensal"}</Formula>
          <Warn>
            Os campos de Produtividade (Volume e Operadores) alimentam este cálculo. Preencha a aba Produtividade antes
            de conferir os resultados de Payback.
          </Warn>
        </>
      );

    case "movimentacao":
      return (
        <>
          <P>Mede a redução de distância percorrida e/ou tempo gasto em transporte e movimentação logística.</P>
          <FieldGroup>
            <Field label="Distância T1 / T3">Distância percorrida antes e depois da melhoria.</Field>
            <Field label="Tempo T1 / T3">Tempo gasto antes e depois, na unidade escolhida (segundos, minutos ou horas).</Field>
            <Field label="Ferramenta Utilizada / Ação de Melhoria">Texto livre, usado para compor a frase do laudo (ex: "espaguete, diagrama de fluxo").</Field>
            <Field label="Exibir no Laudo">Escolha se o texto final menciona distância, tempo ou ambos.</Field>
          </FieldGroup>
          <Formula>{"Redução Distância % = (Dist. T1 - Dist. T3) ÷ Dist. T1 × 100\nRedução Tempo % = (Tempo T1 - Tempo T3) ÷ Tempo T1 × 100"}</Formula>
        </>
      );

    case "qualidade":
      return (
        <>
          <P>Mede a evolução do índice de peças conformes (boas) em relação ao total produzido.</P>
          <FieldGroup>
            <Field label="Qtd Produzida T1 / T3">Total produzido em cada estágio.</Field>
            <Field label="Perdas (Peças) T1 / T3">Quantidade de peças refugadas/rejeitadas em cada estágio.</Field>
          </FieldGroup>
          <Formula>{"Peças Boas = Qtd Produzida - Perdas\nÍndice % = Peças Boas ÷ Qtd Produzida × 100\nAumento % = (Índice T3 - Índice T1) ÷ Índice T1 × 100"}</Formula>
        </>
      );

    case "disponibilidade":
      return (
        <>
          <P>Mede o ganho de disponibilidade real de uma máquina/processo, descontando paradas planejadas e não planejadas.</P>
          <FieldGroup>
            <Field label="Tempo Total T1 / T3">Tempo total do turno disponível, na unidade escolhida.</Field>
            <Field label="Paradas Planejadas T1 / T3">Paradas previstas (manutenção preventiva, troca de turno, refeição etc).</Field>
            <Field label="Paradas Não Planejadas T1 / T3">Quebras, falhas e paradas não programadas.</Field>
          </FieldGroup>
          <Formula>{"Disponível = Tempo Total - Paradas Planejadas\nTempo Real = Disponível - Paradas Não Planejadas\nÍndice % = Tempo Real ÷ Disponível × 100\nAumento % = (Índice T3 - Índice T1) ÷ Índice T1 × 100"}</Formula>
        </>
      );

    case "leadtime":
      return (
        <>
          <P>Mede a redução no tempo de atravessamento total do processo (da entrada do pedido até a entrega).</P>
          <FieldGroup>
            <Field label="Lead Time T1 / T3">Tempo de atravessamento antes e depois da melhoria.</Field>
            <Field label="Unidade">Segundos, minutos, horas ou dias.</Field>
            <Field label="Melhorias / Redução Obtida">Campos de texto livre de apoio, para anotações internas.</Field>
          </FieldGroup>
          <Formula>{"Redução % = (Lead Time T1 - Lead Time T3) ÷ Lead Time T1 × 100"}</Formula>
        </>
      );

    case "area":
      return (
        <>
          <P>Mede a economia de espaço físico obtida com a otimização de layout.</P>
          <FieldGroup>
            <Field label="Área Ocupada T1 / T3">Área em m² antes e depois da mudança de layout.</Field>
            <Field label="Valor do Aluguel/m²">Custo de ocupação por m², usado para estimar a economia financeira mensal.</Field>
          </FieldGroup>
          <Formula>{"Redução % = (Área T1 - Área T3) ÷ Área T1 × 100\nÁrea Liberada (m²) = Área T1 - Área T3\nEconomia Mensal (R$) = Área Liberada × Valor do Aluguel/m²"}</Formula>
        </>
      );

    case "planoacao":
      return (
        <>
          <P>
            Ferramenta 5W2H para planejamento tático das ações de melhoria: o quê, por quê, onde, quando, quem, como e
            quanto custa.
          </P>
          <FieldGroup>
            <Field label="Metadados">Data de criação, responsável, objetivo, meta, data de revisão e indicador relacionado ao plano.</Field>
            <Field label="Ações">Cada linha representa uma ação, com status e percentual de conclusão.</Field>
          </FieldGroup>

          <SectionTitle>Excel</SectionTitle>
          <FieldGroup>
            <Field label="Baixar Modelo">Baixa a planilha modelo em branco, no layout oficial 5W2H, pronta para preenchimento fora do sistema.</Field>
            <Field label="Baixar Planilha">Exporta as ações já cadastradas no sistema para o mesmo layout, preservando o design do modelo.</Field>
            <Field label="Importar Excel">Carrega uma planilha 5W2H preenchida e sincroniza as ações com o sistema.</Field>
          </FieldGroup>
          <Tip>
            As ações adicionadas rapidamente na aba Resumo aparecem aqui também. As ações criadas diretamente aqui não
            duplicam no Resumo.
          </Tip>
        </>
      );

    case "a3":
      return (
        <>
          <P>
            Estrutura o relatório A3 de análise e solução de problemas: background, objetivos, estado atual, análise de
            causa raiz, estado futuro, plano de ação e indicadores de acompanhamento.
          </P>
          <FieldGroup>
            <Field label="Cabeçalho">Título, data e aprovações do documento.</Field>
            <Field label="Background / Objetivos / Estado Atual / Análise / Estado Futuro">Blocos de texto livre que compõem a narrativa do A3.</Field>
            <Field label="Plano de Ação">Lista simplificada de ações (o quê, quem, prazo), independente do Plano de Ação 5W2H.</Field>
            <Field label="Indicadores">Lista de indicadores de acompanhamento com meta e status.</Field>
          </FieldGroup>
          <Field label="Baixar Excel">Exporta o A3 preenchido para o layout oficial em planilha.</Field>
        </>
      );

    case "boaspraticas":
      return (
        <>
          <SectionTitle>Recomendado</SectionTitle>
          <DoDont can>Exportar Dados (.lean) ao final de cada sessão de trabalho, como backup.</DoDont>
          <DoDont can>Preencher Resumo antes dos demais módulos, pois ele consolida os resultados.</DoDont>
          <DoDont can>Conferir os Indicadores marcados no Resumo antes de baixar o Word.</DoDont>
          <DoDont can>Preencher a aba Produtividade antes de conferir o Payback (um depende do outro).</DoDont>

          <SectionTitle>Evitar</SectionTitle>
          <DoDont can={false}>Limpar o cache/histórico do navegador sem antes exportar os dados: tudo é salvo localmente e será perdido.</DoDont>
          <DoDont can={false}>Usar "Limpar Dados" sem certeza: a ação apaga todas as abas e não pode ser desfeita.</DoDont>
          <DoDont can={false}>Esperar que GBO, 5W2H e A3 sejam salvos no arquivo .lean: eles têm exportação própria em Excel.</DoDont>
          <DoDont can={false}>Trocar de computador ou navegador esperando encontrar os dados: eles não sincronizam entre dispositivos.</DoDont>

          <SectionTitle>Privacidade</SectionTitle>
          <Tip>
            Nenhum dado é enviado a servidores externos. Todo processamento e armazenamento acontece localmente, no seu
            navegador. A responsabilidade pela guarda dos arquivos exportados (.lean, .xlsx, .docx) é de quem opera a
            ferramenta.
          </Tip>
        </>
      );

    default:
      return null;
  }
}

// ---------- Componente principal ----------

export function ManualModule() {
  const [active, setActive] = useState<SectionId>("geral");

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      {/* Navegação lateral */}
      <div className="w-full lg:w-[260px] shrink-0">
        <div className="lg:sticky lg:top-0 flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[12px] font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#FF6B00] text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-24">
        <div className="max-w-2xl">
          {renderContent(active)}
        </div>
      </div>
    </div>
  );
}
