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

    return `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos} ${turnoTxt}. O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foi identificado oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  }, [data]);

  const { textoDinamico, bulletPoints } = useMemo(() => {
    // FILTRO AQUI: Apenas ações vindas do Resumo
    const acoesResumo = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");
    const listaAcoes = acoesResumo.length > 0 ? acoesResumo.map(a => a.what).join(", ") : "—";
    
    const u = state.produtividade.unidade || "peças";
    
    let resultadosTexto: string[] = [];
    let bullets: string[] = [];

    if (selectedIndicadores.includes("produtividade")) {
      resultadosTexto.push(`Produtividade: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(2)} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(2)} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(2)}% na eficiência operacional da célula.`);
      bullets.push(`Aumento de ${prod.ganho.toFixed(2)}% em produtividade.`);
    }
    if (selectedIndicadores.includes("payback")) {
      resultadosTexto.push(`Payback: Com as ações aplicadas e a redução do custo de mão de obra por ${u}, o projeto apresenta um retorno financeiro com Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
      bullets.push(`Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2) : "0.00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
    }
    if (selectedIndicadores.includes("movimentacao")) {
      resultadosTexto.push(`Movimentação: A análise de fluxo evidenciou uma redução de ${mov.reducaoDist.toFixed(2)}% na distância percorrida e uma queda de ${mov.reducaoTempo.toFixed(2)}% no tempo gasto com movimentação e transporte logístico.`);
      bullets.push(`Redução de ${mov.reducaoTempo.toFixed(2)}% no tempo de movimentação.`);
    }
    if (selectedIndicadores.includes("qualidade")) {
      resultadosTexto.push(`Qualidade: O índice de assertividade e peças conformes evoluiu de ${qual.indiceT1.toFixed(2)}% para ${qual.indiceT3.toFixed(2)}%, garantindo maior confiabilidade ao processo e minimizando perdas.`);
      bullets.push(`Índice de qualidade evoluiu para ${qual.indiceT3.toFixed(2)}%.`);
    }
    if (selectedIndicadores.includes("disponibilidade")) {
      resultadosTexto.push(`Disponibilidade: Com a redução das paradas não planejadas, o tempo efetivo de operação da máquina aumentou, representando um ganho de ${disp.aumento.toFixed(2)}% na utilização real do recurso.`);
      bullets.push(`Aumento de ${disp.aumento.toFixed(2)}% na disponibilidade da máquina.`);
    }
    if (selectedIndicadores.includes("leadtime")) {
      const ltU = state.leadtime.unidadeTempo || "dias";
      const t1 = state.leadtime.leadTimeT1 || state.leadtime.tempoT1 || 0;
      const t3 = state.leadtime.leadTimeT3 || state.leadtime.tempoT3 || 0;
      resultadosTexto.push(`Lead Time: O tempo de atravessamento total caiu de ${t1} para ${t3} ${ltU}, caracterizando uma redução de ${lt.reducao.toFixed(2)}% no prazo de entrega do processo.`);
      bullets.push(`Redução de ${lt.reducao.toFixed(2)}% no Lead Time.`);
    }
    if (selectedIndicadores.includes("area")) {
      resultadosTexto.push(`Área de Trabalho: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1)}%, liberando ${ar.economiaM2.toFixed(1)}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
      bullets.push(`Economia de ${ar.reducaoPercent.toFixed(1)}% (${ar.economiaM2.toFixed(1)}m²) de área útil.`);
    }

    const intro = `O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada por: ${data.motivacao || "—"}. As ferramentas aplicadas foram: ${data.ferramentas || "—"}.`;
    
    const desenvolvimento = `Foram elaborados planos de ação através da ferramenta 5W2H, definindo diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}.\n\nApós a definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:`;

    const fechamento = `O resultado geral do projeto foi agregador e positivo para a empresa, pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados. Com isso, a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de produção.`;

    const textoCompleto = [intro, desenvolvimento, ...resultadosTexto, fechamento].join("\n\n");

    return { textoDinamico: textoCompleto, bulletPoints: bullets };
  }, [data, prod, pb, mov, qual, disp, lt, ar, selectedIndicadores, state.produtividade.unidade, state.leadtime, state.planoAcao.acoes]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto formatado copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAcao = () => {
    if (newAcao.trim()) {
      const nova = { 
        id: Date.now().toString(), 
        what: newAcao.trim(), 
        why: "", where: "", start: "", end: "", who: "", how: "", howMuch: "", percent: 0, obs: "", status: "NÃO INICIADO",
        origin: "resumo" as const // Etiqueta garantindo que veio do resumo
      };
      onUpdatePlanoAcao([...state.planoAcao.acoes, nova]);
      setNewAcao("");
    }
  };

  const handleRemoveAcao = (id: string) => {
    onUpdatePlanoAcao(state.planoAcao.acoes.filter(a => a.id !== id));
  };

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

  // Apenas as ações criadas aqui aparecem na lista visual do resumo
  const acoesVisiveis = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");

  return (
    <>
      <div className="flex gap-8 h-full">
        <div className="w-[55%] flex flex-col gap-6 overflow-y-auto pr-4 pb-36">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Entrada de Dados</h3>
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border border-rose-100 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Dados Atuais
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

          <div className="grid grid-cols-1 gap-4 pt-4 border-t">
            <InputField label="Processo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Método (Puxada/Empurrada)" value={data.metodo} onChange={v => onChange({ metodo: v as any })} />
              <InputField label="Demanda originada por" value={data.origem} onChange={v => onChange({ origem: v })} />
            </div>
            
            <InputField label="Oportunidades no setor de" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                  Problemas de <span className="lowercase font-normal italic text-slate-400">(Adicione a ferramenta utilizada)</span>
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={data.problemas || ""}
                  onChange={e => onChange({ problemas: e.target.value })}
                />
              </div>
              <InputField label="Ferramentas Lean Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} />
            </div>

            <InputField label="Área de Atuação/Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            <InputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} />
          </div>

          <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase">Resumo das Ações</h4>
            <p className="text-xs text-slate-500 mb-2">Adicione aqui o resumo das macro ações. O detalhamento completo ocorre na aba 5W2H.</p>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><InputField label="O que será feito? (What)" value={newAcao} onChange={setNewAcao} /></div>
              <button 
                onClick={handleAddAcao} 
                className="h-10 px-6 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase shadow-md hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {acoesVisiveis.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-slate-700 truncate pr-4 flex-1">{a.what}</span>
                  <button onClick={() => handleRemoveAcao(a.id)} className="p-1.5 hover:bg-rose-100 rounded-md transition-colors text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pb-36">
          <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-200">
            <button onClick={() => handleCopy(descTexto, "desc")} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Descrição do Processo</h4>
            <p className="text-[13px] text-slate-600 leading-relaxed text-justify">{descTexto}</p>
          </div>

          <div className="relative bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col">
            <button onClick={() => handleCopy(textoDinamico, "conc")} className="absolute top-4 right-4 p-2 rounded-lg bg-white text-slate-400 hover:text-blue-600 transition-all shadow-sm border border-slate-100">
              {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-4 border-b border-blue-200/50 pb-2">Conclusão do Projeto</h4>
            
            <div className="text-[13px] text-slate-700 leading-relaxed text-justify space-y-6 flex-1">
              <div className="whitespace-pre-wrap">{textoDinamico}</div> 
              
              {bulletPoints.length > 0 && (
                <div className="bg-white border-l-4 border-blue-500 p-5 space-y-3 rounded-r-xl shadow-sm mt-4">
                  {bulletPoints.map((point, index) => (
                    <p key={index} className="font-bold text-slate-800 text-sm tracking-tight">• {point}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-blue-200/50">
              <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3">Indicadores na Conclusão</h4>
              <div className="flex flex-wrap gap-2">
                {indicadoresList.map((ind) => {
                  const isLocked = lockedIndicadores.includes(ind.id);
                  const isActive = selectedIndicadores.includes(ind.id);
                  
                  return (
                    <button
                      key={ind.id}
                      onClick={() => toggleIndicador(ind.id)}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                        isActive 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                          : "bg-white text-slate-500 border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                      } ${isLocked ? "cursor-not-allowed opacity-90" : ""}`}
                    >
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-rose-200">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Limpar tudo?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Isso vai apagar os dados de <strong>todas as abas</strong> permanentemente. Tem certeza?
              </p>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-xl transition-colors border border-blue-100"
                >
                  Não
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    onClearData();
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 font-bold text-sm rounded-xl transition-colors"
                >
                  Sim, apagar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
