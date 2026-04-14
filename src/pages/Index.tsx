import { useAppStore } from "@/store/useAppStore";
import { FloatingNav } from "@/components/FloatingNav"; // Novo
import { Topbar } from "@/components/Topbar";
import { ProdutividadeModule } from "@/modules/ProdutividadeModule";
import { PaybackModule } from "@/modules/PaybackModule";
import { ResumoModule } from "@/modules/ResumoModule";
// ... outros imports de módulos

const Index = () => {
  const { state, activeModule, setActiveModule, updateModule, exportJSON, importJSON } = useAppStore();

  const renderModule = () => {
    switch (activeModule) {
      case "resumo": return <ResumoModule data={state.resumo} state={state} onChange={d => updateModule("resumo", d)} />;
      case "payback": return <PaybackModule data={state.payback} prodData={state.produtividade} resumoData={state.resumo} onChange={d => updateModule("payback", d)} />;
      case "produtividade": return <ProdutividadeModule data={state.produtividade} onChange={d => updateModule("produtividade", d)} />;
      // ... mantenha os outros cases
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Topbar onExport={exportJSON} onImport={importJSON} onPDF={() => window.print()} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24"> {/* pb-24 dá espaço para a ilha */}
        <div className="mx-auto max-w-[1600px] min-h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8">
          {renderModule()}
        </div>
      </main>

      <FloatingNav active={activeModule} onSelect={setActiveModule} />
    </div>
  );
};

export default Index;
