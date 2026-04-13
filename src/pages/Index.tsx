import { useAppStore } from "@/store/useAppStore";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { MovimentacaoModule } from "@/modules/MovimentacaoModule";
import { QualidadeModule } from "@/modules/QualidadeModule";
import { DisponibilidadeModule } from "@/modules/DisponibilidadeModule";
import { LeadTimeModule } from "@/modules/LeadTimeModule";
import { AreaModule } from "@/modules/AreaModule";
import { ResumoModule } from "@/modules/ResumoModule";
import { toast } from "sonner";

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule, exportJSON, importJSON } = useAppStore();

  const handlePDF = () => {
    toast.info("Preparando relatório para impressão...");
    setTimeout(() => window.print(), 500);
  };

  const renderModule = () => {
    switch (activeModule) {
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} />;
      case "produtividade": return <ProdutividadeModule data={state.produtividade} onChange={d => updateModule("produtividade", d)} />;
      case "payback": return <PaybackModule data={state.payback} prodData={state.produtividade} resumoData={state.resumo} onChange={d => updateModule("payback", d)} />;
      case "movimentacao": return <MovimentacaoModule data={state.movimentacao} onChange={d => updateModule("movimentacao", d)} />;
      case "qualidade": return <QualidadeModule data={state.qualidade} onChange={d => updateModule("qualidade", d)} />;
      case "disponibilidade": return <DisponibilidadeModule data={state.disponibilidade} onChange={d => updateModule("disponibilidade", d)} />;
      case "leadtime": return <LeadTimeModule data={state.leadtime} onChange={d => updateModule("leadtime", d)} />;
      case "area": return <AreaModule data={state.area} onChange={d => updateModule("area", d)} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar active={activeModule} onSelect={setActiveModule} />
      
      <div className="flex-1 flex flex-col h-screen relative bg-[#F8FAFC]">
        <Topbar onExport={exportJSON} onImport={importJSON} onPDF={handlePDF} />
        
        {/* Canvas de Fundo Flutuante */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-[1400px] h-full min-h-[800px] bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 transition-all">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
