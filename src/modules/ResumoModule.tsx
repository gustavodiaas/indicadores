import { useState, useMemo } from "react";
import { 
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback 
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Copy, Check, Building2, Factory, FileCheck, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<"id" | "diag" | "5w2h" | "final">("id");
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Motores de Cálculo Sincronizados ---
  const prod = useMemo(() => calcProdutividade(state.produtividade), [state.produtividade]);
  const pb = useMemo(() => calcPayback(state.payback, state.produtividade, state.resumo), [state.payback, state.produtividade, state.resumo]);

  // --- Strings de Saída (Onde o casamento acontece) ---
  const descTexto = `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} colaboradores atuando em ${data.turnos} Turno(s). O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;

  const conclusaoTexto = `O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada ${data.motivacao || "—"}. As ferramentas aplicadas foram ${data.ferramentas || "—"}. Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: ${data.acoes.length > 0 ? data.acoes.map(a => a.what).join(", ") : "melhorias contínuas"}. Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se: Aumento de ${prod.ganho.toFixed(2)}% em produtividade. Payback: Com as ações aplicadas obtém-se um Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses. O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de trabalho da produção.`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto pronto para o relatório!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Menu de Abas Premium */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {[
          { id: "id", label: "Identidade", icon: Building2 },
          { id: "diag", label: "Diagnóstico", icon: Factory },
          { id: "5w2h", label: "Plano de Ação", icon: ClipboardList },
          { id: "final", label: "Relatório Final", icon: FileCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 overflow-y-auto pr-2">
        
        {activeTab === "id" && (
          <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Dados Institucionais</h3>
              <InputField label="Nome da Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
              <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
              <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Porte e Estrutura</h3>
              <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
              <InputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
              <InputField label="Turnos Ativos" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} type="number" />
            </div>
          </div>
        )}

        {activeTab === "diag" && (
          <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">O Processo</h3>
              <InputField label="Processo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
              <InputField label="Método (Puxada/Empurrada)" value={data.metodo} onChange={v => onChange({ metodo: v as any })} />
              <InputField label="Origem da Demanda" value={data.origem} onChange={v => onChange({ origem: v })} />
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Intervenção</h3>
              <InputField label="Problemas e Oportunidades" value={data.problemas} onChange={v => onChange({ problemas: v })} />
              <InputField label="Área de Atuação" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
              <InputField label="Motivação e Ferramentas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} />
            </div>
          </div>
        )}

        {activeTab === "5w2h" && (
          <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-800">Plano de Ação</h3>
            <div className="flex gap-2 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-1"><InputField label="Descreva a Ação Realizada" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v }))} /></div>
              <button 
                onClick={() => {
                  if(!newAcao.what) return;
                  onChange({ acoes: [...data.acoes, { id: Date.now().toString(), what: newAcao.what, why: "-", where: "-", when: "-", who: "Equipe", how: "-", howMuch: "-" }] });
                  setNewAcao({});
                }} 
                className="h-10 px-8 bg-blue-600 text-white rounded-lg font-bold uppercase text-xs hover:bg-blue-700 transition-all active:scale-95"
              >
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {data.acoes.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm group hover:border-blue-200 transition-all">
                  <span className="text-sm font-semibold text-slate-700">{a.what}</span>
                  <button onClick={() => onChange({ acoes: data.acoes.filter(x => x.id !== a.id) })} className="text-slate-300 hover:text-rose-600 transition-colors p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "final" && (
          <div className="grid grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
            {/* Bloco 1: Descrição */}
            <div className="relative bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
              <button onClick={() => handleCopy(descTexto, "desc")} className="absolute top-6 right-6 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">Descrição do Processo</h4>
              <p className="text-sm text-slate-600 leading-relaxed text-justify font-medium italic">"{descTexto}"</p>
            </div>

            {/* Bloco 2: Conclusão (O Escuro) */}
            <div className="relative bg-[#0f172a] p-8 rounded-2xl shadow-2xl border border-slate-800">
              <button onClick={() => handleCopy(conclusaoTexto, "conc")} className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-8 border-b border-slate-800 pb-4">Conclusão Brasil Mais Produtivo</h4>
              <div className="text-[13px] text-slate-300 leading-relaxed text-justify space-y-6">
                <p>O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou consultoria em Manufatura Enxuta na Empresa <strong>{data.nomeEmpresa || "—"}</strong>.</p>
                <div className="bg-blue-600/10 border-l-4 border-blue-500 p-5 space-y-3 rounded-r-xl">
                  <p className="font-bold text-white text-sm">Aumento de {prod.ganho.toFixed(2)}% em produtividade.</p>
                  <p className="font-bold text-white text-sm">Payback de {pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.</p>
                </div>
                <p className="text-[11px] text-slate-500 italic border-t border-slate-800 pt-6 leading-relaxed">
                  O resultado geral do projeto foi agregador e positivo para a empresa pois o envolimento da equipe foi primordial para entendimento e aplicação dos conceitos, ficando o legado para continuidade de novas ações e melhorias.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
