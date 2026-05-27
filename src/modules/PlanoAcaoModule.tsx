import { type PlanoAcaoData, type PlanoAcaoItem } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Download, CheckCircle, ChevronDown, ChevronUp, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: PlanoAcaoData;
  onChange: (d: Partial<PlanoAcaoData>) => void;
}

function CustomDatePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialDate = value && value.includes('-') ? new Date(value + 'T12:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value && value.includes('-')) {
      const d = new Date(value + 'T12:00:00');
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  const formatDisplay = (val: string) => {
    if (!val) return "Selecione a data";
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">{label}</label>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="w-full h-12 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between outline-none hover:bg-slate-100 transition-all focus:bg-white focus:ring-2 focus:ring-[#0057FF] border border-transparent text-left">
            <span className={value ? "text-slate-700" : "text-slate-400"}>{formatDisplay(value)}</span>
            <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-[150] w-72"
        >
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } }} 
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {months[currentMonth]} {currentYear}
            </span>
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } }} 
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
            {daysOfWeek.map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysArray.map((day, i) => {
              if (day === null) return <div key={i} className="h-8 w-8" />;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateString;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); const m = String(currentMonth + 1).padStart(2, '0'); const d = String(day).padStart(2, '0'); onChange(`${currentYear}-${m}-${d}`); setIsOpen(false); }}
                  className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
                    isSelected 
                      ? "bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/20" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function PlanoAcaoModule({ data, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newAcaoWhat, setNewAcaoWhat] = useState("");

  const updateMeta = (field: keyof typeof data.metadata, value: string) => {
    onChange({ metadata: { ...data.metadata, [field]: value } });
  };

  const handleAddAcao = () => {
    if (newAcaoWhat.trim()) {
      const nova: PlanoAcaoItem = {
        id: Date.now().toString(),
        what: newAcaoWhat.trim(),
        why: "", where: "", start: "", end: "", who: "", how: "", howMuch: "", percent: 0, obs: "", status: "NÃO INICIADO",
        origin: "5w2h"
      };
      onChange({ acoes: [...data.acoes, nova] });
      setNewAcaoWhat("");
    }
  };

  const updateAcao = (id: string, field: keyof PlanoAcaoItem, value: any) => {
    const novasAcoes = data.acoes.map(a => a.id === id ? { ...a, [field]: value } : a);
    onChange({ acoes: novasAcoes });
  };

  const handleRemoveAcao = (id: string) => {
    onChange({ acoes: data.acoes.filter(a => a.id !== id) });
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parseCellString = (cell: ExcelJS.Cell): string => {
      const val = cell.value;
      if (val === null || val === undefined) return "";
      if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      if (typeof val === 'object' && 'result' in val) {
        return val.result?.toString() || "";
      }
      return val.toString();
    };

    const parseCellNumber = (cell: ExcelJS.Cell): number => {
      const val = cell.value;
      if (val === null || val === undefined) return 0;
      if (typeof val === 'object' && 'result' in val) {
        return Number(val.result) || 0;
      }
      return Number(val) || 0;
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const ws = workbook.worksheets[0];

      if (!ws) {
        toast.error("Planilha inválida ou vazia.");
        return;
      }

      // 1. IMPORTAR METADADOS
      const metadata = {
        dataCriacao: parseCellString(ws.getCell('B3')),
        respCriacao: parseCellString(ws.getCell('D3')),
        objetivo: parseCellString(ws.getCell('G3')),
        meta: parseCellString(ws.getCell('I3')),
        dataRevisao: parseCellString(ws.getCell('B4')),
        respRevisao: parseCellString(ws.getCell('D4')),
        indicador: parseCellString(ws.getCell('G4')),
      };

      // 2. IMPORTAR TAREFAS (A partir da Linha 8)
      let rowNum = 8;
      const acoesImportadas: PlanoAcaoItem[] = [];

      while (rowNum < 500) {
        const what = parseCellString(ws.getCell(`A${rowNum}`));
        
        if (!what.trim()) {
          let hasMore = false;
          for (let check = 1; check <= 3; check++) {
            if (parseCellString(ws.getCell(`A${rowNum + check}`)).trim()) {
              hasMore = true;
              break;
            }
          }
          if (!hasMore) break;
          rowNum++;
          continue;
        }

        const rawStatus = parseCellString(ws.getCell(`L${rowNum}`)).toUpperCase().trim();
        let status: PlanoAcaoItem["status"] = "NÃO INICIADO";
        if (rawStatus.includes("EM ANDAMENTO")) status = "EM ANDAMENTO";
        else if (rawStatus.includes("INICIADO")) status = "INICIADO";
        else if (rawStatus.includes("REJEITADO")) status = "REJEITADO";
        else if (rawStatus.includes("CONCLUIDO") || rawStatus.includes("CONCLUÍDO")) status = "CONCLUIDO";

        acoesImportadas.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9) + rowNum,
          what,
          how: parseCellString(ws.getCell(`B${rowNum}`)),
          who: parseCellString(ws.getCell(`C${rowNum}`)),
          start: parseCellString(ws.getCell(`D${rowNum}`)),
          end: parseCellString(ws.getCell(`E${rowNum}`)),
          where: parseCellString(ws.getCell(`F${rowNum}`)),
          why: parseCellString(ws.getCell(`G${rowNum}`)),
          howMuch: parseCellString(ws.getCell(`H${rowNum}`)),
          percent: Math.min(100, Math.max(0, Math.round(parseCellNumber(ws.getCell(`I${rowNum}`)) * 100))),
          obs: parseCellString(ws.getCell(`K${rowNum}`)),
          status,
          origin: "5w2h"
        });

        rowNum++;
      }

      onChange({ metadata, acoes: acoesImportadas });
      toast.success(`Planilha carregada! ${acoesImportadas.length} ações sincronizadas.`);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao ler o arquivo Excel. Verifique a estrutura.");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportExcel = async () => {
    if (data.acoes.length === 0) {
      toast.error("Adicione ações antes de exportar.");
      return;
    }

    try {
      const response = await fetch('/template_5w2h.xlsx');
      
      if (!response.ok) {
        toast.error("Arquivo não encontrado! Verifique se 'template_5w2h.xlsx' está na pasta public.");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const ws = workbook.worksheets[0];
      const m = data.metadata;

      if (m.dataCriacao) ws.getCell('B3').value = m.dataCriacao;
      if (m.respCriacao) ws.getCell('D3').value = m.respCriacao;
      if (m.objetivo) ws.getCell('G3').value = m.objetivo;
      if (m.meta) ws.getCell('I3').value = m.meta;

      if (m.dataRevisao) ws.getCell('B4').value = m.dataRevisao;
      if (m.respRevisao) ws.getCell('D4').value = m.respRevisao;
      if (m.indicador) ws.getCell('G4').value = m.indicador;

      let currentRow = 8;
      data.acoes.forEach((a) => {
        ws.getCell(`A${currentRow}`).value = a.what;
        ws.getCell(`B${currentRow}`).value = a.how || "";
        ws.getCell(`C${currentRow}`).value = a.who || "";
        ws.getCell(`D${currentRow}`).value = a.start || "";
        ws.getCell(`E${currentRow}`).value = a.end || "";
        ws.getCell(`F${currentRow}`).value = a.where || "";
        ws.getCell(`G${currentRow}`).value = a.why || "";
        ws.getCell(`H${currentRow}`).value = a.howMuch ? Number(a.howMuch) : 0;
        ws.getCell(`I${currentRow}`).value = a.percent ? (Number(a.percent) / 100) : 0;
        ws.getCell(`K${currentRow}`).value = a.obs || "";
        ws.getCell(`L${currentRow}`).value = a.status || "NÃO INICIADO";
        
        currentRow++;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Plano_Acao_${m.indicador || 'Exportado'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Excel gerado com sucesso preservando o design!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar a planilha. Verifique o console.");
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-[#0057FF]" /> PLANO DE AÇÃO 5W2H
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerenciamento tático e detalhamento das ações corretivas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            id="excel-5w2h-import" 
            accept=".xlsx" 
            className="hidden" 
            onChange={handleImportExcel} 
          />
          <button 
            onClick={() => document.getElementById('excel-5w2h-import')?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-[#0057FF] border border-blue-100 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-blue-100 transition-all active:scale-95"
          >
            <Upload className="h-4 w-4" /> Importar
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Baixar Planilha
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest mb-4 border-b border-slate-100 pb-2">Metadados do Projeto</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CustomDatePicker label="Data de Criação" value={data.metadata.dataCriacao} onChange={v => updateMeta("dataCriacao", v)} />
          <InputField label="Responsável (Consultor/Empresário)" value={data.metadata.respCriacao} onChange={v => updateMeta("respCriacao", v)} />
          <InputField label="Objetivo" value={data.metadata.objetivo} onChange={v => updateMeta("objetivo", v)} />
          <InputField label="Meta" value={data.metadata.meta} onChange={v => updateMeta("meta", v)} />
          
          <CustomDatePicker label="Data de Revisão" value={data.metadata.dataRevisao} onChange={v => updateMeta("dataRevisao", v)} />
          <InputField label="Responsável (Revisão)" value={data.metadata.respRevisao} onChange={v => updateMeta("respRevisao", v)} />
          <div className="md:col-span-2"><InputField label="Indicador" value={data.metadata.indicador} onChange={v => updateMeta("indicador", v)} /></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1">
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest flex items-center gap-2">
            Execução de Tarefas 
            <span className="bg-[#0057FF]/10 text-[#0057FF] px-2 py-0.5 rounded-full text-[10px]">{data.acoes.length}</span>
          </h3>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <InputField label="Nova Ação (What)" value={newAcaoWhat} onChange={setNewAcaoWhat} />
            </div>
            <button 
              onClick={handleAddAcao} 
              className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#0047D6] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </div>

        {data.acoes.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
             <CheckCircle className="h-12 w-12 mb-4 text-slate-300" />
             <p className="text-sm font-bold text-slate-600">Nenhuma ação vinculada.</p>
             <p className="text-xs mt-1">Crie tarefas no campo acima ou importe macros da aba "Resumo".</p>
           </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.acoes.map(a => (
              <div key={a.id} className="border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer select-none transition-colors border-b border-transparent"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <div className="flex flex-col flex-1 pr-4">
                    <span className="text-sm font-black text-slate-800 truncate">{a.what}</span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">Status: <span className="text-[#0057FF] font-bold">{a.status || "NÃO INICIADO"}</span> • Progresso: {a.percent || 0}%</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {expandedId === a.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveAcao(a.id); }}
                      className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </button>
                  </div>
                </div>

                {expandedId === a.id && (
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="md:col-span-4"><InputField label="O que será feito? (What)" value={a.what} onChange={v => updateAcao(a.id, "what", v)} /></div>
                    <div className="md:col-span-2"><InputField label="Como? (How)" value={a.how} onChange={v => updateAcao(a.id, "how", v)} /></div>
                    <InputField label="Por que? (Why)" value={a.why} onChange={v => updateAcao(a.id, "why", v)} />
                    <InputField label="Onde? (Where)" value={a.where} onChange={v => updateAcao(a.id, "where", v)} />
                    
                    <InputField label="Quem? (Who)" value={a.who} onChange={v => updateAcao(a.id, "who", v)} />
                    <CustomDatePicker label="Início (When)" value={a.start} onChange={v => updateAcao(a.id, "start", v)} />
                    <CustomDatePicker label="Fim (When)" value={a.end} onChange={v => updateAcao(a.id, "end", v)} />
                    <InputField label="Quanto Custa? (How Much)" value={a.howMuch} onChange={v => updateAcao(a.id, "howMuch", v)} type="number" />
                    
                    <InputField label="% Completo" value={a.percent} onChange={v => updateAcao(a.id, "percent", Number(v) || 0)} type="number" />
                    <div className="md:col-span-2"><InputField label="Observação" value={a.obs} onChange={v => updateAcao(a.id, "obs", v)} /></div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Status</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center justify-between outline-none hover:bg-slate-50 transition-all focus:ring-2 focus:ring-[#0057FF]">
                            ={a.status === "INICIADO" ? "Iniciado" :
                              a.status === "EM ANDAMENTO" ? "Em Andamento" :
                              a.status === "REJEITADO" ? "Rejeitado" :
                              a.status === "CONCLUIDO" ? "Concluído" : "Não Iniciado"}
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-slate-100 p-2 rounded-2xl shadow-xl z-[150]">
                          <DropdownMenuItem onClick={() => updateAcao(a.id, "status", "NÃO INICIADO")} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${(a.status === "NÃO INICIADO" || !a.status) ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"}`}>Não Iniciado</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateAcao(a.id, "status", "INICIADO")} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${a.status === "INICIADO" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"}`}>Iniciado</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateAcao(a.id, "status", "EM ANDAMENTO")} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${a.status === "EM ANDAMENTO" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"}`}>Em Andamento</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateAcao(a.id, "status", "REJEITADO")} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${a.status === "REJEITADO" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"}`}>Rejeitado</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateAcao(a.id, "status", "CONCLUIDO")} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${a.status === "CONCLUIDO" ? "bg-[#0057FF] text-white" : "text-slate-700 hover:bg-slate-50"}`}>Concluído</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
