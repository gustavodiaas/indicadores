import { useAppStore } from "@/store/useAppStore";
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
  const { state, activeModule, setActiveModule, updateModule, exportJSON, importJSON } = useAppStore();

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
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-inter">
      <Topbar onExport={exportJSON} onImport={importJSON} onPDF={() => window.print()} />
      
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
