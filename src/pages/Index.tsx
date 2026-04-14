import { useAppStore, calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea } from "@/store/useAppStore";
import { FloatingNav } from "@/components/FloatingNav";
import { Topbar } from "@/components/Topbar";

// Seus módulos do painel
import { ResumoModule } from "@/modules/ResumoModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { MovimentacaoModule } from "@/modules/MovimentacaoModule";
import { QualidadeModule } from "@/modules/QualidadeModule";
import { DisponibilidadeModule } from "@/modules/DisponibilidadeModule";
import { LeadTimeModule } from "@/modules/LeadTimeModule";
import { AreaModule } from "@/modules/AreaModule";

// GBO ORIGINAL
import GBOAnalysis from "@/modules/GboModule"; 

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule } = useAppStore();

  const handleExportWord = () => {
    const { resumo, produtividade, payback, movimentacao, qualidade, disponibilidade, leadtime, area } = state;
    
    const prod = calcProdutividade(produtividade);
    const pb = calcPayback(payback, produtividade, resumo);
    const mov = calcMovimentacao(movimentacao);
    const qual = calcQualidade(qualidade);
    const disp = calcDisponibilidade(disponibilidade);
    const lt = calcLeadTime(leadtime);
    const ar = calcArea(area);
    
    // Auxiliar para unidades de tempo
    const getUnit = (val: number, unit: string) => {
      const u = unit || "minutos";
      if (u === "segundos") return val === 1 ? "segundo" : "segundos";
      if (u === "minutos") return val === 1 ? "minuto" : "minutos";
      if (u === "horas") return val === 1 ? "hora" : "horas";
      return u;
    };

    const acoesStr = resumo.acoes.length > 0 ? resumo.acoes.map(a => a.what).join(", ") : "ações de melhoria contínua";

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #2563eb; text-align: center;">RELATÓRIO TÉCNICO DE CONSULTORIA</h1>
        <hr>
        
        <h3 style="text-transform: uppercase;">1. Descrição do Processo</h3>
        <p style="text-align: justify;">A Empresa <b>${resumo.nomeEmpresa || "—"}</b>, da cidade de <b>${resumo.cidade || "—"}</b> no Estado do Rio Grande do Sul, atua no ramo de <b>${resumo.ramo || "—"}</b>, especialista em <b>${resumo.especialista || "—"}</b>, conta com <b>${resumo.totalColaboradores || "0"}</b> ${resumo.totalColaboradores === 1 ? "colaborador" : "colaboradores"} atuando em <b>${resumo.turnos}</b> ${resumo.turnos === 1 ? "Turno" : "Turnos"}. O produto mapeado segue o seguinte processo produtivo: <b>${resumo.processos || "—"}</b>, com método de produção <b>${resumo.metodo || "—"}</b>, onde a demanda é originada por <b>${resumo.origem || "—"}</b>. Ao longo do mapeamento foi identificado oportunidades no setor de <b>${resumo.oportunidades || "—"}</b>, por problemas de <b>${resumo.problemas || "—"}</b>. Nesta consultoria, a área de atuação/intervenção foi <b>${resumo.atuacao || "—"}</b>.</p>
        
        <h3 style="text-transform: uppercase;">2. Laudo de Produtividade</h3>
        <p style="text-align: justify;">No estágio inicial, a produtividade era de <b>${prod.pphT1.toFixed(2)} pçs/h/op</b>, produzindo <b>${produtividade.volumeT1 || 0}</b> peças com <b>${produtividade.operadoresT1 || 0} ${produtividade.operadoresT1 === 1 ? "operador" : "operadores"}</b> em <b>${produtividade.horasT1 || 0}h</b>. Após as melhorias, a produtividade subiu para <b>${prod.pphT3.toFixed(2)} pçs/h/op</b>, produzindo <b>${produtividade.volumeT3 || 0}</b> peças com <b>${produtividade.operadoresT3 || 0} ${produtividade.operadoresT3 === 1 ? "operador" : "operadores"}</b> em <b>${produtividade.horasT3 || 0}h</b>. Isso representa um ganho direto de <b>${prod.ganho.toFixed(2)}%</b> na eficiência operacional da célula.</p>

        <h3 style="text-transform: uppercase;">3. Laudo de Payback</h3>
        <p style="text-align: justify;">
          No estágio inicial, havia <b>${produtividade.operadoresT1 || 0} ${produtividade.operadoresT1 === 1 ? "colaborador" : "colaboradores"}</b>, com custo total por mês de <b>R$ ${pb.salI.toFixed(2)}</b>. 
          Produziam-se <b>${pb.prodMensalI.toLocaleString("pt-BR")} pçs/mês</b>, a custo de mão de obra de <b>R$ ${pb.custoI.toFixed(2)}</b>. 
          Após intervenção, permaneceram <b>${produtividade.operadoresT3 || 0} ${produtividade.operadoresT3 === 1 ? "colaborador" : "colaboradores"}</b>, com retorno mensal de <b>R$ ${pb.reducaoMensal.toFixed(2)}</b>. 
          Portanto, um payback de <b>${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(1) : "0.0"} ${pb.paybackMeses === 1 ? "mês" : "meses"}</b>.
        </p>

        <h3 style="text-transform: uppercase;">4. Laudo de Qualidade</h3>
        <p style="text-align: justify;">No estágio inicial, de um total de ${qualidade.quantidadeT1} peças, identificou-se ${qualidade.perdasT1} <b>${qualidade.perdasT1 === 1 ? "peça não conforme" : "peças não conformes"}</b>. Após as melhorias, o índice de assertividade evoluiu para <b>${qual.indiceT3.toFixed(2)}%</b>, garantindo maior confiabilidade ao processo.</p>

        <h3 style="text-transform: uppercase;">5. Laudo de Disponibilidade</h3>
        <p style="text-align: justify;">O tempo real de operação evoluiu de <b>${disp.realT1} ${getUnit(disp.realT1, disponibilidade.unidadeTempo)}</b> para <b>${disp.realT3} ${getUnit(disp.realT3, disponibilidade.unidadeTempo)}</b>, representando um aumento de <b>${disp.aumento.toFixed(2)}%</b> na utilização do recurso.</p>

        <h3 style="text-transform: uppercase;">6. Laudo de Movimentação Logística</h3>
        <p style="text-align: justify;">O tempo de movimentação foi reduzido de <b>${movimentacao.tempoT1} ${getUnit(movimentacao.tempoT1, movimentacao.unidadeTempo)}</b> para <b>${movimentacao.tempoT3} ${getUnit(movimentacao.tempoT3, movimentacao.unidadeTempo)}</b>, reduzindo desperdícios em <b>${mov.reducaoTempo.toFixed(2)}%</b>.</p>

        <h3 style="text-transform: uppercase;">7. Plano de Ação (5W2H)</h3>
        <p style="text-align: justify;">As principais definições do plano de ação contemplaram: <b>${acoesStr}</b>.</p>
        
        <h3 style="text-transform: uppercase;">8. Conclusão do Projeto</h3>
        <p style="text-align: justify;">O presente programa proporcionou a realização de consultoria na Empresa <b>${resumo.nomeEmpresa || "—"}</b>. Obteve-se um aumento de <b>${prod.ganho.toFixed(2)}%</b> em produtividade e um Payback de <b>${pb.paybackMeses.toFixed(2)} ${pb.paybackMeses === 1 ? "mês" : "meses"}</b>.</p>
        
        <p style="text-align: justify;">O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir os resultados alcançados e manter a melhoria contínua.</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Lean_${resumo.nomeEmpresa || 'Empresa'}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderPanelModules = () => {
    switch (activeModule) {
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} />;
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
      
      {/* Trava de Impressão: Força o modo Paisagem (Landscape) */}
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: landscape; margin: 10mm; } }` }} />

      {/* Esconde a Topbar na impressão */}
      <div className="print:hidden">
        <Topbar onExportWord={handleExportWord} />
      </div>
      
      {/* Limpa as margens e paddings na impressão */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 print:p-0 print:overflow-visible">
        
        {/* Remove bordas, sombras e arredondamentos na impressão */}
        <div className="mx-auto max-w-[1600px] bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/50 p-10 transition-all duration-500 min-h-full relative print:shadow-none print:border-none print:rounded-none print:p-0">
          
          {/* Módulos Globais */}
          {activeModule !== "gbo" && renderPanelModules()}

          {/* Módulo GBO */}
          <div className={activeModule === "gbo" ? "block w-full h-full" : "hidden"}>
            <GBOAnalysis />
          </div>

        </div>
      </main>

      {/* Esconde a Ilha Dinâmica na impressão */}
      <div className="print:hidden">
        <FloatingNav active={activeModule} onSelect={setActiveModule} />
      </div>
      
    </div>
  );
};

export default Index;
