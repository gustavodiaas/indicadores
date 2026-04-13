import { useState, useMemo } from "react";
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

  // --- Cálculos Dinâmicos (Sempre atualizados com o estado global) ---
  const prod = useMemo(() => calcProdutividade(state.produtividade), [state.produtividade]);
  const pb = useMemo(() => calcPayback(state.payback, state.produtividade, state.resumo), [state.payback, state.produtividade, state.resumo]);

  // --- Formatação dos Textos para Cópia ---
  const descTexto = useMemo(() => `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} colaboradores atuando em ${data.turnos} Turno(s). O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`, [data]);

  const conclusaoTexto = useMemo(() => {
    const listaAcoes = data.acoes.length > 0 ? data.acoes.map(a => a.what).join(", ") : "ações de melhoria contínua";
    return `O presente programa de fomento ao setor industrial brasileiro proporcionou a realização de consultoria em manufatura enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada ${data.motivacao || "—"}. As ferramentas aplicadas foram ${data.ferramentas || "—"}. Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}. Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se: Aumento de ${prod.ganho.toFixed(2)}% em produtividade. Payback: Com as ações aplicadas obtém-se um Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses. O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para entendimento e aplicação dos conceitos, ficando o legado para continuidade de novas ações e melhorias.`;
  }, [data, prod, pb]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto copiado para o relatório!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addAcao = () => {
    if (!newAcao.what) return;
    const a: Acao5W2H = { id: Date.now().toString(), what: newAcao.what, why: "-", where: "-", when: "-", who: newAcao.who || "Equipe", how: "-", howMuch: "-" };
    onChange({ acoes: [...data.acoes, a] });
    setNewAcao({});
  };

  return (
    <div className="flex gap-8 h-full">
      {/* COLUNA ESQUERDA: FORMULÁRIOS */}
      <div className="w-[55%] flex flex-col gap-6 overflow-y-auto pr-4 pb-10">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Dados da Empresa</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
            <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
            <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
            <InputField label="Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Variáveis do Laudo</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} placeholder="Ex: Alto índice de perdas..." />
            <InputField label="Ferramentas Lean" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} placeholder="Ex: VSM, 5S, Kaizen..." />
            <div className="col-span-2">
              <InputField label="Área de Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Plano de Ação (5W2H)</h3>
          <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1"><InputField label="Ação realizada" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v }))} /></div>
            <button onClick={addAcao} className="h-10 px-4 bg-blue-600 text-white rounded-md font-bold text-xs uppercase hover:bg-blue-700 active:scale-95 transition-all">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.acoes.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600">
                {a.what}
                <button onClick={() => onChange({ acoes: data.acoes.filter(x => x.id !== a.id) })} className="text-rose-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: PREVIEWS (BLOCOS QUE VOCÊ QUERIA AJUSTAR) */}
      <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pb-10">
        
        {/* Bloco 1: Descrição do Processo */}
        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => handleCopy(descTexto, "desc")}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Descrição do Processo</h4>
          <p className="text-sm text-slate-600 leading-relaxed text-justify italic">"{descTexto}"</p>
        </div>

        {/* Bloco 2: Conclusão do Projeto (O PRETO DA IMAGEM) */}
        <div className="relative bg-[#0f172a] p-8 rounded-2xl shadow-2xl border border-slate-800">
          <button 
            onClick={() => handleCopy(conclusaoTexto, "conc")}
            className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Conclusão do Projeto</h4>
          
          <div className="text-[13px] text-slate-300 leading-relaxed text-justify space-y-6">
            <p>
              O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa <strong>{data.nomeEmpresa || "—"}</strong>, 
              na cidade de <strong>{data.cidade || "—"}</strong>. A escolha foi motivada <strong>{data.motivacao || "—"}</strong>. 
              As ferramentas aplicadas foram <strong>{data.ferramentas || "—"}</strong>.
            </p>

            <div className="border-l-2 border-blue-500 pl-4 py-1 space-y-3">
              <p className="font-bold text-white flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Aumento de {prod.ganho.toFixed(2)}% em produtividade.
              </p>
              <p className="font-bold text-white flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Payback de {pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.
              </p>
            </div>

            <p className="italic text-slate-400 text-xs">
              O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e 
resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas 
de trabalho da produção.

            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
