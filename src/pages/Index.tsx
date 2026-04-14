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
    // Puxa o estado de todas as abas
    const { resumo, produtividade, payback, movimentacao, qualidade, disponibilidade, leadtime, area } = state;
    
    // Roda os motores de cálculo
    const prod = calcProdutividade(produtividade);
    const pb = calcPayback(payback, produtividade, resumo);
    const mov = calcMovimentacao(movimentacao);
    const qual = calcQualidade(qualidade);
    const disp = calcDisponibilidade(disponibilidade);
    const lt = calcLeadTime(leadtime);
    const ar = calcArea(area);
    
    const acoesStr = resumo.acoes.length > 0 ? resumo.acoes.map(a => a.what).join(", ") : "ações de melhoria contínua";

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #2563eb; text-align: center;">RELATÓRIO TÉCNICO DE CONSULTORIA</h1>
        <hr>
        
        <h3 style="text-transform: uppercase;">1. Descrição do Processo</h3>
        <p style="text-align: justify;">A Empresa ${resumo.nomeEmpresa || "—"}, da cidade de ${resumo.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${resumo.ramo || "—"}, especialista em ${resumo.especialista || "—"}, conta com ${resumo.totalColaboradores || "0"} colaboradores atuando em ${resumo.turnos} Turno(s). O produto mapeado segue o seguinte processo produtivo: ${resumo.processos || "—"}, com método de produção ${resumo.metodo || "—"}, onde a demanda é originada por ${resumo.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${resumo.oportunidades || "—"}, por problemas de ${resumo.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${resumo.atuacao || "—"}.</p>
        
        <h3 style="text-transform: uppercase;">2. Laudo Operacional e Resultados</h3>
        <p style="text-align: justify;">Após definição do ponto de intervenção, monitoramento e validação das melhorias nas operações, obtiveram-se os seguintes indicadores técnicos:</p>
        
        <ul style="font-weight: bold; line-height: 1.8;">
          <li>Produtividade: Aumento de ${prod.ganho.toFixed(2)}% (de ${prod.pphT1.toFixed(2)} para ${prod.pphT3.toFixed(2)} PPH).</li>
          <li>Qualidade: Evolução de ${qual.indiceT1.toFixed(2)}% para ${qual.indiceT3.toFixed(2)}% de eficiência.</li>
          <li>Disponibilidade: Aumento de ${disp.aumento.toFixed(2)}% no índice de disponibilidade.</li>
          <li>Movimentação Logística: Redução de ${mov.reducaoDist.toFixed(2)}% na distância percorrida e ${mov.reducaoTempo.toFixed(2)}% no tempo.</li>
          <li>Lead Time: Redução de ${lt.reducao.toFixed(2)}% no tempo total de atravessamento.</li>
          <li>Área Ocupada: Otimização de ${ar.reducaoPercent.toFixed(2)}% (${ar.economiaM2.toFixed(2)} m² liberados), gerando impacto de R$ ${ar.economiaMensal.toFixed(2)}/mês.</li>
          <li style="color: #2563eb; margin-top: 8px;">Retorno do Investimento (Payback): ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.</li>
        </ul>
        
        <h3 style="text-transform: uppercase;">3. Plano de Ação</h3>
        <p style="text-align: justify;">Foram elaboradas diversas ações utilizando a ferramenta 5W2H para atacar as causas raiz identificadas. Principais intervenções: ${acoesStr}.</p>
        
        <p style="text-align: justify; font-style: italic; margin-top: 20px;">O resultado geral do projeto foi agregador e positivo para a empresa. O envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos e resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores.</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Tecnico_${resumo.nomeEmpresa || 'Indicadores'}.doc`;
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
