import { useState, useMemo } from "react";
import { 
  type ResumoData, type AppState,
  calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea 
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
  onUpdatePlanoAcao: (acoes: any[]) => void;
  onClearData: () => void;
}

export function ResumoModule({ data, state, onChange, onUpdatePlanoAcao, onClearData }: Props) {
  const [newAcao, setNewAcao] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const lockedIndicadores = ["produtividade", "payback"];
  const selectedIndicadores = Array.from(new Set([...(data.indicadoresConclusao || []), ...lockedIndicadores]));

  const prod = useMemo(() => calcProdutividade(state.produtividade), [state.produtividade]);
  const pb = useMemo(() => calcPayback(state.payback, state.produtividade, state.resumo), [state.payback, state.produtividade, state.resumo]);
  const mov = useMemo(() => calcMovimentacao(state.movimentacao), [state.movimentacao]);
  const qual = useMemo(() => calcQualidade(state.qualidade), [state.qualidade]);
  const disp = useMemo(() => calcDisponibilidade(state.disponibilidade), [state.disponibilidade]);
  const lt = useMemo(() => calcLeadTime(state.leadtime), [state.leadtime]);
  const ar = useMemo(() => calcArea(state.area), [state.area]);

  const descTexto = useMemo(() => {
    const colabTxt = data.totalColaboradores === 1 ? "colaborador" : "colaboradores";
    const turnoTxt = data.turnos === 1 ? "Turno" : "Turnos";
    return `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos} ${turnoTxt}. O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foram identificadas oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  }, [data]);

  const { textoDinamico, bulletPoints } = useMemo(() => {
    const acoesResumo = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");
    const listaAcoes = acoesResumo.length > 0 ? acoesResumo.map(a => a.what).join(", ") : "—";
    const u = state.produtividade.unidade || "peças";
    
    let resultadosTexto: string[] = [];
    let bullets: string[] = [];

    if (selectedIndicadores.includes("produtividade")) {
      resultadosTexto.push(`Produtividade: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(6).replace(".", ",")}% na eficiência operacional da célula.`);
      bullets.push(`Aumento de ${prod.ganho.toFixed(6).replace(".", ",")}% em produtividade.`);
    }
    if (selectedIndicadores.includes("payback")) {
      resultadosTexto.push(`Payback: Com as ações aplicadas e a redução do custo de mão de obra por ${u}, o projeto apresenta um retorno financeiro com Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
      bullets.push(`Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
    }
    if (selectedIndicadores.includes("movimentacao")) {
      const exibir = state.movimentacao.exibirNoLaudo || "ambos";
      const distTxt = mov.reducaoDist.toFixed(6).replace(".", ",");
      const tempoTxt = mov.reducaoTempo.toFixed(6).replace(".", ",");
      if (exibir === "ambos") {
        resultadosTexto.push(`Movimentação: A análise de fluxo evidenciou uma redução de ${distTxt}% na distância percorrida e uma queda de ${tempoTxt}% no tempo gasto com movimentação e transporte logístico.`);
        bullets.push(`Redução de ${distTxt}% na distância e ${tempoTxt}% no tempo de movimentação.`);
      } else if (exibir === "distancia") {
        resultadosTexto.push(`Movimentação: A análise de fluxo evidenciou uma redução de ${distTxt}% na distância percorrida com movimentação e transporte logístico.`);
        bullets.push(`Redução de ${distTxt}% na distância de movimentação.`);
      } else if (exibir === "tempo") {
        resultadosTexto.push(`Movimentação: A análise de fluxo evidenciou uma queda de ${tempoTxt}% no tempo gasto com movimentação e transporte logístico.`);
        bullets.push(`Redução de ${tempoTxt}% no tempo de movimentação.`);
      }
    }
    if (selectedIndicadores.includes("qualidade")) {
      resultadosTexto.push(`Qualidade: O índice de assertividade e peças conformes evoluiu de ${qual.indiceT1.toFixed(2).replace(".", ",")}% para ${qual.indiceT3.toFixed(2).replace(".", ",")}%, garantindo maior confiabilidade ao processo e minimizando perdas.`);
      bullets.push(`Índice de qualidade evoluiu para ${qual.indiceT3.toFixed(2).replace(".", ",")}%.`);
    }
    if (selectedIndicadores.includes("disponibilidade")) {
      resultadosTexto.push(`Disponibilidade: Com a redução das paradas não planejadas, o tempo efetivo de operação da máquina aumentou, representando um ganho de ${disp.aumento.toFixed(2).replace(".", ",")}% na utilização real do recurso.`);
      bullets.push(`Aumento de ${disp.aumento.toFixed(2).replace(".", ",")}% na disponibilidade da máquina.`);
    }
    if (selectedIndicadores.includes("leadtime")) {
      const ltU = state.leadtime.unidadeTempo || "dias";
      const t1 = state.leadtime.leadTimeT1 || state.leadtime.tempoT1 || 0;
      const t3 = state.leadtime.leadTimeT3 || state.leadtime.tempoT3 || 0;
      resultadosTexto.push(`Lead Time: O tempo de atravessamento total caiu de ${t1} para ${t3} ${ltU}, caracterizando uma redução de ${lt.reducao.toFixed(2).replace(".", ",")}% no prazo de entrega do processo.`);
      bullets.push(`Redução de ${lt.reducao.toFixed(2).replace(".", ",")}% no Lead Time.`);
    }
    if (selectedIndicadores.includes("area")) {
      resultadosTexto.push(`Área de Trabalho: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1).replace(".", ",")}%, liberando ${ar.economiaM2.toFixed(1).replace(".", ",")}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
      bullets.push(`Economia de ${ar.reducaoPercent.toFixed(1).replace(".", ",")}% (${ar.economiaM2.toFixed(1).replace(".", ",")}m²) de área útil.`);
    }

    const intro = `O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada por: ${data.motivacao || "—"}. As ferramentas aplicadas foram: ${data.ferramentas || "—"}.`;
    const desenvolvimento = `Foram elaborados planos de ação através da ferramenta 5W2H, definindo diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}.\n\nApós a definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:`;
    const fechamento = `O resultado geral do projeto foi agregador e positivo para a empresa, pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados. Com isso, a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de produção.`;

    const textoCompleto = [intro, desenvolvimento, ...resultadosTexto, fechamento].join("\n\n");
    return { textoDinamico: textoCompleto, bulletPoints: bullets };
  }, [data, prod, pb, mov, qual, disp, lt, ar, selectedIndicadores, state.produtividade.unidade, state.leadtime, state.movimentacao.exibirNoLaudo, state.planoAcao.acoes]);

  const toggleIndicador = (id: string) => {
    if (lockedIndicadores.includes(id)) return; 
    if (selectedIndicadores.includes(id)) {
      onChange({ indicadoresConclusao: selectedIndicadores.filter(i => i !== id) });
    } else {
      onChange({ indicadoresConclusao: [...selectedIndicadores, id] });
    }
  };

  const indicadoresList = [
    { id: "produtividade", label: "Produtividade" },
    { id: "payback", label: "Payback" },
    { id: "movimentacao", label: "Movimentação" },
    { id: "qualidade", label: "Qualidade" },
    { id: "disponibilidade", label: "Disponibilidade" },
    { id: "leadtime", label: "Lead Time" },
    { id: "area", label: "Área de Trabalho" },
  ];

  const acoesVisiveis = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");

  return (
    <>
      <div className="flex gap-8 h-full">
        <div className="w-[55%] flex flex-col gap-6 overflow-y-auto pr-4 pb-36">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Entrada de Dados</h3>
            <button onClick={() => setShowConfirmModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border border-rose-100 shadow-sm">
              <Trash2 className="w-3.5 h-3.5" /> Limpar Dados
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
            <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
            <InputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
            <InputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
            <InputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: Number(v) || 0 })} type="number" />
            <InputField label="Turno(s)" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} type="number" />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
            <InputField label="Processo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Método (Puxada/Empurrada)" value={data.metodo} onChange={v => onChange({ metodo: v as any })} />
              <InputField label="Demanda originada por" value={data.origem} onChange={v => onChange({ origem: v })} />
            </div>
            <InputField label="Oportunidades no setor de" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Problemas</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all" value={data.problemas || ""} onChange={e => onChange({ problemas: e.target.value })} />
              </div>
              <InputField label="Ferramentas Lean Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} />
            </div>
            <InputField label="Área de Atuação/Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            <InputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase">Resumo das Ações</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><InputField label="O que será feito?" value={newAcao} onChange={setNewAcao} /></div>
              <button onClick={handleAddAcao} className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#0047D6] transition-colors">Adicionar</button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {acoesVisiveis.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-700 truncate pr-4 flex-1">{a.what}</span>
                  <button onClick={() => handleRemoveAcao(a.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-rose-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pb-36">
          <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:border-[#0057FF]/20">
            <button onClick={() => { navigator.clipboard.writeText(descTexto); setCopiedId("desc"); toast.success("Copiado!"); setTimeout(() => setCopiedId(null), 2000); }} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#0057FF] hover:text-white transition-all shadow-sm">
              {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-4">Descrição do Processo</h4>
            <p className="text-[13px] text-slate-600 leading-relaxed text-justify">{descTexto}</p>
          </div>

          <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <button onClick={() => { navigator.clipboard.writeText(textoDinamico); setCopiedId("conc"); toast.success("Copiado!"); setTimeout(() => setCopiedId(null), 2000); }} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#0057FF] hover:text-white transition-all shadow-sm">
              {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Conclusão do Projeto</h4>
            <div className="text-[13px] text-slate-700 leading-relaxed text-justify space-y-6 flex-1">
              <div className="whitespace-pre-wrap">{textoDinamico}</div> 
              {bulletPoints.length > 0 && (
                <div className="bg-slate-50 p-5 space-y-3 rounded-xl shadow-sm mt-4">
                  {bulletPoints.map((point, index) => (
                    <p key={index} className="font-bold text-slate-800 text-sm tracking-tight">• {point}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-3">Indicadores</h4>
              <div className="flex flex-wrap gap-2">
                {indicadoresList.map((ind) => {
                  const isLocked = lockedIndicadores.includes(ind.id);
                  const isActive = selectedIndicadores.includes(ind.id);
                  return (
                    <button key={ind.id} onClick={() => toggleIndicador(ind.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isActive ? "bg-[#0057FF] text-white border-[#0057FF] shadow-md" : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"} ${isLocked ? "cursor-not-allowed opacity-90" : ""}`}>
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Limpar tudo?</h3>
            <p className="text-sm text-slate-600 mb-6">Apagar todos os dados de todas as abas?</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-sm rounded-xl transition-colors">Não</button>
              <button onClick={() => { setShowConfirmModal(false); onClearData(); }} className="flex-1 py-3 bg-rose-600 text-white hover:bg-rose-700 font-bold text-sm rounded-xl transition-colors">Sim, apagar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
