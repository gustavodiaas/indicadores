import { useState } from "react";
import { 
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback 
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});

  // Motores de cálculo para a conclusão
  const prod = calcProdutividade(state.produtividade);
  const pb = calcPayback(state.payback, state.produtividade, state.resumo);

  const addAcao = () => {
    if (!newAcao.what) return;
    const a: Acao5W2H = {
      id: Date.now().toString(),
      what: newAcao.what || "-",
      why: newAcao.why || "-",
      where: newAcao.where || "-",
      when: newAcao.when || "-",
      who: newAcao.who || "-",
      how: newAcao.how || "-",
      howMuch: newAcao.howMuch || "-",
    };
    onChange({ acoes: [...data.acoes, a] });
    setNewAcao({});
  };

  const removeAcao = (id: string) => {
    onChange({ acoes: data.acoes.filter(a => a.id !== id) });
  };

  return (
    <div className="flex gap-8 h-full">
      
      {/* FORMULÁRIOS (60%) */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Caracterização e Contexto</h3>
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
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Detalhes da Intervenção</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <InputField label="Produto/Processo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1 uppercase text-[10px] tracking-wider">Método de Produção</label>
              <select 
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={data.metodo} 
                onChange={e => onChange({ metodo: e.target.value as any })}
              >
                <option value="">Selecione...</option>
                <option value="empurrada">Produção Empurrada</option>
                <option value="puxada">Produção Puxada</option>
              </select>
            </div>
            <InputField label="Demanda Originada por" value={data.origem} onChange={v => onChange({ origem: v })} />
            <InputField label="Oportunidades no Setor" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <InputField label="Problemas Identificados" value={data.problemas} onChange={v => onChange({ problemas: v })} />
            <InputField label="Área de Atuação" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            <InputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} placeholder="Por que este produto?" />
            <div className="col-span-2">
               <InputField label="Ferramentas Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} placeholder="Ex: 5S, VSM, Kanban..." />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Plano de Ação (5W2H)</h3>
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="col-span-2"><InputField label="O quê? (What)" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v }))} /></div>
             <InputField label="Quem? (Who)" value={newAcao.who || ""} onChange={v => setNewAcao(p => ({ ...p, who: v }))} />
             <div className="flex items-end">
               <button onClick={addAcao} className="h-10 w-full bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors text-xs uppercase tracking-tighter">
                 + Adicionar
               </button>
             </div>
          </div>
          
          {data.acoes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.acoes.map(a => (
                <div key={a.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                  <span>{a.what} ({a.who})</span>
                  <button onClick={() => removeAcao(a.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW NARRATIVO (40%) */}
      <div className="w-[40%] flex flex-col gap-6 overflow-y-auto pr-2">
        
        {/* Seção 1: Descrição do Processo */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 border-b pb-2">Descrição do Processo</h4>
          <div className="text-sm text-slate-700 leading-relaxed text-justify space-y-4">
            <p>
              A Empresa <strong>{data.nomeEmpresa || "—"}</strong>, da cidade de <strong>{data.cidade || "—"}</strong> no Estado do Rio Grande do Sul, 
              atua no ramo de <strong>{data.ramo || "—"}</strong>, especialista em <strong>{data.especialista || "—"}</strong>, 
              conta com <strong>{data.totalColaboradores || "—"}</strong> colaboradores atuando em <strong>{data.turnos} Turno(s)</strong>.
            </p>
            <p>
              O produto mapeado segue o seguinte processo produtivo: <strong>{data.processos || "—"}</strong>, 
              com método de produção <strong>{data.metodo || "—"}</strong>, onde a demanda é originada por <strong>{data.origem || "—"}</strong>.
            </p>
            <p>
              Ao longo do mapeamento foi identificado oportunidades no setor de <strong>{data.oportunidades || "—"}</strong>, 
              por problemas de <strong>{data.problemas || "—"}</strong>. Nesta consultoria, a área de atuação/intervenção foi <strong>{data.atuacao || "—"}</strong>.
            </p>
          </div>
        </div>

        {/* Seção 2: Conclusão */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm text-slate-300">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Conclusão do Projeto</h4>
          <div className="text-xs leading-relaxed text-justify space-y-4">
            <p>
              O presente programa de fomento ao setor industrial brasileiro proporcionou a realização de consultoria em manufatura enxuta na Empresa <strong>{data.nomeEmpresa || "—"}</strong>, na cidade de <strong>{data.cidade || "—"}</strong> no Estado do Rio Grande do Sul.
            </p>
            <p>
              A escolha do produto a ser mapeado foi motivada <strong>{data.motivacao || "—"}</strong>. 
              As ferramentas aplicadas foram <strong>{data.ferramentas || "—"}</strong>.
            </p>
            <p>
              Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como:
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                {data.acoes.map(a => <li key={a.id}>{a.what}</li>)}
                {data.acoes.length === 0 && <li>(Nenhuma ação listada)</li>}
              </ul>
            </p>
            <p className="pt-2">
              Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:
              <ul className="mt-2 space-y-1 font-bold text-white">
                <li>• Aumento de {prod.ganho.toFixed(2)}% em produtividade.</li>
                <li>• Payback: Com as ações aplicadas obtém-se um Payback de {pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} meses.</li>
              </ul>
            </p>
            <p className="mt-4 italic text-slate-400">
              O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para entendimento e aplicação dos conceitos, ficando o legado para continuidade de novas ações e melhorias.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
