import { useState } from "react";
import { 
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback 
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prod = calcProdutividade(state.produtividade);
  const pb = calcPayback(state.payback, state.produtividade, state.resumo);

  // --- Lógica de Cópia ---
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto copiado com sucesso!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const descTexto = `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "—"} colaboradores atuando em ${data.turnos} Turno(s). O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;

  const conclusaoTexto = `O presente programa de fomento ao setor industrial brasileiro proporcionou a realização de consultoria em manufatura enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada ${data.motivacao || "—"}. As ferramentas aplicadas foram ${data.ferramentas || "—"}. Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: ${data.acoes.map(a => a.what).join(", ")}. Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se: Aumento de ${prod.ganho.toFixed(2)}% em produtividade; Payback: Com as ações aplicadas obtém-se um Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses. O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para entendimento e aplicação dos conceitos, ficando o legado para continuidade de novas ações e melhorias.`;

  const addAcao = () => {
    if (!newAcao.what) return;
    const a: Acao5W2H = { id: Date.now().toString(), what: newAcao.what || "-", why: "-", where: "-", when: "-", who: newAcao.who || "-", how: "-", howMuch: "-" };
    onChange({ acoes: [...data.acoes, a] });
    setNewAcao({});
  };

  return (
    <div className="flex gap-8 h-full">
      {/* FORMULÁRIOS (60%) */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Caracterização e Contexto</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nome da Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
            <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
            <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
            <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
            <InputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
            <InputField label="Turnos Ativos" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} type="number" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Detalhes Técnicos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><InputField label="Fluxo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} /></div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Método</label>
              <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={data.metodo} onChange={e => onChange({ metodo: e.target.value as any })}>
                <option value="">Selecione...</option>
                <option value="empurrada">Produção Empurrada</option>
                <option value="puxada">Produção Puxada</option>
              </select>
            </div>
            <InputField label="Origem da Demanda" value={data.origem} onChange={v => onChange({ origem: v })} />
            <InputField label="Oportunidades" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <InputField label="Problemas" value={data.problemas} onChange={v => onChange({ problemas: v })} />
            <InputField label="Área de Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            <InputField label="Motivação" value={data.motivacao} onChange={v => onChange({ motivacao: v })} />
            <div className="col-span-2"><InputField label="Ferramentas Lean" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Plano de Ação</h3>
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="col-span-2"><InputField label="Ação" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v }))} /></div>
             <InputField label="Quem?" value={newAcao.who || ""} onChange={v => setNewAcao(p => ({ ...p, who: v }))} />
             <button onClick={addAcao} className="h-10 mt-5 bg-blue-600 text-white rounded-md font-bold text-[10px] uppercase hover:bg-blue-700 transition-all shadow-md active:scale-95">+ Adicionar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.acoes.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm animate-in fade-in zoom-in duration-300">
                <span>{a.what}</span>
                <button onClick={() => onChange({ acoes: data.acoes.filter(x => x.id !== a.id) })} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PREVIEWS COM BOTÃO DE COPIAR (40%) */}
      <div className="w-[40%] flex flex-col gap-6 overflow-y-auto pb-10">
        
        {/* Card 1: Descrição */}
        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
          <button 
            onClick={() => handleCopy(descTexto, "desc")}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            title="Copiar para o relatório"
          >
            {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Descrição do Processo</h4>
          <p className="text-sm text-slate-600 leading-relaxed text-justify">{descTexto}</p>
        </div>

        {/* Card 2: Conclusão */}
        <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl group">
          <button 
            onClick={() => handleCopy(conclusaoTexto, "conc")}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
            title="Copiar conclusão"
          >
            {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Conclusão do Projeto</h4>
          <div className="text-[13px] text-slate-300 leading-relaxed text-justify space-y-4">
            <p>{conclusaoTexto.split("obteve-se:")[0]} obteve-se:</p>
            <ul className="space-y-1 font-bold text-white border-l-2 border-blue-500 pl-4 my-4">
              <li>• Aumento de {prod.ganho.toFixed(2)}% em produtividade.</li>
              <li>• Payback de {pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.</li>
            </ul>
            <p className="italic text-slate-400">O resultado geral do projeto foi agregador e positivo...</p>
          </div>
        </div>

      </div>
    </div>
  );
}
