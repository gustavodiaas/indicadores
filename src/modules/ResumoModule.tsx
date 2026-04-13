import { useState } from "react";
import { type ResumoData, type AppState, type Acao5W2H } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});

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

  return (
    <div className="flex gap-8 h-full">
      
      {/* Formulários de Caracterização (60%) */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Caracterização da Empresa</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nome da Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
            <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
            <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
            <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} placeholder="Ex: Injeção de plásticos" />
            <InputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
            <InputField label="Turnos Ativos" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} type="number" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Descrição do Processo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <InputField label="Produto/Processo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} placeholder="Descreva o fluxo produtivo..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1 uppercase text-xs font-semibold tracking-wider">Método de Produção</label>
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
            <InputField label="Demanda Originada por" value={data.origem} onChange={v => onChange({ origem: v })} placeholder="Ex: Pedidos, Estoque..." />
            <InputField label="Oportunidades no Setor" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <InputField label="Problemas Identificados" value={data.problemas} onChange={v => onChange({ problemas: v })} />
            <div className="col-span-2">
               <InputField label="Área de Atuação/Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-lg">Plano de Ação (5W2H)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <InputField label="O quê?" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v }))} />
             <InputField label="Por quê?" value={newAcao.why || ""} onChange={v => setNewAcao(p => ({ ...p, why: v }))} />
             <InputField label="Quem?" value={newAcao.who || ""} onChange={v => setNewAcao(p => ({ ...p, who: v }))} />
             <div className="flex items-end">
               <button onClick={addAcao} className="h-10 w-full bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                 + Adicionar Ação
               </button>
             </div>
          </div>
          {/* Listagem das ações aqui (opcional manter como estava antes) */}
        </div>
      </div>

      {/* Preview Narrativo (40%) */}
      <div className="w-[40%] bg-white p-8 rounded-2xl border border-slate-200 shadow-xl overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-blue-600 inline-block">
          Descrição do Processo Produtivo
        </h3>
        
        <div className="text-base text-slate-700 leading-relaxed text-justify space-y-6">
          <p>
            A Empresa <strong>{data.nomeEmpresa || "—"}</strong>, da cidade de <strong>{data.cidade || "—"}</strong> no Estado do Rio Grande do Sul, 
            atua no ramo de <strong>{data.ramo || "—"}</strong>, especialista em <strong>{data.especialista || "—"}</strong>, 
            conta com <strong>{data.totalColaboradores || "0"}</strong> colaboradores atuando em <strong>{data.turnos} Turno(s)</strong>.
          </p>
          
          <p>
            O produto mapeado segue o seguinte processo produtivo: <strong>{data.processos || "—"}</strong>, 
            com método de produção <strong>{data.metodo === "puxada" ? "Puxada" : data.metodo === "empurrada" ? "Empurrada" : "—"}</strong>, 
            onde a demanda é originada por <strong>{data.origem || "—"}</strong>.
          </p>
          
          <p>
            Ao longo do mapeamento foi identificado oportunidades no setor de <strong>{data.oportunidades || "—"}</strong>, 
            por problemas de <strong>{data.problemas || "—"}</strong>.
          </p>
          
          <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 italic">
            Nesta consultoria, a área de atuação/intervenção foi <strong>{data.atuacao || "—"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
