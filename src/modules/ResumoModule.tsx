"use client"

import { useState, useMemo } from "react";
import { 
  type ResumoData, type AppState,
  calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea 
} from "@/store/useAppStore";
import { Trash2, Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
  onUpdatePlanoAcao: (acoes: any[]) => void;
  onClearData: () => void;
}

// Campo de digitação customizado e integrado ao tema escuro do GBO
function LocalInputField({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  const displayValue = (value === 0 || value === null || value === undefined) ? "" : value;
  
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </label>
      <input
        type={type}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all"
      />
    </div>
  );
}

export function ResumoModule({ data, state, onChange, onUpdatePlanoAcao, onClearData }: Props) {
  const [newAcao, setNewAcao] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const lockedIndicadores = ["produtividade", "payback"];
  const selectedIndicadores = Array.from(new Set([...(data.indicatorsConclusao || data.indicadoresConclusao || []), ...lockedIndicadores]));

  const prod = useMemo(() => calcProdutividade(state.produtividade), [state.produtividade]);
  const pb = useMemo(() => calcPayback(state.payback, state.produtividade, state.resumo), [state.payback, state.produtividade, state.resumo]);
  const mov = useMemo(() => calcMovimentacao(state.movimentacao), [state.movimentacao]);
  const qual = useMemo(() => calcQualidade(state.qualidade), [state.qualidade]);
  const disp = useMemo(() => calcDisponibilidade(state.disponibilidade), [state.disponibilidade]);
  const lt = useMemo(() => calcLeadTime(state.leadtime), [state.leadtime]);
  const ar = useMemo(() => calcArea(state.area), [state.area]);

  const handleExportProject = () => {
    const projectData = {
      resumo: state.resumo,
      produtividade: state.produtividade,
      payback: state.payback,
      movimentacao: state.movimentacao,
      qualidade: state.qualidade,
      disponibilidade: state.disponibilidade,
      leadtime: state.leadtime,
      area: state.area
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const fileName = data.nomeEmpresa 
      ? `Projeto_${data.nomeEmpresa.replace(/\s+/g, '_')}.lean` 
      : 'Projeto_Consultoria.lean';
      
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Projeto exportado com sucesso!");
  };

  const handleAddAcao = () => {
    if (!newAcao.trim()) return;
    const novaAcao = { id: Date.now().toString(), what: newAcao, origin: "custom" };
    onUpdatePlanoAcao([...state.planoAcao.acoes, novaAcao]);
    setNewAcao("");
  };

  const handleRemoveAcao = (id: string) => {
    onUpdatePlanoAcao(state.planoAcao.acoes.filter(a => a.id !== id));
  };

  const descTexto = useMemo(() => {
    const colabTxt = (data.totalColaboradores || 0) === 1 ? "colaborador" : "colaboradores";
    const turnoTxt = (data.turnos || 0) === 1 ? "Turno" : "Turnos";
    return `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos || 0} ${turnoTxt}. O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foram identificadas oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  }, [data]);

  const descTextoWord = useMemo(() => {
    const colabTxt = (data.totalColaboradores || 0) === 1 ? "colaborador" : "colaboradores";
    const turnoTxt = (data.turnos || 0) === 1 ? "Turno" : "Turnos";
    return `1. DESCRIÇÃO DO PROCESSO OPERACIONAL\n\nA Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos || 0} ${turnoTxt}.\n\nO produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}.\n\nAo longo do mapeamento foram identificadas oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}.\n\nNesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  }, [data]);

  const laudosSistemas = useMemo(() => {
    const acoesResumo = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");
    const listaAcoes = acoesResumo.length > 0 ? acoesResumo.map(a => a.what).join(", ") : "—";
    const u = state.produtividade.unidade || "peças";
    
    let resTela: string[] = [];
    let resWord: string[] = [];
    let bullets: string[] = [];

    if (selectedIndicadores.includes("produtividade")) {
      const txt = `Produtividade: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(6).replace(".", ",")}% na eficiência operacional da célula.`;
      resTela.push(txt);
      resWord.push(`• PRODUTIVIDADE: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(6).replace(".", ",")}% na eficiência operacional da célula.`);
      bullets.push(`Aumento de ${prod.ganho.toFixed(6).replace(".", ",")}% em produtividade.`);
    }
    if (selectedIndicadores.includes("payback")) {
      const txt = `Payback: Com as ações aplicadas e a redução do custo de mão de obra por ${u}, o projeto apresenta um retorno financeiro com Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`;
      resTela.push(txt);
      resWord.push(`• PAYBACK: Com as ações aplicadas e a redução do custo de mão de obra por ${u}, o projeto apresenta um retorno financeiro com Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
      bullets.push(`Payback de ${pb.paybackMeses > 0 ? pb.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} ${pb.paybackMeses === 1 ? "mês" : "meses"}.`);
    }
    if (selectedIndicadores.includes("movimentacao")) {
      const mData = state.movimentacao;
      const fer = (mData.ferramentaUtilizada || "").trim();
      const acao = (mData.acaoMelhoria || "").trim();
      
      const isPlural = /,| e |\//i.test(fer);
      const prep = fer ? (isPlural ? `das ferramentas ${fer}` : `da ferramenta ${fer}`) : "da ferramenta aplicada";
      const baseText = `Movimentação: Por intermédio ${prep} foi realizado ${acao ? acao : "a melhoria do fluxo logístico"}.`;
      
      const exibir = state.movimentacao.exibirNoLaudo || "ambos";
      const distTxt = mov.reducaoDist.toFixed(6).replace(".", ",");
      const tempoTxt = mov.reducaoTempo.toFixed(6).replace(".", ",");

      if (exibir === "ambos") {
        const txt = `${baseText} A análise de fluxo evidenciou uma redução de ${distTxt}% na distância percorrida e uma queda de ${tempoTxt}% no tempo gasto com movimentação e transporte logístico.`;
        resTela.push(txt);
        resWord.push(`• MOVIMENTAÇÃO LOGÍSTICA: ${txt.replace("Movimentação: ", "")}`);
        bullets.push(`Redução de ${distTxt}% na distância e ${tempoTxt}% no tempo de movimentação.`);
      } else if (exibir === "distancia") {
        const txt = `${baseText} A análise de fluxo evidenciou uma redução de ${distTxt}% na distância percorrida com movimentação e transporte logístico.`;
        resTela.push(txt);
        resWord.push(`• MOVIMENTAÇÃO LOGÍSTICA: ${txt.replace("Movimentação: ", "")}`);
        bullets.push(`Redução de ${distTxt}% na distância de movimentação.`);
      } else if (exibir === "tempo") {
        const txt = `${baseText} A análise de fluxo evidenciou uma queda de ${tempoTxt}% no tempo gasto com movimentação e transporte logístico.`;
        resTela.push(txt);
        resWord.push(`• MOVIMENTAÇÃO LOGÍSTICA: ${txt.replace("Movimentação: ", "")}`);
        bullets.push(`Redução de ${tempoTxt}% no tempo de movimentação.`);
      }
    }
    if (selectedIndicadores.includes("qualidade")) {
      const txt = `Qualidade: O índice de assertividade e peças conformes evoluiu de ${qual.indiceT1.toFixed(2).replace(".", ",")}% para ${qual.indiceT3.toFixed(2).replace(".", ",")}%, garantindo maior confiabilidade ao processo e minimizando perdas.`;
      resTela.push(txt);
      resWord.push(`• QUALIDADE: O índice de assertividade e peças conformes evoluiu de ${qual.indiceT1.toFixed(2).replace(".", ",")}% para ${qual.indiceT3.toFixed(2).replace(".", ",")}%, garantindo maior confiabilidade ao processo e minimizando perdas.`);
      bullets.push(`Índice de qualidade evoluiu para ${qual.indiceT3.toFixed(2).replace(".", ",")}%.`);
    }
    if (selectedIndicadores.includes("disponibilidade")) {
      const txt = `Disponibilidade: Com a redução das paradas não planejadas, o tempo efetivo de operação da máquina aumentou, representando um ganho de ${disp.aumento.toFixed(2).replace(".", ",")}% na utilização real do recurso.`;
      resTela.push(txt);
      resWord.push(`• DISPONIBILIDADE: Com a redução das paradas não planejadas, o tempo efetivo de operação da máquina aumentou, representando um ganho de ${disp.aumento.toFixed(2).replace(".", ",")}% na utilização real do recurso.`);
      bullets.push(`Aumento de ${disp.aumento.toFixed(2).replace(".", ",")}% na disponibilidade da máquina.`);
    }
    if (selectedIndicadores.includes("leadtime")) {
      const ltU = state.leadtime.unidadeTempo || "dias";
      const t1 = state.leadtime.leadTimeT1 || state.leadtime.tempoT1 || 0;
      const t3 = state.leadtime.leadTimeT3 || state.leadtime.tempoT3 || 0;
      const txt = `Lead Time: O tempo de atravessamento total caiu de ${t1} para ${t3} ${ltU}, caracterizando uma redução de ${lt.reducao.toFixed(2).replace(".", ",")}% no prazo de entrega do processo.`;
      resTela.push(txt);
      resWord.push(`• LEAD TIME: O tempo de atravessamento total caiu de ${t1} para ${t3} ${ltU}, caracterizando uma redução de ${lt.reducao.toFixed(2).replace(".", ",")}% no prazo de entrega do processo.`);
      bullets.push(`Redução de ${lt.reducao.toFixed(2).replace(".", ",")}% no Lead Time.`);
    }
    if (selectedIndicadores.includes("area")) {
      const txt = `Área de Trabalho: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1).replace(".", ",")}%, liberando ${ar.economiaM2.toFixed(1).replace(".", ",")}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMoral?.toLocaleString("pt-BR") || ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      resTela.push(txt);
      resWord.push(`• ÁREA DE TRABALHO: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1).replace(".", ",")}%, liberando ${ar.economiaM2.toFixed(1).replace(".", ",")}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMoral?.toLocaleString("pt-BR") || ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
      bullets.push(`Economia de ${ar.reducaoPercent.toFixed(1).replace(".", ",")}% (${ar.economiaM2.toFixed(1).replace(".", ",")}m²) de área útil.`);
    }

    const introTela = `O presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada por: ${data.motivacao || "—"}. As ferramentas aplicadas foram: ${data.ferramentas || "—"}.`;
    const desTela = `Foram elaborados planos de ação através da ferramenta 5W2H, definindo diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}.\n\nApós a definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se:`;
    const fimTela = `O resultado geral do projeto foi agregador e positivo para a empresa, pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados. Com isso, a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de produção.`;

    const introWord = `2. INTRODUÇÃO DO PROJETO\n\nO presente programa de fomento ao setor industrial brasileiro Brasil Mais Produtivo, proporcionou a realização de consultoria em Manufatura Enxuta na Empresa ${data.nomeEmpresa || "—"}, na cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul. A escolha do produto a ser mapeado foi motivada por: ${data.motivacao || "—"}. As ferramentas aplicadas foram: ${data.ferramentas || "—"}.`;
    
    const desWord = `3. PLANO DE AÇÃO E ANÁLISE DE RESULTADOS\n\nForam elaborados planos de ação através da ferramenta 5W2H, definindo diversas ações para as oportunidades elencadas, tais como: ${listaAcoes}.\n\nApós a definição do ponto de intervenção, monitoramento e validação das melhorias, obteve-se os seguintes resultados consolidados:`;
    
    const fimWord = `4. CONCLUSÃO DA INTERVENÇÃO\n\nO resultado geral do projeto foi agregador e positivo para a empresa, pois o envolvimento da equipe foi primordial para garantir o conhecimento necessário através do plano de ação, treinamentos, trabalho realizado e resultados alcançados. Com isso, a empresa pode manter o aculturamento do pensamento Lean e replicar os conceitos da melhoria contínua para os demais setores e linhas de produção.`;

    return {
      textoTela: [introTela, desTela, ...resTela, fimTela].join("\n\n"),
      textoWord: [introWord, desWord, resWord.join("\n\n"), fimWord].join("\n\n"),
      bulletPoints: bullets
    };
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
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* COLUNA ESQUERDA: ENTRADA DE DADOS */}
        <div className="w-full lg:w-[55%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-lg uppercase tracking-tight">Entrada de Dados</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportProject} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0057FF]/10 text-[#0057FF] hover:bg-[#0057FF]/20 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border border-[#0057FF]/20 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Dados
              </button>
              <button 
                onClick={() => setShowConfirmModal(true)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors border border-rose-100 dark:border-rose-900/40 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Dados
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocalInputField label="Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} />
            <LocalInputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} />
            <LocalInputField label="Ramo de Atuação" value={data.ramo} onChange={v => onChange({ ramo: v })} />
            <LocalInputField label="Especialista em" value={data.especialista} onChange={v => onChange({ especialista: v })} />
            <LocalInputField label="Total de Colaboradores" value={data.totalColaboradores} onChange={v => onChange({ totalColaboradores: v === "" ? 0 : Number(v) })} type="number" />
            <LocalInputField label="Turno(s)" value={data.turnos} onChange={v => onChange({ turnos: v === "" ? 0 : Number(v) })} type="number" />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <LocalInputField label="Processo Produtivo Mapeado" value={data.processos} onChange={v => onChange({ processos: v })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalInputField label="Método (Puxada/Empurrada)" value={data.metodo} onChange={v => onChange({ metodo: v })} />
              <LocalInputField label="Demanda originada por" value={data.origem} onChange={v => onChange({ origem: v })} />
            </div>
            <LocalInputField label="Oportunidades no setor de" value={data.oportunidades} onChange={v => onChange({ oportunidades: v })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalInputField label="Problemas" value={data.problemas || ""} onChange={v => onChange({ problemas: v })} />
              <LocalInputField label="Ferramentas Lean Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} />
            </div>
            <LocalInputField label="Área de Atuação/Intervenção" value={data.atuacao} onChange={v => onChange({ atuacao: v })} />
            <LocalInputField label="Motivação da Escolha" value={data.motivacao} onChange={v => onChange({ motivacao: v })} />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-[#0F172A] dark:text-slate-100 uppercase">Resumo das Ações</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><LocalInputField label="O que será feito?" value={newAcao} onChange={setNewAcao} /></div>
              <button onClick={handleAddAcao} className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#0047D6] transition-colors">Adicionar</button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {acoesVisiveis.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-4 flex-1">{a.what}</span>
                  <button onClick={() => handleRemoveAcao(a.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-rose-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CARDS DE VISUALIZAÇÃO DE TEXTO */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6 overflow-y-auto pb-36">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 transition-all hover:border-[#0057FF]/20">
            <button 
              onClick={() => { navigator.clipboard.writeText(descTextoWord); setCopiedId("desc"); toast.success("Copiado com formatação estruturada!"); setTimeout(() => setCopiedId(null), 2000); }} 
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-[#0057FF] dark:hover:bg-[#0057FF] hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-800/40"
            >
              {copiedId === "desc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Descrição do Processo</h4>
            <p className="text-[13px] text-slate-600 dark:text-slate-100 leading-relaxed text-justify whitespace-pre-wrap">{descTexto}</p>
          </div>

          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 flex flex-col">
            <button 
              onClick={() => { navigator.clipboard.writeText(laudosSistemas.textoWord); setCopiedId("conc"); toast.success("Copiado com formatação estruturada!"); setTimeout(() => setCopiedId(null), 2000); }} 
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:bg-[#0057FF] dark:hover:bg-[#0057FF] hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-800/40"
            >
              {copiedId === "conc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Conclusão do Projeto</h4>
            <div className="text-[13px] text-slate-700 dark:text-slate-100 leading-relaxed text-justify space-y-6 flex-1">
              <div className="whitespace-pre-wrap">{laudosSistemas.textoTela}</div> 
              {laudosSistemas.bulletPoints.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950 p-5 space-y-3 rounded-xl shadow-sm mt-4 border border-slate-100 dark:border-slate-800">
                  {laudosSistemas.bulletPoints.map((point, index) => (
                    <p key={index} className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">• {point}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-[#0057FF] uppercase tracking-widest mb-3">Indicadores</h4>
              <div className="flex flex-wrap gap-2">
                {indicadoresList.map((ind) => {
                  const isActive = selectedIndicadores.includes(ind.id);
                  return (
                    <button 
                      key={ind.id} 
                      onClick={() => toggleIndicador(ind.id)} 
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isActive ? "bg-[#0057FF] text-white border-[#0057FF] shadow-md" : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
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

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-white dark:bg-slate-900 rounded-2xl border-none shadow-2xl p-8 max-w-sm mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-rose-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Limpar tudo?</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
                Esta ação não pode ser desfeita. Deseja realmente apagar todos os dados de todas as abas do sistema?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 w-full mt-8">
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold text-slate-500 dark:text-slate-400" onClick={() => setShowConfirmModal(false)}>
                Não
              </Button>
              <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-rose-100 dark:shadow-none" onClick={() => { setShowConfirmModal(false); onClearData(); toast.success("Todos os dados foram limpos."); }}>
                Sim, apagar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
