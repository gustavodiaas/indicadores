import { type PaybackData, type ProdutividadeData, type ResumoData, calcPayback } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { ChevronDown } from "lucide-react";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: PaybackData;
  prodData: ProdutividadeData;
  resumoData: ResumoData;
  onChange: (d: Partial<PaybackData>) => void;
}

const VALORES_CONSULTORIA = {
  micro: 15834.40,
  pequena: 21772.30,
  media: 22800.00,
};

export function PaybackModule({ data, prodData, resumoData, onChange }: Props) {
  const r = calcPayback(data, prodData, resumoData);

  const chartData = [{ name: "Custo Unitário (R$)", T1: Number(r.custoI.toFixed(2)), T3: Number(r.custoF.toFixed(2)) }];
  const formatBRL = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatDec = (v: number | undefined) => v !== undefined && !isNaN(v) ? v.toFixed(2).replace(".", ",") : "";

  const op1 = prodData.operadoresT1 || 0;
  const op3 = prodData.operadoresT3 || 0;
  const u = prodData.unidade || "peças";

  const colabTxt1 = op1 === 1 ? "colaborador" : "colaboradores";
  const colabTxt3 = op3 === 1 ? "colaborador" : "colaboradores";
  
  const laudo = `No estágio inicial, havia ${op1} ${colabTxt1}, com custo total por mês de ${formatBRL(r.salI)}, ${data.dedicacaoInicial || 100}% utilizados na operação. Produziam-se ${r.prodMensalI.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoI)}. Após intervenção, permaneceram ${op3} ${colabTxt3}, com custo total por mês de ${formatBRL(r.salF)}, ${data.dedicacaoFinal || 100}% utilizado no processo. Passaram a produzir ${r.prodMensalF.toLocaleString("pt-BR")} ${u}/mês, a custo de mão de obra de ${formatBRL(r.custoF)}. Reduziu-se então ${formatBRL(Math.max(0, r.custoI - r.custoF))} no custo de mão de obra por ${u}, que gerou o retorno mensal de ${formatBRL(r.reducaoMensal)}. Portanto, um payback de ${r.paybackMeses > 0 ? r.paybackMeses.toFixed(2) : "0,00"} ${r.paybackMeses === 1 ? "mês" : "meses"}.`;

  const parseDecimal = (val: string) => {
    const cleaned = val.replace(/[^\d,.-]/g, '');
    return Number(cleaned.replace(",", "."));
  };

  const isUnitario = data.modoInsercaoSalario === "unitario";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      {/* COLUNA ESQUERDA: ENTRADA DE DADOS */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-36">

        {/* Configuração */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Configuração</span>
            <span className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">Modelo de Cálculo</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-[#0057FF] border border-transparent dark:border-slate-800/40">
                {data.tipoSalario === "encargos" ? "Salário + Encargos" : "Salário Bruto"}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-xl z-[150]">
              <DropdownMenuItem onClick={() => onChange({ tipoSalario: "bruto" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.tipoSalario === "bruto" || !data.tipoSalario ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Salário Bruto</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChange({ tipoSalario: "encargos" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.tipoSalario === "encargos" ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Salário + Encargos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* T1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-slate-800 pb-2">Estado Inicial (T1)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">
                  {isUnitario ? "Salário Base (Por Operador R$)" : "Salário Base (Total R$)"}
                </label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" 
                  defaultValue={formatDec(data.salarioBaseInicial)} 
                  onBlur={e => onChange({ salarioBaseInicial: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Colaboradores</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed" value={op1} disabled />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Modo de Inserção</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-[#0057FF] border border-transparent dark:border-slate-800/40">
                      {data.modoInsercaoSalario === "unitario" ? "Modo: Por Operador" : "Modo: Total da Equipe"}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-xl z-[150]">
                    <DropdownMenuItem onClick={() => onChange({ modoInsercaoSalario: "total" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.modoInsercaoSalario === "total" || !data.modoInsercaoSalario ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Modo: Total da Equipe</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChange({ modoInsercaoSalario: "unitario" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.modoInsercaoSalario === "unitario" ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Modo: Por Operador</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Dedicação (%)</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.dedicacaoInicial) || "100,00"} onBlur={e => onChange({ dedicacaoInicial: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
              </div>
              {data.tipoSalario === "encargos" && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">
                    Fator de Encargos T1 <span className="text-slate-400 normal-case font-normal">(ex: 1,90 = 90% de encargos)</span>
                  </label>
                  <input
                    type="text"
                    key={`encI-${data.tipoSalario}`}
                    className="w-full h-12 px-4 rounded-xl border border-[#0057FF]/30 bg-blue-50/40 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all"
                    defaultValue=""
                    onBlur={e => onChange({ encargosInicial: parseDecimal(e.target.value) || 1 })}
                    placeholder="Ex: 1,90"
                  />
                </div>
              )}
            </div>
          </div>

          {/* T3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-slate-800 pb-2">Estado Final (T3)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Salário Base</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.salarioBaseFinal)} onBlur={e => onChange({ salarioBaseFinal: parseDecimal(e.target.value) })} placeholder="Ex: 2500,00" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Colaboradores</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed" value={op3} disabled />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Modo de Inserção</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-[#0057FF] border border-transparent dark:border-slate-800/40">
                      {data.modoInsercaoSalario === "unitario" ? "Modo: Por Operador" : "Modo: Total da Equipe"}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-xl z-[150]">
                    <DropdownMenuItem onClick={() => onChange({ modoInsercaoSalario: "total" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.modoInsercaoSalario === "total" || !data.modoInsercaoSalario ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Modo: Total da Equipe</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChange({ modoInsercaoSalario: "unitario" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.modoInsercaoSalario === "unitario" ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Modo: Por Operador</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">Dedicação (%)</label>
                <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.dedicacaoFinal) || "100,00"} onBlur={e => onChange({ dedicacaoFinal: parseDecimal(e.target.value) || 100 })} placeholder="Ex: 100,00" />
              </div>
              {data.tipoSalario === "encargos" && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">
                    Fator de Encargos T3 <span className="text-slate-400 normal-case font-normal">(ex: 1,90 = 90% de encargos)</span>
                  </label>
                  <input
                    type="text"
                    key={`encF-${data.tipoSalario}`}
                    className="w-full h-12 px-4 rounded-xl border border-[#0057FF]/30 bg-blue-50/40 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all"
                    defaultValue=""
                    onBlur={e => onChange({ encargosFinal: parseDecimal(e.target.value) || 1 })}
                    placeholder="Ex: 1,90"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investimentos */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-slate-800 pb-2">Investimentos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">
                Porte da Empresa
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition-all focus:ring-2 focus:ring-[#0057FF] border border-transparent dark:border-slate-800/40">
                    {data.valorConsultoria === VALORES_CONSULTORIA.micro ? "Micro Empresa" :
                     data.valorConsultoria === VALORES_CONSULTORIA.pequena ? "Pequena Empresa" :
                     data.valorConsultoria === VALORES_CONSULTORIA.media ? "Média Empresa" : "Selecione o porte da empresa"}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-xl z-[150]">
                  <DropdownMenuItem onClick={() => onChange({ valorConsultoria: 0 })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.valorConsultoria === 0 || !data.valorConsultoria ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Selecione o porte da empresa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChange({ valorConsultoria: VALORES_CONSULTORIA.micro })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.valorConsultoria === VALORES_CONSULTORIA.micro ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Micro Empresa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChange({ valorConsultoria: VALORES_CONSULTORIA.pequena })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.valorConsultoria === VALORES_CONSULTORIA.pequena ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Pequena Empresa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChange({ valorConsultoria: VALORES_CONSULTORIA.media })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${data.valorConsultoria === VALORES_CONSULTORIA.media ? "bg-[#0057FF] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>Média Empresa</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {data.valorConsultoria > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 pl-1 mt-1.5 block font-medium">
                  Valor: {formatBRL(data.valorConsultoria)}
                </span>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest pl-1">
                Investimentos Adicionais
              </label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-transparent dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#0057FF] transition-all" defaultValue={formatDec(data.investimentoExtra)} onBlur={e => onChange({ investimentoExtra: parseDecimal(e.target.value) })} placeholder="Investimento Extra (R$)" />
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: KPIs E LAUDO */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Custo Inicial" value={formatBRL(r.custoI)} />
          <KpiCard label="Custo Final" value={formatBRL(r.custoF)} />
          <KpiCard label="Redução Mensal" value={formatBRL(r.reducaoMensal)} />
          <KpiCard label="Payback" value={r.paybackMeses > 0 ? r.paybackMeses.toFixed(2).replace(".", ",") : "0,00"} suffix={r.paybackMeses === 1 ? "mês" : "meses"} />
        </div>
        
          <EditableLaudoCard title="Laudo de Payback" laudo={laudo} />
        
        <div className="mt-auto min-h-[250px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <ComparisonChart data={chartData} title={`Evolução do Custo por ${u.slice(0, -1)}`} />
        </div>
      </div>
    </div>
  );
}
