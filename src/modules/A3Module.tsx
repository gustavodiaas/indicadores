"use client"

import { type A3Data, type A3PlanoAcao, type A3Indicador } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Download, LayoutTemplate, Plus, Trash2, AlertTriangle, Pencil, ChevronDown, ChevronUp, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
        <DropdownMenuContent align="start" className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-[150] w-72">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{months[currentMonth]} {currentYear}</span>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } }} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all">
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
                <button key={i} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const m = String(currentMonth + 1).padStart(2, '0'); const d = String(day).padStart(2, '0'); onChange(`${currentYear}-${m}-${d}`); setIsOpen(false); }} className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${isSelected ? "bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/20" : "text-slate-600 hover:bg-slate-50"}`}>
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

const TextAreaBlock = ({ title, value, maxChars, onChangeField }: { title: string, value: string, maxChars: number, onChangeField: (v: string) => void }) => {
  const currentChars = (value || "").length;
  const isOverLimit = currentChars > maxChars;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm shrink-0 min-h-[150px] flex-1 relative">
      <div className="bg-[#0057FF] border-b border-[#0047D6] px-3 py-2 flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</h4>
      </div>
      <textarea
        className="flex-1 w-full p-3 pb-8 text-xs text-slate-600 outline-none resize-none bg-transparent leading-relaxed"
        placeholder="Descreva de forma resumida e direta..."
        value={value || ""}
        onChange={(e) => onChangeField(e.target.value)}
      />
      <div className={`absolute bottom-2 right-3 text-[10px] font-bold ${isOverLimit ? 'text-rose-500' : 'text-slate-400'}`}>
        {currentChars} / {maxChars}
      </div>
    </div>
  );
};

const formatBRDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

interface Props {
  data: A3Data;
  onChange: (d: Partial<A3Data>) => void;
}

export function A3Module({ data, onChange }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'acao' | 'indicador'; id: string | null }>({
    open: false,
    type: 'acao',
    id: null
  });

  const listaPlanoAcao = Array.isArray(data.planoAcao) ? data.planoAcao : [];
  const listaIndicadores = Array.isArray(data.indicadores) ? data.indicadores : [];

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/template_a3.xlsx');
      const contentType = response.headers.get("content-type");
      if (!response.ok || (contentType && contentType.includes("text/html"))) {
        toast.error("O molde não foi encontrado!");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      if (data.titulo) ws.getCell('I2').value = data.titulo;       
      if (data.data) ws.getCell('BD2').value = formatBRDate(data.data);           
      if (data.aprovacoes) ws.getCell('CB2').value = data.aprovacoes; 
      if (data.background) ws.getCell('A5').value = data.background;
      if (data.objetivos) ws.getCell('A16').value = data.objetivos;
      if (data.estadoAtual) ws.getCell('A24').value = data.estadoAtual;
      if (data.analise) ws.getCell('A37').value = data.analise;
      if (data.estadoFuturo) ws.getCell('AO5').value = data.estadoFuturo;
      
      let rowAcao = 18; 
      listaPlanoAcao.forEach(acao => {
        ws.getCell(`AO${rowAcao}`).value = acao.oque;
        ws.getCell(`BD${rowAcao}`).value = acao.quem;
        ws.getCell(`BK${rowAcao}`).value = acao.prazo;
        rowAcao++;
      });

      let rowInd = 33;
      listaIndicadores.forEach(ind => {
        ws.getCell(`AO${rowInd}`).value = ind.indicador;
        ws.getCell(`BD${rowInd}`).value = ind.meta;   
        ws.getCell(`BK${rowInd}`).value = ind.status; 
        rowInd++;
      });

      if (data.observacoes) ws.getCell('A47').value = data.observacoes; 

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `A3_${data.titulo || 'Toyota'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel gerado!");
    } catch (error) {
      toast.error("Falha ao montar o Excel.");
    }
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const confirmDelete = () => {
    if (!deleteConfirm.id) return;
    if (deleteConfirm.type === 'acao') {
      onChange({ planoAcao: listaPlanoAcao.filter(a => a.id !== deleteConfirm.id) });
    } else {
      onChange({ indicadores: listaIndicadores.filter(i => i.id !== deleteConfirm.id) });
    }
    setDeleteConfirm({ open: false, type: 'acao', id: null });
    toast.success("Item removido com sucesso.");
  };

  const updatePlanoAcao = (id: string, field: keyof A3PlanoAcao, value: string) => {
    onChange({ planoAcao: listaPlanoAcao.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };

  const updateIndicador = (id: string, field: keyof A3Indicador, value: string) => {
    onChange({ indicadores: listaIndicadores.map(i => i.id === id ? { ...i, [field]: value } : i) });
  };

  return (
    <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      <Dialog open={deleteConfirm.open} onOpenChange={(o) => setDeleteConfirm(prev => ({ ...prev, open: o }))}>
        <DialogContent className="bg-white rounded-2xl border-none shadow-2xl p-8 max-w-sm mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-rose-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Esta ação não pode ser desfeita. Deseja realmente remover este item da tabela?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 w-full mt-8">
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold text-slate-500" onClick={() => setDeleteConfirm({ open: false, type: 'acao', id: null })}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-rose-100" onClick={confirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LayoutTemplate className="h-6 w-6 text-[#0057FF]" /> RELATÓRIO A3 (TOYOTA)
        </h2>
        <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all">
          <Download className="h-4 w-4" /> Baixar Excel
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 shrink-0">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <p className="text-xs text-amber-800 font-medium"><strong>Poder de Síntese:</strong> O layout do Excel possui áreas cravadas (máximo 13 linhas).</p>
      </div>

      <div className="flex flex-col gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shrink-0 items-end">
          <div className="md:col-span-3"><InputField label="Título / Tema" value={data.titulo || ""} onChange={v => onChange({ titulo: v })} /></div>
          <div className="md:col-span-1"><CustomDatePicker label="Data" value={data.data || ""} onChange={v => onChange({ data: v })} /></div>
          <div className="md:col-span-2"><InputField label="Aprovações" value={data.aprovacoes || ""} onChange={v => onChange({ aprovacoes: v })} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <TextAreaBlock title="1. Considerações Iniciais (Background)" maxChars={550} value={data.background} onChangeField={v => onChange({ background: v })} />
            <TextAreaBlock title="2. Metas, Objetivos, Benefícios" maxChars={350} value={data.objetivos} onChangeField={v => onChange({ objetivos: v })} />
            <TextAreaBlock title="3. Estado Atual" maxChars={650} value={data.estadoAtual} onChangeField={v => onChange({ estadoAtual: v })} />
            <TextAreaBlock title="4. Análise" maxChars={500} value={data.analise} onChangeField={v => onChange({ analise: v })} />
          </div>

          <div className="flex flex-col gap-4">
            <TextAreaBlock title="5. Estado Futuro / Recomendações" maxChars={600} value={data.estadoFuturo} onChangeField={v => onChange({ estadoFuturo: v })} />
            
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col shrink-0">
              <div className="bg-[#0057FF] border-b border-[#0047D6] px-3 py-2 flex justify-between items-center text-white font-bold text-[10px] uppercase">
                <div className="flex items-center gap-2">6. Plano de Ação <span className="bg-white/20 px-1.5 py-0.5 rounded-md">{listaPlanoAcao.length}/13</span></div>
                <button onClick={() => onChange({ planoAcao: [...listaPlanoAcao, { id: generateId(), oque: "", quem: "", prazo: "" }] })} className="bg-white/20 hover:bg-white/30 rounded p-1"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                {listaPlanoAcao.map((a) => (
                  <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center"><Pencil className="w-3 h-3 text-slate-300" /></div>
                    <div className="col-span-5"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]" value={a.oque} onChange={e => updatePlanoAcao(a.id, "oque", e.target.value)} placeholder="O que fazer?" /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]" value={a.quem} onChange={e => updatePlanoAcao(a.id, "quem", e.target.value)} placeholder="Quem?" /></div>
                    <div className="col-span-2"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]" value={a.prazo} onChange={e => updatePlanoAcao(a.id, "prazo", e.target.value)} placeholder="Prazo" /></div>
                    <div className="col-span-1 text-center"><button onClick={() => setDeleteConfirm({ open: true, type: 'acao', id: a.id })} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col shrink-0">
              <div className="bg-[#0057FF] border-b border-[#0047D6] px-3 py-2 flex justify-between items-center text-white font-bold text-[10px] uppercase">
                <div className="flex items-center gap-2">7. Acompanhamento <span className="bg-white/20 px-1.5 py-0.5 rounded-md">{listaIndicadores.length}/13</span></div>
                <button onClick={() => onChange({ indicadores: [...listaIndicadores, { id: generateId(), indicador: "", meta: "", status: "" }] })} className="bg-white/20 hover:bg-white/30 rounded p-1"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                {listaIndicadores.map((i) => (
                  <div key={i.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 flex justify-center"><Pencil className="w-3 h-3 text-slate-300" /></div>
                    <div className="col-span-5"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]" value={i.indicador} onChange={e => updateIndicador(i.id, "indicador", e.target.value)} placeholder="Indicador" /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]" value={i.meta} onChange={e => updateIndicador(i.id, "meta", e.target.value)} placeholder="Meta" /></div>
                    <div className="col-span-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-medium text-slate-700 flex items-center justify-between outline-none hover:bg-slate-50 transition-all focus:ring-1 focus:ring-[#0057FF] focus:border-[#0057FF]">
                            <span className="truncate">{i.status || "Status"}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32 bg-white border border-slate-100 p-1.5 rounded-xl shadow-xl z-[150]">
                          <DropdownMenuItem onClick={() => updateIndicador(i.id, "status", "")} className={`w-full text-left text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${!i.status ? "bg-[#0057FF] text-white" : "text-slate-600 hover:bg-slate-50"}`}>Limpar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateIndicador(i.id, "status", "No Prazo")} className={`w-full text-left text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${i.status === "No Prazo" ? "bg-[#0057FF] text-white" : "text-slate-600 hover:bg-slate-50"}`}>No Prazo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateIndicador(i.id, "status", "Atrasado")} className={`w-full text-left text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${i.status === "Atrasado" ? "bg-[#0057FF] text-white" : "text-slate-600 hover:bg-slate-50"}`}>Atrasado</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateIndicador(i.id, "status", "Concluído")} className={`w-full text-left text-[11px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${i.status === "Concluído" ? "bg-[#0057FF] text-white" : "text-slate-600 hover:bg-slate-50"}`}>Concluído</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="col-span-1 text-center"><button onClick={() => setDeleteConfirm({ open: true, type: 'indicador', id: i.id })} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 shrink-0">
           <TextAreaBlock title="Descrição / Observações Adicionais" maxChars={800} value={data.observacoes || ""} onChangeField={v => onChange({ observacoes: v })} />
        </div>
      </div>
    </div>
  );
}
