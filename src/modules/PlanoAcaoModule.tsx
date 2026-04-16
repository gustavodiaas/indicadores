"use client"

import { useState } from "react";
import { type PlanoAcaoData, type PlanoAcaoItem } from "@/store/useAppStore";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, 
  Calendar, User, DollarSign, ClipboardCheck,
  AlertCircle, Pencil
} from "lucide-react";
import { InputField } from "@/components/InputField";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  data: PlanoAcaoData;
  onChange: (d: Partial<PlanoAcaoData>) => void;
}

export function PlanoAcaoModule({ data, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newActionWhat, setNewActionWhat] = useState("");
  
  // Estado para a trava de exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });

  const addAction = () => {
    if (!newActionWhat.trim()) return;
    const newItem: PlanoAcaoItem = {
      id: Date.now().toString(),
      what: newActionWhat,
      why: "",
      where: "",
      start: "",
      end: "",
      who: "",
      how: "",
      howMuch: "",
      percent: 0,
      obs: "",
      status: "Não Iniciado"
    };
    onChange({ acoes: [newItem, ...data.acoes] });
    setNewActionWhat("");
    setExpandedId(newItem.id);
    toast.success("Nova ação adicionada!");
  };

  const confirmDelete = () => {
    if (!deleteConfirm.id) return;
    onChange({ acoes: data.acoes.filter(a => a.id !== deleteConfirm.id) });
    setDeleteConfirm({ open: false, id: null });
    toast.success("Ação removida com sucesso.");
  };

  const updateAction = (id: string, field: keyof PlanoAcaoItem, value: any) => {
    onChange({
      acoes: data.acoes.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      
      {/* MODAL DE CONFIRMAÇÃO (PADRÃO DO SISTEMA) */}
      <Dialog open={deleteConfirm.open} onOpenChange={(o) => setDeleteConfirm(prev => ({ ...prev, open: o }))}>
        <DialogContent className="bg-white rounded-2xl border-none shadow-2xl p-8 max-w-sm mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-rose-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Remover Ação?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Esta ação é irreversível. O item será excluído permanentemente do seu Plano 5W2H.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-3 w-full mt-8">
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold text-slate-500" onClick={() => setDeleteConfirm({ open: false, id: null })}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-rose-100" onClick={confirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            Execução de Tarefas <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs ml-2">{data.acoes.length}</span>
          </h2>
        </div>
      </div>

      {/* INPUT DE NOVA AÇÃO */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nova Ação (What)</label>
        <div className="flex gap-3">
          <input 
            type="text" 
            className="flex-1 h-12 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            placeholder="O que será feito?"
            value={newActionWhat}
            onChange={e => setNewActionWhat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAction()}
          />
          <button 
            onClick={addAction}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* LISTA DE AÇÕES */}
      <div className="flex flex-col gap-4">
        {data.acoes.map((acao) => (
          <div key={acao.id} className={`bg-white rounded-2xl border transition-all duration-300 ${expandedId === acao.id ? 'border-blue-400 shadow-lg' : 'border-slate-200 shadow-sm'}`}>
            
            {/* HEADER DO CARD */}
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === acao.id ? null : acao.id)}>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">{acao.what || "Sem título"}</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] font-bold uppercase ${acao.status === 'Concluído' ? 'text-emerald-500' : 'text-blue-500'}`}>
                    Status: {acao.status}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Progresso: {acao.percent}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pencil className={`w-4 h-4 ${expandedId === acao.id ? 'text-blue-500' : 'text-slate-300'}`} />
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: acao.id }); }}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="ml-2 text-slate-300">
                  {expandedId === acao.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* CONTEÚDO EXPANSÍVEL */}
            {expandedId === acao.id && (
              <div className="p-6 pt-0 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-3">
                  <InputField label="O que será feito? (What)" value={acao.what} onChange={v => updateAction(acao.id, 'what', v)} />
                </div>
                <InputField label="Como? (How)" value={acao.how} onChange={v => updateAction(acao.id, 'how', v)} />
                <InputField label="Por que? (Why)" value={acao.why} onChange={v => updateAction(acao.id, 'why', v)} />
                <InputField label="Onde? (Where)" value={acao.where} onChange={v => updateAction(acao.id, 'where', v)} />
                <InputField label="Quem? (Who)" value={acao.who} onChange={v => updateAction(acao.id, 'who', v)} />
                <InputField label="Início (When)" type="date" value={acao.start} onChange={v => updateAction(acao.id, 'start', v)} />
                <InputField label="Fim (When)" type="date" value={acao.end} onChange={v => updateAction(acao.id, 'end', v)} />
                <InputField label="Quanto custa? (How Much)" value={acao.howMuch} onChange={v => updateAction(acao.id, 'howMuch', v)} />
                <InputField label="% Completo" type="number" value={acao.percent} onChange={v => updateAction(acao.id, 'percent', Number(v))} />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={acao.status}
                    onChange={e => updateAction(acao.id, 'status', e.target.value)}
                  >
                    <option value="Não Iniciado">Não Iniciado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Atrasado">Atrasado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <InputField label="Observação" value={acao.obs} onChange={v => updateAction(acao.id, 'obs', v)} />
                </div>
              </div>
            )}
          </div>
        ))}

        {data.acoes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <ClipboardCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Nenhuma ação planejada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
