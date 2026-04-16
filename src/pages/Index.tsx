import { useAppStore, calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea, ModuleKey } from "@/store/useAppStore";
import { FloatingNav } from "@/components/FloatingNav";
import { Topbar } from "@/components/Topbar";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { 
  FileText, GanttChartSquare, BarChart2, Calculator, 
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, TrendingUp, ClipboardList
} from "lucide-react";

import { ResumoModule } from "@/modules/ResumoModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { MovimentacaoModule } from "@/modules/MovimentacaoModule";
import { QualidadeModule } from "@/modules/QualidadeModule";
import { DisponibilidadeModule } from "@/modules/DisponibilidadeModule";
import { LeadTimeModule } from "@/modules/LeadTimeModule";
import { AreaModule } from "@/modules/AreaModule";
import { PlanoAcaoModule } from "@/modules/PlanoAcaoModule";
import GBOAnalysis from "@/modules/GboModule"; 

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule, clearData } = useAppStore();

  const handleExportWord = async () => {
    const { resumo, produtividade, payback, movimentacao, qualidade, disponibilidade, leadtime, area, planoAcao } = state;
    
    const prod = calcProdutividade(produtividade);
    const pb = calcPayback(payback, produtividade, resumo);
    const mov = calcMovimentacao(movimentacao);
    const qual = calcQualidade(qualidade);
    const disp = calcDisponibilidade(disponibilidade);
    const lt = calcLeadTime(leadtime);
    const ar = calcArea(area);
    
    const getUnit = (val: number, unit: string) => {
      const u = unit || "minutos";
      if (u === "segundos") return val === 1 ? "segundo" : "segundos";
      if (u === "minutos") return val === 1 ? "minuto" : "minutos";
      if (u === "horas") return val === 1 ? "hora" : "horas";
      return u;
    };

    // FILTRO: Puxa apenas as macros do Resumo, ignora o operacional criado no 5W2H
    const acoesResumo = planoAcao.acoes.filter(a => a.origin !== "5w2h");
    const acoesStr = acoesResumo.length > 0 ? acoesResumo.map(a => a.what).join(", ") : "—";

    const tr = (text: string, bold = false) => new TextRun({ text, bold, font: "Arial", size: 22 }); 
    
    const createHeading = (text: string) => new Paragraph({
      text: text.toUpperCase(),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 120 },
    });

    const createJustified = (runs: TextRun[]) => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: runs,
      spacing: { line: 360 }, 
    });

    // --- MONTAGEM DINÂMICA DA CONCLUSÃO (Igual a tela do sistema) ---
    const lockedIndicadores = ["produtividade", "payback"];
    const selectedIndicadores = Array.from(new Set([...(resumo.indicadoresConclusao || []), ...lockedIndicadores]));
    const u = produtividade.unidade || "peças";

    const conclusaoParagraphs: Paragraph[] = [
      createHeading("10. Conclusão do Projeto"),
      createJustified([
        tr("O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa "),
        tr(resumo.nomeEmpresa || "—", true),
        tr(", na cidade de "),
        tr(resumo.cidade || "—", true),
        tr(" no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada por: "),
        tr(resumo.motivacao || "—", true),
        tr(". As ferramentas aplicadas foram: "),
        tr(resumo.ferramentas || "—", true),
        tr(".")
      ]),
      new Paragraph({ text: "", spacing: { after: 120 } }),
      createJustified([
        tr("Foram elaborados planos de ação através da ferramenta 5W2H, definindo diversas ações para as oportunidades elencadas, tais como: "),
        tr(acoesStr, true),
        tr(".")
      ]),
      new Paragraph({ text: "", spacing: { after: 120 } }),
      createJustified([
        tr("Após a definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:")
      ]),
      new Paragraph({ text: "", spacing: { after: 120 } })
    ];

    if (selectedIndicadores.includes("produtividade")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Produtividade: ", true), tr(`No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(2)} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(2)} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(2)}% na eficiência operacional da célula.`)
      ]));
    }
    if (selectedIndicadores.includes("payback")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Payback: ", true), tr(`Com as ações aplicadas e a redução do custo de mão de obra por ${u}, o projeto apresenta um retorno financeiro com Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`)
      ]));
    }
    if (selectedIndicadores.includes("movimentacao")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Movimentação: ", true), tr(`A análise de fluxo evidenciou uma redução de ${mov.reducaoDist.toFixed(2)}% na distância percorrida e uma queda de ${mov.reducaoTempo.toFixed(2)}% no tempo gasto com movimentação e transporte logístico.`)
      ]));
    }
    if (selectedIndicadores.includes("qualidade")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Qualidade: ", true), tr(`O índice de assertividade e peças conformes evoluiu de ${qual.indiceT1.toFixed(2)}% para ${qual.indiceT3.toFixed(2)}%, garantindo maior confiabilidade ao processo e minimizando perdas.`)
      ]));
    }
    if (selectedIndicadores.includes("disponibilidade")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Disponibilidade: ", true), tr(`Com a redução das paradas não planejadas, o tempo efetivo de operação da máquina aumentou, representando um ganho de ${disp.aumento.toFixed(2)}% na utilização real do recurso.`)
      ]));
    }
    if (selectedIndicadores.includes("leadtime")) {
      const ltU = leadtime.unidadeTempo || "dias";
      const t1 = leadtime.leadTimeT1 || leadtime.tempoT1 || 0;
      const t3 = leadtime.leadTimeT3 || leadtime.tempoT3 || 0;
      conclusaoParagraphs.push(createJustified([
        tr("• Lead Time: ", true), tr(`O tempo de atravessamento total caiu de ${t1} para ${t3} ${ltU}, caracterizando uma redução de ${lt.reducao.toFixed(2)}% no prazo de entrega do processo.`)
      ]));
    }
    if (selectedIndicadores.includes("area")) {
      conclusaoParagraphs.push(createJustified([
        tr("• Área de Trabalho: ", true), tr(`A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1)}%, liberando ${ar.economiaM2.toFixed(1)}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`)
      ]));
    }

    conclusaoParagraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    conclusaoParagraphs.push(createJustified([
      tr("O resultado geral do projeto foi agregador e positivo para a empresa, pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados. Com isso, a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de produção.")
    ]));

    // --- MONTAGEM DO DOCUMENTO ---
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "RELATÓRIO TÉCNICO DE CONSULTORIA",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          createHeading("1. Descrição do Processo"),
          createJustified([
            tr("A Empresa "), tr(resumo.nomeEmpresa || "—", true),
            tr(", da cidade de "), tr(resumo.cidade || "—", true),
            tr(" no Estado do Rio Grande do Sul, atua no ramo de "), tr(resumo.ramo || "—", true),
            tr(", especialista em "), tr(resumo.especialista || "—", true),
            tr(", conta com "), tr(String(resumo.totalColaboradores || 0), true),
            tr(resumo.totalColaboradores === 1 ? " colaborador" : " colaboradores"),
            tr(" atuando em "), tr(String(resumo.turnos), true),
            tr(resumo.turnos === 1 ? " Turno. " : " Turnos. "),
            tr("O produto mapeado segue o seguinte processo produtivo: "), tr(resumo.processos || "—", true),
            tr(", com método de produção "), tr(resumo.metodo || "—", true),
            tr(", onde a demanda é originada por "), tr(resumo.origem || "—", true),
            tr(". Ao longo do mapeamento foi identificado oportunidades no setor de "), tr(resumo.oportunidades || "—", true),
            tr(", por problemas de "), tr(resumo.problemas || "—", true),
            tr(". Nesta consultoria, a área de atuação/intervenção foi "), tr(resumo.atuacao || "—", true),
            tr(".")
          ]),

          createHeading("2. Laudo de Produtividade"),
          createJustified([
            tr("No estágio inicial, a produtividade era de "), tr(`${prod.pphT1.toFixed(2)} pçs/h/op`, true),
            tr(", produzindo "), tr(String(produtividade.volumeT1 || 0), true),
            tr(" peças com "), tr(String(produtividade.operadoresT1 || 0), true),
            tr(produtividade.operadoresT1 === 1 ? " operador" : " operadores"),
            tr(" em "), tr(`${produtividade.horasT1 || 0}h`, true),
            tr(". Após as melhorias, a produtividade subiu para "), tr(`${prod.pphT3.toFixed(2)} pçs/h/op`, true),
            tr(", produzindo "), tr(String(produtividade.volumeT3 || 0), true),
            tr(" peças com "), tr(String(produtividade.operadoresT3 || 0), true),
            tr(produtividade.operadoresT3 === 1 ? " operador" : " operadores"),
            tr(" em "), tr(`${produtividade.horasT3 || 0}h`, true),
            tr(". Isso representa um ganho direto de "), tr(`${prod.ganho.toFixed(2)}%`, true),
            tr(" na eficiência operacional da célula.")
          ]),

          createHeading("3. Laudo de Payback"),
          createJustified([
            tr("No estágio inicial, havia "), tr(String(produtividade.operadoresT1 || 0), true),
            tr(produtividade.operadoresT1 === 1 ? " colaborador" : " colaboradores"),
            tr(", com custo total por mês de "), tr(`R$ ${pb.salI.toFixed(2)}`, true),
            tr(". Produziam-se "), tr(`${pb.prodMensalI.toLocaleString("pt-BR")} ${produtividade.unidade || "peças"}/mês`, true),
            tr(", a custo de mão de obra de "), tr(`R$ ${pb.custoI.toFixed(2)}`, true),
            tr(". Após intervenção, permaneceram "), tr(String(produtividade.operadoresT3 || 0), true),
            tr(produtividade.operadoresT3 === 1 ? " colaborador" : " colaboradores"),
            tr(", com custo total por mês de "), tr(`R$ ${pb.salF.toFixed(2)}`, true),
            tr(". Passaram a produzir "), tr(`${pb.prodMensalF.toLocaleString("pt-BR")} ${produtividade.unidade || "peças"}/mês`, true),
            tr(", a custo de mão de obra de "), tr(`R$ ${pb.custoF.toFixed(2)}`, true),
            tr(". Portanto, um payback de "), tr(`${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(1) : "0.0"} ${pb.paybackMeses === 1 ? "mês" : "meses"}`, true),
            tr(".")
          ]),

          createHeading("4. Laudo de Qualidade"),
          createJustified([
            tr(`No estágio inicial, de um total de ${qualidade.quantidadeT1} peças, identificou-se ${qualidade.perdasT1} `),
            tr(qualidade.perdasT1 === 1 ? "peça não conforme " : "peças não conformes ", true),
            tr(`(assertividade de ${qual.indiceT1.toFixed(2)}%). Após as melhorias, para um lote de ${qualidade.quantidadeT3} peças, as perdas caíram para ${qualidade.perdasT3}, evoluindo o índice de assertividade para `),
            tr(`${qual.indiceT3.toFixed(2)}%`, true),
            tr(", garantindo maior confiabilidade ao processo e minimizando perdas.")
          ]),

          createHeading("5. Laudo de Disponibilidade"),
          createJustified([
            tr("O tempo real de operação efetiva da máquina evoluiu de "),
            tr(`${disp.realT1} ${getUnit(disp.realT1, disponibilidade.unidadeTempo)}`, true),
            tr(` (índice de ${disp.indT1.toFixed(2)}%)`),
            tr(" para "),
            tr(`${disp.realT3} ${getUnit(disp.realT3, disponibilidade.unidadeTempo)}`, true),
            tr(` (índice de ${disp.indT3.toFixed(2)}%).`),
            tr(" Isso representa um ganho direto de "),
            tr(`${disp.aumento.toFixed(2)}%`, true),
            tr(" na utilização do recurso através da redução de paradas não planejadas.")
          ]),

          createHeading("6. Laudo de Movimentação Logística"),
          createJustified([
            tr("A análise de fluxo evidenciou uma redução de "),
            tr(`${mov.reducaoDist.toFixed(2)}%`, true),
            tr(` na distância percorrida (de ${movimentacao.distanciaT1}m para ${movimentacao.distanciaT3}m) e uma queda de `),
            tr(`${mov.reducaoTempo.toFixed(2)}%`, true),
            tr(` no tempo gasto com movimentação e transporte logístico (de ${movimentacao.tempoT1} para ${movimentacao.tempoT3} ${getUnit(movimentacao.tempoT3, movimentacao.unidadeTempo)}).`)
          ]),

          createHeading("7. Plano de Ação (5W2H)"),
          createJustified([
            tr("As principais definições macro do plano de ação contemplaram: "),
            tr(acoesStr, true),
            tr(".")
          ]),

          createHeading("8. Laudo de Lead Time"),
          createJustified([
            tr("O tempo de atravessamento (lead time) inicial era de "),
            tr(`${leadtime.leadTimeT1 || leadtime.tempoT1 || 0} ${leadtime.unidadeTempo || "dias"}`, true),
            tr(". Após as melhorias implementadas, o lead time foi reduzido para "),
            tr(`${leadtime.leadTimeT3 || leadtime.tempoT3 || 0} ${leadtime.unidadeTempo || "dias"}`, true),
            tr(", representando uma redução de "),
            tr(`${lt.reducao.toFixed(2)}%`, true),
            tr(" no tempo total de entrega do processo.")
          ]),

          createHeading("9. Laudo de Área"),
          createJustified([
            tr("A área ocupada inicial era de "),
            tr(`${area.areaT1 || 0}m²`, true),
            tr(". Com a otimização do layout, reduziu-se para "),
            tr(`${area.areaT3 || 0}m²`, true),
            tr(", liberando "),
            tr(`${ar.economiaM2.toFixed(1)}m²`, true),
            tr(" de área útil ("),
            tr(`${ar.reducaoPercent.toFixed(1)}%`, true),
            tr(" de redução), gerando uma economia imobiliária mensal de "),
            tr(`R$ ${ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, true),
            tr(".")
          ]),

          // Injeção da Conclusão Dinâmica
          ...conclusaoParagraphs
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Relatorio_Lean_${resumo.nomeEmpresa || 'Empresa'}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const renderPanelModules = () => {
    switch (activeModule) {
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} onUpdatePlanoAcao={acoes => updateModule("planoAcao", { acoes })} onClearData={clearData} />;
      case "payback": return <PaybackModule data={state.payback} prodData={state.produtividade} resumoData={state.resumo} onChange={d => updateModule("payback", d)} />;
      case "produtividade": return <ProdutividadeModule data={state.produtividade} onChange={d => updateModule("produtividade", d)} />;
      case "movimentacao": return <MovimentacaoModule data={state.movimentacao} onChange={d => updateModule("movimentacao", d)} />;
      case "qualidade": return <QualidadeModule data={state.qualidade} onChange={d => updateModule("qualidade", d)} />;
      case "disponibilidade": return <DisponibilidadeModule data={state.disponibilidade} onChange={d => updateModule("disponibilidade", d)} />;
      case "leadtime": return <LeadTimeModule data={state.leadtime} onChange={d => updateModule("leadtime", d)} />;
      case "area": return <AreaModule data={state.area} onChange={d => updateModule("area", d)} />;
      case "planoAcao": return <PlanoAcaoModule data={state.planoAcao} onChange={d => updateModule("planoAcao", d)} />;
      default: return null;
    }
  };

  const renderHome = () => {
    const modules: { key: ModuleKey; title: string; desc: string; icon: any; color: string }[] = [
      { key: "resumo", title: "Resumo", desc: "Configurações gerais e laudo", icon: FileText, color: "text-blue-600 bg-blue-50" },
      { key: "gbo", title: "GBO", desc: "Balanceamento de Operações e Gargalos", icon: GanttChartSquare, color: "text-indigo-600 bg-indigo-50" },
      { key: "produtividade", title: "Produtividade", desc: "Análise de peças por hora e eficiência", icon: BarChart2, color: "text-emerald-600 bg-emerald-50" },
      { key: "payback", title: "Payback", desc: "Retorno de Investimento (ROI)", icon: Calculator, color: "text-amber-600 bg-amber-50" },
      { key: "movimentacao", title: "Movimentação", desc: "Redução de tempos e distâncias", icon: ArrowRightLeft, color: "text-orange-600 bg-orange-50" },
      { key: "qualidade", title: "Qualidade", desc: "Controle de refugos e assertividade", icon: ShieldCheck, color: "text-rose-600 bg-rose-50" },
      { key: "disponibilidade", title: "Disponibilidade", desc: "Mapeamento de paradas de máquina", icon: Clock, color: "text-cyan-600 bg-cyan-50" },
      { key: "leadtime", title: "Lead Time", desc: "Redução no tempo de atravessamento", icon: Timer, color: "text-purple-600 bg-purple-50" },
      { key: "area", title: "Área de Trabalho", desc: "Otimização de layout e m²", icon: Square, color: "text-slate-600 bg-slate-100" },
      { key: "planoAcao", title: "Plano de Ação 5W2H", desc: "Gestão tática e exportação", icon: ClipboardList, color: "text-sky-600 bg-sky-50" },
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-12 pb-36 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg mb-6">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Painel de Indicadores</h1>
        <p className="text-slate-500 text-sm mb-12 max-w-md text-center">Selecione um módulo abaixo para iniciar a análise de manufatura enxuta ou gerar laudos.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-5xl">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setActiveModule(m.key)}
                className="group flex items-start text-left p-6 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`p-3 rounded-xl ${m.color} mr-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-inter print:bg-white print:h-auto print:overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: landscape; margin: 10mm; } }` }} />
      <main className="flex-1 overflow-y-auto p-2 md:p-4 pb-32 print:p-0 print:overflow-visible">
        {activeModule !== "home" && (
          <div className="print:hidden relative z-[100] mb-2 animate-in slide-in-from-top-2 duration-300">
            <Topbar onExportWord={handleExportWord} />
          </div>
        )}
        <div className={`w-full transition-all min-h-full relative print:shadow-none print:border-none print:rounded-none print:p-0 ${activeModule === "home" ? "bg-transparent p-0" : "bg-white rounded-2xl shadow-sm border border-slate-200/50 p-4 md:p-6"}`}>
          {activeModule === "home" && renderHome()}
          {activeModule !== "home" && activeModule !== "gbo" && (
            <div key={activeModule} className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full h-full">
              {renderPanelModules()}
            </div>
          )}
          <div className={activeModule === "gbo" ? "animate-in fade-in slide-in-from-bottom-2 duration-500 block w-full h-full" : "hidden"}>
            <GBOAnalysis />
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <FloatingNav active={activeModule} onSelect={setActiveModule} />
      </div>
    </div>
  );
};

export default Index;
