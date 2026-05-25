"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  FileImage,
} from "lucide-react"
import { GBOChart } from "@/components/gbo-chart"
import { CalculationsDashboard } from "@/components/calculations-dashboard"
import { DraggableOperationsList } from "@/components/draggable-operations-list"
import { exportToExcel, importFromExcel, downloadTemplate } from "@/components/export-utils"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/store/useAppStore"

interface Operation {
  id: string
  name: string
  time: number
  unit: "minutes" | "seconds"
}

const validateNumber = (value: string, min = 0): { isValid: boolean; error?: string } => {
  if (!value.trim()) return { isValid: false, error: "Campo obrigatório" }
  const num = Number.parseFloat(value)
  if (isNaN(num)) return { isValid: false, error: "Deve ser um número válido" }
  if (num <= min) return { isValid: false, error: `Deve ser maior que ${min}` }
  return { isValid: true }
}

const validateText = (value: string): { isValid: boolean; error?: string } => {
  if (!value.trim()) return { isValid: false, error: "Campo obrigatório" }
  if (value.trim().length < 2) return { isValid: false, error: "Mínimo 2 caracteres" }
  return { isValid: true }
}

export default function GBOAnalysis() {
  const { state, updateModule } = useAppStore()
  const gboData = state.gbo

  const operations = gboData.operacoes as Operation[]
  const timeUnit = gboData.tempoUnidade as "minutes" | "seconds"
  const workShiftTime = gboData.turnoTempo > 0 ? gboData.turnoTempo.toString() : ""
  const timeUnitTakt = gboData.turnoUnidade as "minutes" | "hours" | "seconds"
  const dailyDemand = gboData.demanda > 0 ? gboData.demanda.toString() : ""
  const demandUnit = gboData.demandaUnidade || "peças"

  const [newOperationName, setNewOperationName] = useState("")
  const [newOperationTime, setNewOperationTime] = useState("")
  const [previousTimeUnitTakt, setPreviousTimeUnitTakt] = useState<"minutes" | "seconds" | "hours">(timeUnitTakt)
  const [errors, setErrors] = useState<{
    operationName?: string
    operationTime?: string
    workShiftTime?: string
    dailyDemand?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (workShiftTime && previousTimeUnitTakt !== timeUnitTakt) {
      const currentValue = Number.parseFloat(workShiftTime)
      if (!isNaN(currentValue)) {
        let convertedValue = currentValue

        if (previousTimeUnitTakt === "hours") {
          convertedValue = currentValue * 60
        } else if (previousTimeUnitTakt === "seconds") {
          convertedValue = currentValue / 60
        }

        if (timeUnitTakt === "hours") {
          convertedValue = convertedValue / 60
        } else if (timeUnitTakt === "seconds") {
          convertedValue = convertedValue * 60
        }

        updateModule("gbo", { turnoTempo: Number(convertedValue.toFixed(2)) })
      }
      setPreviousTimeUnitTakt(timeUnitTakt)
    }
  }, [timeUnitTakt, workShiftTime, previousTimeUnitTakt, updateModule])

  const calculateTaktTime = (): number | undefined => {
    if (!workShiftTime || !dailyDemand) return undefined
    const shiftTime = Number.parseFloat(workShiftTime)
    const demand = Number.parseFloat(dailyDemand)

    if (shiftTime <= 0 || demand <= 0) return undefined

    let shiftTimeInSeconds = shiftTime
    if (timeUnitTakt === "minutes") {
      shiftTimeInSeconds = shiftTime * 60
    } else if (timeUnitTakt === "hours") {
      shiftTimeInSeconds = shiftTime * 3600
    }

    return shiftTimeInSeconds / demand
  }

  const addOperation = () => {
    const nameValidation = validateText(newOperationName)
    const timeValidation = validateNumber(newOperationTime)

    const newErrors: typeof errors = {}
    if (!nameValidation.isValid) newErrors.operationName = nameValidation.error
    if (!timeValidation.isValid) newErrors.operationTime = timeValidation.error

    setErrors(newErrors)

    if (!nameValidation.isValid || !timeValidation.isValid) {
      toast({ title: "Dados inválidos", description: "Verifique os campos destacados.", variant: "destructive" })
      return
    }

    const newOperation: Operation = {
      id: Date.now().toString(),
      name: newOperationName.trim(),
      time: Number.parseFloat(newOperationTime),
      unit: timeUnit,
    }

    updateModule("gbo", { operacoes: [...operations, newOperation] })
    setNewOperationName("")
    setNewOperationTime("")
    setErrors({})
    toast({ title: "✅ Operação adicionada", description: `"${newOperation.name}" foi adicionada.` })
  }

  const removeOperation = (id: string) => {
    const operation = operations.find((op) => op.id === id)
    updateModule("gbo", { operacoes: operations.filter((op) => op.id !== id) })
    if (operation) toast({ title: "Operação removida", description: `"${operation.name}" foi removida.` })
  }

  const editOperation = (id: string, newName: string, newTime: number) => {
    updateModule("gbo", {
      operacoes: operations.map((op) => (op.id === id ? { ...op, name: newName, time: newTime } : op))
    })
    toast({ title: "✅ Atualizado", description: `Operação "${newName}" atualizada.` })
  }

  const reorderOperations = (newOperations: Operation[]) => {
    updateModule("gbo", { operacoes: newOperations })
    toast({ title: "✅ Ordem atualizada", description: "A ordem das operações foi reorganizada." })
  }

  const validateTaktFields = () => {
    const shiftValidation = validateNumber(workShiftTime)
    const demandValidation = validateNumber(dailyDemand)

    const newErrors: typeof errors = { ...errors }
    if (!shiftValidation.isValid) newErrors.workShiftTime = shiftValidation.error
    else delete newErrors.workShiftTime

    if (!demandValidation.isValid) newErrors.dailyDemand = demandValidation.error
    else delete newErrors.dailyDemand

    setErrors(newErrors)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addOperation()
  }

  const handleExportExcel = async () => {
    if (operations.length === 0) return
    setIsLoading(true)
    try {
      await exportToExcel(operations, timeUnit)
      toast({ title: "✅ Excel exportado", description: "A planilha foi baixada." })
    } catch (error) {
      toast({ title: "❌ Erro", description: "Falha ao exportar Excel.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportChartPDF = () => {
    if (operations.length === 0) return
    setTimeout(() => {
      window.print()
    }, 300)
  }

  const handleImportExcel = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const importedOperations = await importFromExcel(file)
      if (importedOperations.length === 0) {
        toast({ title: "Aviso", description: "O arquivo não contém operações válidas.", variant: "destructive" })
        return
      }
      updateModule("gbo", { operacoes: importedOperations })
      toast({ title: "✅ Importação concluída", description: `${importedOperations.length} operações carregadas.` })
    } catch (error) {
      toast({ title: "❌ Erro", description: "Falha na importação.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          [data-radix-toast-provider], 
          [role="region"][aria-label="Notifications"], 
          .toaster,
          [data-radix-popper-content-wrapper] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        }
      `}} />

      <div className="h-full relative print:min-h-0 print:bg-transparent flex flex-col gap-8 animate-in fade-in duration-500">
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />

        <div className="pt-2 pb-4 w-full flex justify-between items-center z-50 print:hidden">
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Gráfico de Balanceamento de Operações (GBO)
          </h1>
          
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center rounded-full text-[#0F172A] hover:text-[#0057FF] hover:bg-[#0057FF]/10 transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-transparent shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-[#0057FF] flex items-center gap-2 font-bold text-lg">
                    <HelpCircle className="w-5 h-5" />
                    Manual Técnico GBO
                  </DialogTitle>
                  <DialogDescription>Protocolo Analítico de Balanceamento</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm mt-4 text-[#0F172A] leading-relaxed text-justify">
                  <p>O <strong>GBO</strong> é uma ferramenta analítica de fluxo. Ele plota os tempos de ciclo individuais de cada operação em relação ao Takt Time estabelecido.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 pb-12 print:p-12">
          
          <div className="xl:w-[40%] flex flex-col gap-6 print:hidden">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-[#0F172A] border-b border-slate-100 pb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0057FF] animate-pulse"></div>
                Cálculo do Takt Time
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tempo do Turno</label>
                    <input type="number" step="0.1" min="0" placeholder="8.0" value={workShiftTime}
                      onChange={(e) => { updateModule("gbo", { turnoTempo: Number(e.target.value) }); validateTaktFields(); }} onBlur={validateTaktFields}
                      className={`w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0057FF] transition-all ${errors.workShiftTime ? "ring-2 ring-rose-500" : ""}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Unidade</label>
                    <select value={timeUnitTakt} onChange={(e: any) => updateModule("gbo", { turnoUnidade: e.target.value })} className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-[#0057FF] transition-all">
                      <option value="minutes">Minutos</option>
                      <option value="hours">Horas</option>
                      <option value="seconds">Segundos</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Demanda Diária</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="1" min="0" placeholder="100" value={dailyDemand}
                      onChange={(e) => { updateModule("gbo", { demanda: Number(e.target.value) }); validateTaktFields(); }} onBlur={validateTaktFields}
                      className={`w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-[#0057FF] transition-all ${errors.dailyDemand ? "ring-2 ring-rose-500" : ""}`}
                    />
                    <input type="text" placeholder="Ex: caixas" value={demandUnit} onChange={(e) => updateModule("gbo", { demandaUnidade: e.target.value })} 
                      className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-[#0057FF] transition-all" />
                  </div>
                </div>

                {calculateTaktTime() && (
                  <div className="bg-[#0057FF]/5 border border-[#0057FF]/10 p-4 rounded-xl flex items-center gap-3 mt-4">
                    <CheckCircle2 className="h-5 w-5 text-[#0057FF]" />
                    <p className="text-sm font-semibold text-[#0057FF]">
                      Takt Time: {timeUnitTakt === "hours" ? (calculateTaktTime()! / 3600).toFixed(2)
                        : timeUnitTakt === "minutes" ? (calculateTaktTime()! / 60).toFixed(2)
                        : calculateTaktTime()!.toFixed(2)} {timeUnitTakt === "hours" ? "h" : timeUnitTakt === "minutes" ? "min" : "seg"}/{demandUnit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-[#0F172A] text-sm tracking-wide uppercase">Nova Operação</h3>
                <select value={timeUnit} onChange={(e: any) => updateModule("gbo", { tempoUnidade: e.target.value })} className="h-8 px-2 rounded-lg border-none bg-slate-50 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#0057FF]">
                  <option value="minutes">Minutos</option>
                  <option value="seconds">Segundos</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <input placeholder="Nome da Operação" value={newOperationName} onKeyPress={handleKeyPress}
                  onChange={(e) => { setNewOperationName(e.target.value); if (errors.operationName) setErrors((prev) => ({ ...prev, operationName: undefined })); }}
                  className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-[#0057FF] transition-all"
                />
                <input type="number" step="0.1" min="0" placeholder="Tempo" value={newOperationTime} onKeyPress={handleKeyPress}
                  onChange={(e) => { setNewOperationTime(e.target.value); if (errors.operationTime) setErrors((prev) => ({ ...prev, operationTime: undefined })); }}
                  className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-[#0057FF] transition-all"
                />
                <button onClick={addOperation} disabled={!newOperationName.trim() || !newOperationTime.trim() || isLoading}
                  className="w-full h-12 flex items-center justify-center bg-[#0057FF] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#0047D6] transition-all disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleImportExcel} disabled={isLoading} className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 shadow-sm">
                <Upload className="h-4 w-4 mr-2" /> Importar
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button disabled={isLoading} className="flex-1 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 shadow-sm">
                    <Download className="h-4 w-4 mr-2" /> Exportar
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl border-none shadow-xl p-2">
                  <DropdownMenuItem onClick={handleExportChartPDF} disabled={operations.length === 0} className="text-sm cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-50">
                    <FileImage className="h-4 w-4 mr-2 text-rose-500" /> Exportar Gráfico (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} disabled={operations.length === 0} className="text-sm cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-50">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Exportar Dados (Excel)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button onClick={downloadTemplate} disabled={isLoading} className="w-full h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 shadow-sm">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" /> Baixar Modelo Padrão
            </button>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
              <DraggableOperationsList operations={operations} timeUnit={timeUnit} onReorder={reorderOperations} onRemove={removeOperation} onEdit={editOperation} />
            </div>
          </div>

          {/* LADO DIREITO: GRÁFICOS */}
          <div className="xl:w-[60%] flex flex-col gap-6 print:w-full">
            {operations.length > 0 ? (
              <>
                <div className="print:hidden">
                  <CalculationsDashboard operations={operations} timeUnit={timeUnit} taktTime={calculateTaktTime()} taktTimeUnit={timeUnitTakt} demandUnit={demandUnit} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 print:border-none print:shadow-none print:p-0">
                  <GBOChart operations={operations} timeUnit={timeUnit} taktTime={calculateTaktTime()} taktTimeUnit={timeUnitTakt} demandUnit={demandUnit} />
                </div>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl print:hidden">
                <div className="p-4 rounded-full bg-slate-100 mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">Nenhuma operação</h3>
                <p className="text-sm text-slate-400">Preencha o formulário ao lado</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  )
}
