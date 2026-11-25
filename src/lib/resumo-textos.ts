// Textos do Resumo (Descrição do Processo e Conclusão do Projeto).
// Usados na tela do Resumo e no Relatório de Atendimento, para os dois mostrarem o mesmo texto.
import {
  type AppState, type ResumoData,
  calcProdutividade, calcPayback, calcMovimentacao, calcQualidade, calcDisponibilidade, calcLeadTime, calcArea,
} from "@/store/useAppStore";

export const lockedIndicadores = ["produtividade", "payback"];

export function selectedIndicadoresOf(data: ResumoData): string[] {
  return Array.from(new Set([...((data as any).indicatorsConclusao || data.indicadoresConclusao || []), ...lockedIndicadores]));
}

/** Descrição do Processo: texto da tela e versão para o Word (com título). */
export function buildDescricao(data: ResumoData) {
  const colabTxt = (data.totalColaboradores || 0) === 1 ? "colaborador" : "colaboradores";
  const turnoTxt = (data.turnos || 0) === 1 ? "Turno" : "Turnos";
  const tela = `A Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos || 0} ${turnoTxt}. O produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}. Ao longo do mapeamento foram identificadas oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}. Nesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  const word = `1. DESCRIÇÃO DO PROCESSO OPERACIONAL\n\nA Empresa ${data.nomeEmpresa || "—"}, da cidade de ${data.cidade || "—"} no Estado do Rio Grande do Sul, atua no ramo de ${data.ramo || "—"}, especialista em ${data.especialista || "—"}, conta com ${data.totalColaboradores || "0"} ${colabTxt} atuando em ${data.turnos || 0} ${turnoTxt}.\n\nO produto mapeado segue o seguinte processo produtivo: ${data.processos || "—"}, com método de produção ${data.metodo || "—"}, onde a demanda é originada por ${data.origem || "—"}.\n\nAo longo do mapeamento foram identificadas oportunidades no setor de ${data.oportunidades || "—"}, por problemas de ${data.problemas || "—"}.\n\nNesta consultoria, a área de atuação/intervenção foi ${data.atuacao || "—"}.`;
  return { tela, word };
}

/** Conclusão do Projeto: texto da tela, versão para o Word e destaques. */
export function buildConclusao(state: AppState) {
  const data = state.resumo;
  const selectedIndicadores = selectedIndicadoresOf(data);
  const prod = calcProdutividade(state.produtividade);
  const pb = calcPayback(state.payback, state.produtividade, state.resumo);
  const mov = calcMovimentacao(state.movimentacao);
  const qual = calcQualidade(state.qualidade);
  const disp = calcDisponibilidade(state.disponibilidade);
  const lt = calcLeadTime(state.leadtime);
  const ar = calcArea(state.area);

  const acoesResumo = state.planoAcao.acoes.filter(a => a.origin !== "5w2h");
  const listaAcoes = acoesResumo.length > 0 ? acoesResumo.map(a => a.what).join(", ") : "—";
  const u = state.produtividade.unidade || "peças";

  let resTela: string[] = [];
  let resWord: string[] = [];
  let bullets: string[] = [];

  if (selectedIndicadores.includes("produtividade")) {
    const txt = `Produtividade: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(6).replace(".", ",")}% na produtividade operacional da célula.`;
    resTela.push(txt);
    resWord.push(`• PRODUTIVIDADE: No estágio inicial, a produtividade era de ${prod.pphT1.toFixed(6).replace(".", ",")} ${u}/h/op. Após as melhorias, a produtividade subiu para ${prod.pphT3.toFixed(6).replace(".", ",")} ${u}/h/op, representando um ganho direto de ${prod.ganho.toFixed(6).replace(".", ",")}% na produtividade operacional da célula.`);
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
    const txt = `Área de Trabalho: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1).replace(".", ",")}%, liberando ${ar.economiaM2.toFixed(1).replace(".", ",")}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMensal?.toLocaleString("pt-BR") || ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    resTela.push(txt);
    resWord.push(`• ÁREA DE TRABALHO: A otimização do layout produtivo reduziu a área ocupada em ${ar.reducaoPercent.toFixed(1).replace(".", ",")}%, liberando ${ar.economiaM2.toFixed(1).replace(".", ",")}m² de área útil, equivalente a uma economia imobiliária mensal de R$ ${ar.economiaMensal?.toLocaleString("pt-BR") || ar.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
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
}
