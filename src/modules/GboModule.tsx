"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  FileImage,
  ChevronDown,
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
} from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
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
  const [demandPeriod, setDemandPeriod] = useState<"dia" | "mes">("dia")
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
    const rawDemand = Number.parseFloat(dailyDemand)

    if (shiftTime <= 0 || rawDemand <= 0) return undefined

    const demand = demandPeriod === "mes" ? rawDemand / 21 : rawDemand

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

  const handleExportChartPDF = async () => {
    if (operations.length === 0) return

    const element = document.getElementById("gbo-chart-container")
    if (!element) return

    setIsLoading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("l", "mm", "a4")
      const imgWidth = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight)
      pdf.save("Relatorio_GBO.pdf")

      toast({ title: "✅ PDF exportado", description: "O gráfico foi salvo." })
    } catch (error) {
      console.error(error)
      toast({ title: "❌ Erro", description: "Falha ao gerar o PDF.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
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
          @page { size: landscape; margin: 1cm; }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-canvas {
            width: 100% !important;
            padding: 20px !important;
            overflow: visible !important;
          }
          [data-radix-toast-provider],
          [role="region"][aria-label="Notifications"],
          .toaster,
          [data-radix-popper-content-wrapper] {
            display: none !important;
          }
        }
      `}} />

      <div className="h-full relative print:min-h-0 print:bg-transparent flex flex-col gap-6 animate-in fade-in duration-500">
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />

        <div className="pt-2 pb-4 w-full flex justify-between items-center z-50 print:hidden border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-[#0A1828] dark:text-slate-100">
              Gráfico de Balanceamento de Operações (GBO)
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center rounded-full text-[#0A1828] dark:text-slate-400 hover:text-[#002D72] hover:bg-[#002D72]/10 transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 shadow-lg bg-white dark:bg-[#1C1C1E] text-[#0A1828] dark:text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-[#002D72] flex items-center gap-2 font-bold text-lg">
                    <HelpCircle className="w-5 h-5" />
                    Manual Técnico GBO
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">Protocolo Analítico de Balanceamento</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm mt-4 leading-relaxed text-justify">
                  <p>O <strong>GBO (Gráfico de Balanceamento de Operações)</strong> é uma ferramenta analítica de fluxo. Ele plota os tempos de ciclo individuais de cada operação em relação ao Takt Time estabelecido.</p>
                  <p><strong>Objetivo:</strong> Identificar restrições sistêmicas (gargalos) e fornecer uma base de dados limpa para o nivelamento da capacidade produtiva.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 pb-12 print:p-12">

          {/* COLUNA ESQUERDA: FOMULÁRIOS */}
          <div className="xl:w-[40%] flex flex-col gap-6 print:hidden">

            <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
              <h3 className="font-bold text-[#0A1828] dark:text-slate-100 border-b border-slate-200 dark:border-white/10 pb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#002D72] animate-pulse"></div>
                Cálculo do Takt Time
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Demanda</span>
                  <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setDemandPeriod("dia")}
                      className={`px-3 py-1 text-xs font-medium transition-all ${demandPeriod === "dia" ? "bg-[#FF6B00] text-white" : "bg-slate-50 dark:bg-[#2C2C2E] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#001833]"}`}
                    >
                      Dia
                    </button>
                    <button
                      onClick={() => setDemandPeriod("mes")}
                      className={`px-3 py-1 text-xs font-medium transition-all ${demandPeriod === "mes" ? "bg-[#FF6B00] text-white" : "bg-slate-50 dark:bg-[#2C2C2E] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#001833]"}`}
                    >
                      Mês
                    </button>
                  </div>
                </div>
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1">Tempo do Turno</label>
                    <input type="number" step="0.1" min="0" placeholder="8.0" value={workShiftTime}
                      onChange={(e) => { updateModule("gbo", { turnoTempo: Number(e.target.value) }); validateTaktFields(); }} onBlur={validateTaktFields}
                      className={`w-full h-10 px-3 rounded-lg border-none bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all ${errors.workShiftTime ? "ring-2 ring-rose-500" : ""}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1">Unidade</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none hover:bg-slate-100 dark:hover:bg-[#001833] transition-all focus:bg-white dark:focus:bg-[#0D2B57] focus:ring-2 focus:ring-[#FF6B00]">
                          {timeUnitTakt === "minutes" ? "Minutos" : timeUnitTakt === "hours" ? "Horas" : "Segundos"}
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-2 rounded-lg shadow-md z-[150]">
                        <DropdownMenuItem onClick={() => updateModule("gbo", { turnoUnidade: "minutes" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${timeUnitTakt === "minutes" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"}`}>Minutos</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateModule("gbo", { turnoUnidade: "hours" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${timeUnitTakt === "hours" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"}`}>Horas</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateModule("gbo", { turnoUnidade: "seconds" })} className={`w-full text-left text-sm font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all ${timeUnitTakt === "seconds" ? "bg-[#FF6B00] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"}`}>Segundos</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-1">Demanda ({demandUnit}/{demandPeriod === "mes" ? "mês" : "dia"})</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="1" min="0" placeholder="100" value={dailyDemand}
                      onChange={(e) => { updateModule("gbo", { demanda: Number(e.target.value) }); validateTaktFields(); }} onBlur={validateTaktFields}
                      className={`w-full h-10 px-3 rounded-lg border-none bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all ${errors.dailyDemand ? "ring-2 ring-rose-500" : ""}`}
                    />
                    <input
                      type="text"
                      placeholder="Ex: caixas"
                      value={demandUnit}
                      onChange={(e) => updateModule("gbo", { demandaUnidade: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border-none bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                    />
                  </div>
                </div>

                {calculateTaktTime() && (
                  <div className="bg-[#002D72]/5 border border-[#002D72]/10 p-4 rounded-xl flex items-center gap-3 mt-4">
                    <CheckCircle2 className="h-5 w-5 text-[#002D72]" />
                    <p className="text-sm font-semibold text-[#002D72]">
                      Takt Time: {timeUnitTakt === "hours" ? (calculateTaktTime()! / 3600).toFixed(2)
                        : timeUnitTakt === "minutes" ? (calculateTaktTime()! / 60).toFixed(2)
                        : calculateTaktTime()!.toFixed(2)} {timeUnitTakt === "hours" ? "h" : timeUnitTakt === "minutes" ? "min" : "seg"}/{demandUnit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <h3 className="font-bold text-[#0A1828] dark:text-slate-100 text-sm tracking-wide uppercase">Nova Operação</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 px-3 rounded-lg bg-slate-50 dark:bg-[#2C2C2E] text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 outline-none hover:bg-slate-100 dark:hover:bg-[#001833] transition-all focus:bg-white dark:focus:bg-[#0D2B57] focus:ring-2 focus:ring-[#FF6B00]">
                      {timeUnit === "minutes" ? "Minutos" : "Segundos"}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-1.5 rounded-xl shadow-md z-[150]">
                    <DropdownMenuItem onClick={() => updateModule("gbo", { tempoUnidade: "minutes" })} className={`w-full text-left text-[10px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${timeUnit === "minutes" ? "bg-[#FF6B00] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"}`}>Minutos</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateModule("gbo", { tempoUnidade: "seconds" })} className={`w-full text-left text-[10px] font-bold py-2 px-2.5 rounded-lg cursor-pointer transition-all ${timeUnit === "seconds" ? "bg-[#FF6B00] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"}`}>Segundos</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <input placeholder="Nome da Operação" value={newOperationName} onKeyPress={handleKeyPress}
                  onChange={(e) => { setNewOperationName(e.target.value); if (errors.operationName) setErrors((prev) => ({ ...prev, operationName: undefined })); }}
                  className="w-full h-10 px-3 rounded-lg border-none bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                />
                <input type="number" step="0.01" min="0" placeholder="Tempo" value={newOperationTime} onKeyPress={handleKeyPress}
                  onChange={(e) => { setNewOperationTime(e.target.value); if (errors.operationTime) setErrors((prev) => ({ ...prev, operationTime: undefined })); }}
                  className="w-full h-10 px-3 rounded-lg border-none bg-slate-50 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                />
                <button
                  onClick={addOperation} disabled={!newOperationName.trim() || !newOperationTime.trim() || isLoading}
                  className="w-full h-10 flex items-center justify-center bg-[#FF6B00] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#E55A00] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleImportExcel} disabled={isLoading} className="flex-1 h-10 flex items-center justify-center bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                <Upload className="h-4 w-4 mr-2" /> Importar
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button disabled={isLoading} className="flex-1 h-10 flex items-center justify-center bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                    <Download className="h-4 w-4 mr-2" /> Exportar
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-[#1C1C1E] rounded-lg shadow-md border border-slate-200 dark:border-white/10 p-2">
                  <DropdownMenuItem onClick={handleExportChartPDF} disabled={operations.length === 0} className="cursor-pointer text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300">
                    <FileImage className="h-4 w-4 mr-2 text-rose-500" /> Exportar Gráfico (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} disabled={operations.length === 0} className="cursor-pointer text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-[#FF6B00]" /> Exportar Dados (Excel)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button onClick={downloadTemplate} disabled={isLoading} className="w-full h-10 flex items-center justify-center bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-[#FF6B00]" /> Baixar Modelo Padrão (Excel)
            </button>

            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl p-5">
              <DraggableOperationsList operations={operations} timeUnit={timeUnit} onReorder={reorderOperations} onRemove={removeOperation} onEdit={editOperation} />
            </div>
          </div>

          {/* COLUNA DIREITA: GRÁFICOS */}
          <div className="xl:w-[60%] flex flex-col gap-6 print:w-full">
            {operations.length > 0 ? (
              <>
                <div className="print:hidden">
                  <CalculationsDashboard operations={operations} timeUnit={timeUnit} taktTime={calculateTaktTime()} taktTimeUnit={timeUnitTakt} demandUnit={demandUnit} />
                </div>

                {/* FRAME DE INTEGRAÇÃO VISUAL */}
                <div id="gbo-chart-container" className="print-canvas bg-white rounded-xl border border-slate-200 dark:border-white/10 p-5 print:border-none print:shadow-none print:p-0">
                  <div className="text-slate-900">
                    <GBOChart operations={operations} timeUnit={timeUnit} taktTime={calculateTaktTime()} taktTimeUnit={timeUnitTakt} demandUnit={demandUnit} />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl print:hidden">
                <div className="p-4 rounded-full bg-slate-50 dark:bg-[#2C2C2E] mb-4">
                  <Plus className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Nenhuma operação adicionada</h3>
                <p className="text-sm text-slate-400 mt-2">Preencha o formulário ao lado para gerar o gráfico</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
