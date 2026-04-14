import { useAppStore, calcProdutividade, calcPayback } from "@/store/useAppStore";
import { FloatingNav } from "@/components/FloatingNav";
import { Topbar } from "@/components/Topbar";
import { ResumoModule } from "@/modules/ResumoModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { MovimentacaoModule } from "@/modules/MovimentacaoModule";
import { QualidadeModule } from "@/modules/QualidadeModule";
import { DisponibilidadeModule } from "@/modules/DisponibilidadeModule";
import { LeadTimeModule } from "@/modules/LeadTimeModule";
import { AreaModule } from "@/modules/AreaModule";

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule } = useAppStore();

  const handleExportWord = () => {
    const { resumo, produtividade, payback } = state;
    const prod = calcProdutividade(produtividade);
    const pb = calcPayback(payback, produtividade, resumo);
    const acoesStr = resumo.acoes.length > 0 ? resumo.acoes.map(a => a.what).join(", ") : "ações de melhoria contínua";

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #2563eb; text-align: center;">RELATÓRIO TÉCNICO DE CONSULTORIA</h1>
        <hr>
        <h3 style="text-transform: uppercase;">1. Descrição do Processo</h3>
        <p style="text-align: justify;">A Empresa ${resumo.nomeEmpresa || "—"}, da cidade de ${resumo.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${resumo.ramo || "—"}, especialista em ${resumo.especialista || "—"}, conta com ${resumo.totalColaboradores || "0"} colaboradores atuando em ${resumo.turnos} Turno(s). O produto mapeado segue o seguinte processo produtivo: ${resumo.processos || "—"}, com método de produção ${resumo.metodo || "—"}, onde a demanda é originada por ${resumo.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${resumo.oportunidades || "—"}, por problemas de ${resumo.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${resumo.atuacao || "—"}.</p>
        
        <h3 style="text-transform: uppercase;">2. Conclusão do Projeto</h3>
        <p style="text-align: justify;">O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${resumo.nomeEmpresa || "—"}, na cidade de ${resumo.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada ${resumo.motivacao || "—"}. As ferramentas aplicadas foram ${resumo.ferramentas || "—"}. Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: ${acoesStr}.</p>
        
        <p style="text-align: justify;">Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:</p>
        <ul style="font-weight: bold;">
          <li>Aumento de ${prod.ganho.toFixed(2)}% em produtividade.</li>
          <li>Payback: Com as ações aplicadas obtém-se um Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.</li>
        </ul>
        
        <p style="text-align: justify; font-style: italic;">O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de trabalho da produção.</p>
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

  const renderModule = () => {
    switch (activeModule) {
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} />;
      case "payback": return <PaybackModule data={state.payback} prodData={state.produtividade} resumoData={state.resumo} onChange={d => updateModule("payback", d)} />;
      case "produtividade": return <ProdutividadeModule data={state.produtividade} onChange={d => updateModule("produtividade", d)} />;
      case "movimentacao": return <MovimentacaoModule data={state.movimentacao} onChange={d => updateModule("movimentacao", d)} />;
      case "qualidade": return <QualidadeModule data={state.qualidade} onChange={d => updateModule("qualidade", d)} />;
      case "disponibilidade": return <DisponibilidadeModule data={state.disponibilidade} onChange={d => updateModule("disponibilidade", d)} />;
      case "leadtime": return <LeadTimeModule data={state.leadtime} onChange={d => updateModule("leadtime", d)} />;
      case "area": return <AreaModule data={state.area} onChange={d => updateModule("area", d)} />;
      case "gbo": return <GboModule data={state.gbo} onChange={d => updateModule("gbo", d)} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-inter">
      <Topbar onExportWord={handleExportWord} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="mx-auto max-w-[1600px] bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/50 p-10 transition-all duration-500 min-h-full">
          {renderModule()}
        </div>
      </main>

      <FloatingNav active={activeModule} onSelect={setActiveModule} />
    </div>
  );
};

export default Index;
