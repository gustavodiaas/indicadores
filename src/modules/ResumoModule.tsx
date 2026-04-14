import { useState, useMemo } from "react";
import { 
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback 
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prod = useMemo(() => calcProdutividade(state.produtividade), [state.produtividade]);
  const pb = useMemo(() => calcPayback(state.payback, state.produtividade, state.resumo), [state.payback, state.produtividade, state.resumo]);

  // --- PADRÃO INTEGRAL: DESCRIÇÃO DO PROCESSO (INTELIGENTE) ---
  const descTexto = useMemo(() => {
    const colabTxt = data.totalColaboradores === 1 ? "colaborador" : "colaboradores";
    const turnoTxt = data.turnos === 1 ? "Turno" : "Turnos";

    return `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos} ${turnoTxt}. O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  }, [data]);

  // --- PADRÃO INTEGRAL: CONCLUSÃO DO PROJETO (INTELIGENTE) ---
  const conclusaoTexto = useMemo(() => {
    const listaAcoes = data.acoes.length > 0 ? data.acoes.map(a => a.what).join(", ") : "—";
    const pbMesTxt = pb.paybackMeses === 1 ? "mês" : "meses";

    return `O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada ${data.motivacao || "—"}. As ferramentas aplicadas foram ${data.ferramentas || "—"}. Foram elaborados um conjunto de ações através da ferramenta 5W2H, onde definiu-se diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}. Após definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se: Aumento de ${prod.ganho.toFixed(2)}% em produtividade. Payback: Com as ações aplicadas obtém-se um Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} ${pbMesTxt}. O resultado geral do projeto foi agregador e positivo para a empresa pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados, com isso a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e lines de trabalho da produção.`;
  }, [data, prod, pb]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto integral copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[55%] flex flex-col gap-6 overflow-y-auto pr-4 pb-12">
        <h3 className="font-bold text-slate-800 border-b pb-2 text-lg uppercase tracking-tight">Entrada de Dados</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
          <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
          <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
          <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
          <InputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
          <InputField label="Turno(s)" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} type="number" />
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 border-t">
          <InputField label="Processo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Método (Puxada/Empurrada)" value={data.metodo} onChange={v => onChange({ metodo: v as any })} />
            <InputField label="Demanda originada por" value={data.origem} onChange={v => onChange({ origem: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Oportunidades no setor de" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <InputField label="Problemas de" value={data.problemas} onChange={v => onChange({ problemas: v })} />
          </div>
          <InputField label="Área de Atuação/Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
          <InputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} />
          <InputField label="Ferramentas Lean Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} />
        </div>

        <div className="pt-4 border-t space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase">Ações do Plano 5W2H</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><InputField label="Descreva a ação" value={newAcao.what || ""} onChange={v => setNewAcao({ what: v })} /></div>
            <button onClick={() => { if(newAcao.what) { onChange({ acoes: [...data.acoes, { id: Date.now().toString(), what: newAcao.what, why: "", where: "", when: "", who: "", how: "", howMuch: "" }] }); setNewAcao({}); } }} className="h-10 px-4 bg-blue-600 text-white rounded-md font-bold text-xs uppercase shadow-md">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.acoes.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-slate-100 border px-3 py-1 rounded-full text-[10px] font-bold text-slate-600">
                {a.what} <button onClick={() => onChange({ acoes: data.acoes.filter(x => x.id !== a.id) })}><Trash2 className="h-3 w-3 text-rose-500" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pb-12">
        <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-200">
          <button onClick={() => handleCopy(descTexto, "desc")} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Descrição do Processo</h4>
          <p className="text-[13px] text-slate-600 leading-relaxed text-justify">{descTexto}</p>
        </div>

        <div className="relative bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
          <button onClick={() => handleCopy(conclusaoTexto, "conc")} className="absolute top-4 right-4 p-2 rounded-lg bg-white text-slate-400 hover:text-blue-600 transition-all shadow-sm border border-slate-100">
            {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-4 border-b border-blue-200/50 pb-2">Conclusão do Projeto</h4>
          <div className="text-[13px] text-slate-700 leading-relaxed text-justify space-y-6">
            <p>{conclusaoTexto}</p> 
            <div className="bg-white border-l-4 border-blue-500 p-5 space-y-3 rounded-r-xl shadow-sm">
              <p className="font-bold text-slate-800 text-sm tracking-tight">• Aumento de {prod.ganho.toFixed(2)}% em produtividade.</p>
              <p className="font-bold text-slate-800 text-sm tracking-tight">• Payback de {pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} {pb.paybackMeses === 1 ? "mês" : "meses"}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
