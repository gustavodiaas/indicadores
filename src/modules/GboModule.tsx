"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, Download, Upload, FileSpreadsheet, HelpCircle, CheckCircle2, FileImage, Trash2 } from "lucide-react"
import { GBOChart } from "@/components/gbo-chart"
import { CalculationsDashboard } from "@/components/calculations-dashboard"
import { DraggableOperationsList } from "@/components/draggable-operations-list"
import { exportToExcel, importFromExcel, downloadTemplate } from "@/components/export-utils"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

interface Operation { id: string; name: string; time: number; unit: "minutes" | "seconds" }

export default function GBOAnalysis() {
  const { state, updateModule } = useAppStore()
  const gboData = state.gbo
  const operations = gboData.operacoes as Operation[]
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newOperationName, setNewOperationName] = useState("")
  const [newOperationTime, setNewOperationTime] = useState("")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const confirmDelete = () => {
    if (!deleteId) return;
    updateModule("gbo", { operacoes: operations.filter((op) => op.id !== deleteId) });
    setDeleteId(null);
    toast({ title: "Operação removida", description: "O item foi excluído do balanceamento." });
  };

  const handleExportChartPDF = () => {
    if (operations.length === 0) return;
    setTimeout(() => { window.print(); }, 300);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 0mm !important; }
          body { background: white !important; padding: 10mm !important; }
          [data-radix-toast-provider], [data-sonner-toaster], [role="region"], [role="status"], [role="alert"], .toaster, .toast-viewport, [data-radix-popper-content-wrapper], [role="dialog"], .recharts-tooltip-wrapper, .recharts-tooltip-cursor, #radix-portal, div[style*="position: fixed"] {
            display: none !important;
          }
        }
      `}} />

      <div className="h-full relative flex flex-col gap-8 animate-in fade-in duration-500">
        {/* MODAL DE CONFIRMAÇÃO GLOBAL */}
        <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <DialogContent className="bg-white rounded-2xl border-none shadow-2xl p-8 max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4"><Trash2 className="h-8 w-8 text-rose-500" /></div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">Remover Operação</DialogTitle>
                <DialogDescription className="text-slate-500 mt-2">Deseja realmente remover esta operação? Isso afetará os cálculos de Takt Time e GBO.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-3 w-full mt-8">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold text-slate-500" onClick={() => setDeleteId(null)}>Cancelar</Button>
                <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 font-bold" onClick={confirmDelete}>Confirmar</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ... Resto do Header e Layout ... */}
        <div className="pt-2 pb-4 w-full flex justify-between items-center z-50 print:hidden border-b border-slate-200">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Gráfico de Balanceamento de Operações (GBO)</h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 pb-12 print:p-0">
          <div className="xl:w-[40%] flex flex-col gap-6 print:hidden">
            {/* ... Seção de Cálculo do Takt Time ... */}
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <DraggableOperationsList 
                operations={operations} 
                timeUnit={gboData.tempoUnidade as any} 
                onReorder={(ops) => updateModule("gbo", { operacoes: ops })} 
                onRemove={(id) => setDeleteId(id)} // AGORA CHAMA O MODAL
                onEdit={(id, name, time) => {
                  updateModule("gbo", { operacoes: operations.map(op => op.id === id ? { ...op, name, time } : op) });
                }} 
              />
            </div>
          </div>

          <div className="xl:w-[60%] flex flex-col gap-6 print:w-full">
            {operations.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 print:border-none print:p-0">
                <GBOChart operations={operations} timeUnit={gboData.tempoUnidade as any} taktTime={gboData.turnoTempo} taktTimeUnit={gboData.turnoUnidade as any} demandUnit={gboData.demandaUnidade} />
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-400">Nenhuma operação.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
