import { useAppStore, calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea } from "@/store/useAppStore";
import { FloatingNav } from "@/components/FloatingNav";
import { Topbar } from "@/components/Topbar";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

// Seus módulos do painel
import { ResumoModule } from "@/modules/ResumoModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { MovimentacaoModule } from "@/modules/MovimentacaoModule";
import { QualidadeModule } from "@/modules/QualidadeModule";
import { DisponibilidadeModule } from "@/modules/DisponibilidadeModule";
import { LeadTimeModule } from "@/modules/LeadTimeModule";
import { AreaModule } from "@/modules/AreaModule";

import GBOAnalysis from "@/modules/GboModule"; 

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule, clearData } = useAppStore();

  const handleExportWord = async () => {
    const { resumo, produtividade, payback, movimentacao, qualidade, disponibilidade, leadtime, area } = state;
    
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

    const acoesStr = resumo.acoes.length > 0 ? resumo.acoes.map(a => a.what).join(", ") : "—";

    // --- FUNÇÕES AUXILIARES PARA O WORD ---
    const tr = (text: string, bold = false) => new TextRun({ text, bold, font: "Arial", size: 22 }); // size 22 = 11pt
    
    const createHeading = (text: string) => new Paragraph({
      text: text.toUpperCase(),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 120 },
    });

    const createJustified = (runs: TextRun[]) => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: runs,
      spacing: { line: 360 }, // Espaçamento 1.5
    });

    // --- CONSTRUÇÃO DO DOCUMENTO OFICIAL ---
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
            tr(qualidade.perdasT1 === 1 ? "peça não conforme" : "peças não conformes", true),
            tr(". Após as melhorias, o índice de assertividade evoluiu para "),
            tr(`${qual.indiceT3.toFixed(2)}%`, true),
            tr(", garantindo maior confiabilidade ao processo.")
          ]),

          createHeading("5. Laudo de Disponibilidade"),
          createJustified([
            tr("O tempo real de operação evoluiu de "),
            tr(`${disp.realT1} ${getUnit(disp.realT1, disponibilidade.unidadeTempo)}`, true),
            tr(" para "),
            tr(`${disp.realT3} ${getUnit(disp.realT3, disponibilidade.unidadeTempo)}`, true),
            tr(", representando um aumento de "),
            tr(`${disp.aumento.toFixed(2)}%`, true),
            tr(" na utilização do recurso.")
          ]),

          createHeading("6. Laudo de Movimentação Logística"),
          createJustified([
            tr("O tempo de movimentação foi reduzido de "),
            tr(`${movimentacao.tempoT1} ${getUnit(movimentacao.tempoT1, movimentacao.unidadeTempo)}`, true),
            tr(" para "),
            tr(`${movimentacao.tempoT3} ${getUnit(movimentacao.tempoT3, movimentacao.unidadeTempo)}`, true),
            tr(", reduzindo desperdícios em "),
            tr(`${mov.reducaoTempo.toFixed(2)}%`, true),
            tr(".")
          ]),

          createHeading("7. Plano de Ação (5W2H)"),
          createJustified([
            tr("As principais definições do plano de ação contemplaram: "),
            tr(acoesStr, true),
            tr(".")
          ]),

          createHeading("8. Conclusão do Projeto"),
          createJustified([
            tr("O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa "),
            tr(resumo.nomeEmpresa || "—", true),
            tr(", na cidade de "),
            tr(resumo.cidade || "—", true),
            tr(" no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada "),
            tr(resumo.motivacao || "—", true),
            tr(". As ferramentas aplicadas foram "),
            tr(resumo.ferramentas || "—", true),
            tr(". Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: "),
            tr(acoesStr, true),
            tr(". Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se: Aumento de "),
            tr(`${prod.ganho.toFixed(2)}%`, true),
            tr(" em produtividade. Payback: Com as ações aplicadas obtém-se um Payback de "),
            tr(`${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}`, true),
            tr(".")
          ]),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          createJustified([
            tr("O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e lines de trabalho da produção.")
          ])
        ]
      }]
    });

    // --- GERA O ARQUIVO .DOCX ---
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
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} onClearData={clearData} />;
      case "payback": return <PaybackModule data={state.payback} prodData={state.produtividade} resumoData={state.resumo} onChange={d => updateModule("payback", d)} />;
      case "produtividade": return <ProdutividadeModule data={state.produtividade} onChange={d => updateModule("produtividade", d)} />;
      case "movimentacao": return <MovimentacaoModule data={state.movimentacao} onChange={d => updateModule("movimentacao", d)} />;
      case "qualidade": return <QualidadeModule data={state.qualidade} onChange={d => updateModule("qualidade", d)} />;
      case "disponibilidade": return <DisponibilidadeModule data={state.disponibilidade} onChange={d => updateModule("disponibilidade", d)} />;
      case "leadtime": return <LeadTimeModule data={state.leadtime} onChange={d => updateModule("leadtime", d)} />;
      case "area": return <AreaModule data={state.area} onChange={d => updateModule("area", d)} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-inter print:bg-white print:h-auto print:overflow-visible">
      
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: landscape; margin: 10mm; } }` }} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-36 print:p-0 print:overflow-visible">
        
        <div className="print:hidden relative z-[100] mb-2">
          <Topbar onExportWord={handleExportWord} />
        </div>

        <div className="mx-auto max-w-[1600px] bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/50 p-10 transition-all min-h-full relative print:shadow-none print:border-none print:rounded-none print:p-0">
          
          {activeModule !== "gbo" && (
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
