import { useState } from "react";
import {
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback, calcMovimentacao,
  calcQualidade, calcDisponibilidade, calcLeadTime, calcArea
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

  // Recuperando os cálculos exatos de todos os módulos
  const prod = calcProdutividade(state.produtividade);
  const pb = calcPayback(state.payback, state.produtividade, state.resumo);
  const mov = calcMovimentacao(state.movimentacao);
  const qual = calcQualidade(state.qualidade);
  const disp = calcDisponibilidade(state.disponibilidade);
  const lt = calcLeadTime(state.leadtime);
  const ar = calcArea(state.area);

  const addAcao = () => {
    // Só adiciona se o "What" estiver preenchido, para evitar linhas em branco
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

  const formatBRL = (val: number) => 
    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex gap-8 h-full">
      
      {/* Formulários Estratégicos (60%) */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Dados do Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nome da Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v as string })} type="text" />
            <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v as string })} type="text" />
            <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v as string })} type="text" />
            <InputField label="Turnos Ativos" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Diagnóstico Operacional</h3>
          <InputField label="Processo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v as string })} type="text" placeholder="Ex: Montagem, Usinagem, Embalagem..." />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Método de Produção</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                value={data.metodo} 
                onChange={e => onChange({ metodo: e.target.value as any })}
              >
                <option value="">Selecione...</option>
                <option value="empurrada">Empurrada</option>
                <option value="puxada">Puxada</option>
              </select>
            </div>
            <InputField label="Origem da Demanda" value={data.origem} onChange={v => onChange({ origem: v as string })} type="text" placeholder="Ex: Pedido do cliente, Estoque..." />
            <InputField label="Oportunidades (Setores)" value={data.oportunidades} onChange={v => onChange({ oportunidades: v as string })} type="text" />
            <InputField label="Problemas Identificados" value={data.problemas} onChange={v => onChange({ problemas: v as string })} type="text" />
            <InputField label="Foco da Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v as string })} type="text" placeholder="Ex: Célula de montagem A" />
            <InputField label="Motivação do Mapeamento" value={data.motivacao} onChange={v => onChange({ motivacao: v as string })} type="text" />
          </div>
          <InputField label="Ferramentas Lean Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v as string })} type="text" placeholder="Ex: 5S, VSM, Kanban, SMED..." />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Plano de Ação (5W2H)</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <InputField label="O quê? (What)" value={newAcao.what || ""} onChange={v => setNewAcao(p => ({ ...p, what: v as string }))} type="text" />
            <InputField label="Por quê? (Why)" value={newAcao.why || ""} onChange={v => setNewAcao(p => ({ ...p, why: v as string }))} type="text" />
            <InputField label="Onde? (Where)" value={newAcao.where || ""} onChange={v => setNewAcao(p => ({ ...p, where: v as string }))} type="text" />
            <InputField label="Quando? (When)" value={newAcao.when || ""} onChange={v => setNewAcao(p => ({ ...p, when: v as string }))} type="text" />
            <InputField label="Quem? (Who)" value={newAcao.who || ""} onChange={v => setNewAcao(p => ({ ...p, who: v as string }))} type="text" />
            <InputField label="Como? (How)" value={newAcao.how || ""} onChange={v => setNewAcao(p => ({ ...p, how: v as string }))} type="text" />
            <InputField label="Quanto? (How Much)" value={newAcao.howMuch || ""} onChange={v => setNewAcao(p => ({ ...p, howMuch: v as string }))} type="text" />
            
            <div className="flex items-end">
              <button 
                onClick={addAcao}
                className="h-10 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </button>
            </div>
          </div>

          {data.acoes.length > 0 && (
            <div className="space-y-2 mt-4">
              {data.acoes.map(a => (
                <div key={a.id} className="relative flex flex-col gap-1 p-4 rounded-md border border-slate-200 bg-white text-sm shadow-sm">
                  <button 
                    onClick={() => removeAcao(a.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remover Ação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p><strong>O quê:</strong> {a.what}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2 text-slate-600">
                    <p><strong className="text-slate-800">Por quê:</strong> {a.why}</p>
                    <p><strong className="text-slate-800">Onde:</strong> {a.where}</p>
                    <p><strong className="text-slate-800">Quando:</strong> {a.when}</p>
                    <p><strong className="text-slate-800">Quem:</strong> {a.who}</p>
                    <p><strong className="text-slate-800">Como:</strong> {a.how}</p>
                    <p><strong className="text-slate-800">Quanto:</strong> {a.howMuch}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Relatório Final Executivo (40%) */}
      <div className="w-[40%] flex flex-col gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xl overflow-y-auto">
        <div className="border-b border-slate-200 pb-4 mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Relatório Executivo</h3>
        </div>
        
        <div className="text-sm text-slate-700 space-y-4 leading-relaxed text-justify">
          <p>
            O presente programa proporcionou a realização de consultoria em manufatura enxuta na Empresa <strong>{data.nomeEmpresa || "[Nome da Empresa]"}</strong>, na cidade de <strong>{data.cidade || "[Cidade]"}</strong> no Estado do Rio Grande do Sul.
          </p>
          <p>
            A empresa atua no ramo de <strong>{data.ramo || "[Ramo]"}</strong> e opera em regime de <strong>{data.turnos} turno(s)</strong>. A escolha do produto mapeado foi motivada por: <strong>{data.motivacao || "[Motivação]"}</strong>. O processo produtivo segue a lógica de <strong>{data.processos || "[Processos]"}</strong>, sob método de produção <strong>{data.metodo || "[Método]"}</strong> com demanda originada por <strong>{data.origem || "[Origem]"}</strong>.
          </p>
          <p>
            Ao longo do mapeamento, foram identificadas oportunidades no setor de <strong>{data.oportunidades || "[Setores]"}</strong>, devido a problemas de <strong>{data.problemas || "[Problemas]"}</strong>. O foco da intervenção foi a área de <strong>{data.atuacao || "[Área de Atuação]"}</strong>, onde aplicamos as seguintes ferramentas Lean: <strong>{data.ferramentas || "[Ferramentas]"}</strong>.
          </p>

          {data.acoes.length > 0 && (
            <div className="bg-slate-50 p-3 border border-slate-200 rounded-md my-4">
              <p className="font-semibold mb-2">Plano de Ação Traçado (Resumo):</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {data.acoes.map(a => (
                  <li key={a.id}><strong>{a.what}</strong> (Responsável: {a.who} - Prazo: {a.when})</li>
                ))}
              </ul>
            </div>
          )}

          <p className="font-semibold text-slate-900 mt-6 border-b pb-1">Resultados e Impactos Mensurados:</p>
          <ul className="space-y-2 list-none pl-0">
            {prod.ganho > 0 && (
              <li>🚀 <strong>Produtividade:</strong> Ganho de <strong>{prod.ganho.toFixed(2)}%</strong> (Atingindo {prod.pphT3.toFixed(2)} pçs/h/op).</li>
            )}
            {qual.aumento > 0 && (
              <li>🎯 <strong>Qualidade:</strong> Índice de peças boas subiu <strong>{qual.aumento.toFixed(2)}%</strong>.</li>
            )}
            {disp.aumento > 0 && (
              <li>⚙️ <strong>Disponibilidade:</strong> Aumento de <strong>{disp.aumento.toFixed(2)}%</strong> no tempo de máquina rodando.</li>
            )}
            {(mov.reducaoDist > 0 || mov.reducaoTempo > 0) && (
              <li>🚶‍♂️ <strong>Movimentação:</strong> Redução de <strong>{mov.reducaoDist.toFixed(1)}%</strong> na distância e <strong>{mov.reducaoTempo.toFixed(1)}%</strong> no tempo gasto.</li>
            )}
            {lt.reducao > 0 && (
              <li>⏱️ <strong>Lead Time:</strong> Tempo de atravessamento reduzido em <strong>{lt.reducao.toFixed(1)}%</strong>.</li>
            )}
            {ar.reducaoPercent > 0 && (
              <li>🏭 <strong>Área Útil:</strong> Liberação de <strong>{ar.economiaM2.toFixed(1)}m²</strong> (Economia estimada de {formatBRL(ar.economiaMensal)}/mês).</li>
            )}
          </ul>

          {pb.paybackMeses > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-bold text-blue-900 mb-1">💰 Retorno do Investimento (Payback)</p>
              <p className="text-blue-800 text-sm">
                Com as ações aplicadas, a redução de custo na mão de obra por peça gerou uma economia mensal projetada de <strong>{formatBRL(pb.reducaoMensal)}</strong>. O investimento total do programa se paga em apenas <strong>{pb.paybackMeses.toFixed(1)} meses</strong>.
              </p>
            </div>
          )}

          <p className="mt-4">
            O resultado geral do projeto foi agregador e positivo para a empresa. O envolvimento da equipe foi primordial para o entendimento e aplicação dos conceitos Lean, deixando um legado robusto para a continuidade da melhoria contínua.
          </p>
        </div>
      </div>
    </div>
  );
}
