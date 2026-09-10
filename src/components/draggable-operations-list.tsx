"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, Trash2, Pencil, Check, X } from "lucide-react"

interface Operation {
  id: string
  name: string
  time: number
  unit: "minutes" | "seconds"
}

interface DraggableOperationsListProps {
  operations: Operation[]
  timeUnit: "minutes" | "seconds"
  onReorder: (operations: Operation[]) => void
  onRemove: (id: string) => void
  onEdit?: (id: string, name: string, time: number) => void
}

export function DraggableOperationsList({
  operations,
  timeUnit,
  onReorder,
  onRemove,
  onEdit,
}: DraggableOperationsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editTime, setEditTime] = useState("")

  const getPtUnit = (u: string) => {
    if (u === "seconds") return "segundos"
    if (u === "minutes") return "minutos"
    return u
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newOperations = [...operations]
    const draggedOp = newOperations[draggedIndex]
    newOperations.splice(draggedIndex, 1)
    newOperations.splice(index, 0, draggedOp)

    onReorder(newOperations)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  const startEditing = (op: Operation) => {
    setEditingId(op.id)
    setEditName(op.name)
    setEditTime(op.time.toString())
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName("")
    setEditTime("")
  }

  const saveEditing = (id: string) => {
    const time = parseFloat(editTime)
    if (!editName.trim() || isNaN(time) || time < 0) return

    if (onEdit) {
      onEdit(id, editName.trim(), time)
    }
    setEditingId(null)
  }

  if (operations.length === 0) return null

  return (
    <div className="space-y-2 mt-6">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
        Operações Adicionadas ({operations.length})
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {operations.map((op, index) => (
          <div
            key={op.id}
            draggable={editingId !== op.id} 
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/10 rounded-lg transition-all ${
              draggedIndex === index ? "opacity-50 border-[#002D72]" : "hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div className={`p-1 text-slate-400 dark:text-slate-600 ${editingId === op.id ? "opacity-30" : "cursor-grab active:cursor-grabbing hover:text-slate-600 dark:hover:text-slate-400"}`}>
              <GripVertical className="h-4 w-4" />
            </div>
            
            <div className="flex-1 flex items-center justify-between min-w-0">
              {editingId === op.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="h-8 text-sm bg-white dark:bg-[#2C2C2E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100" 
                    placeholder="Nome"
                    autoFocus
                  />
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)} 
                    className="h-8 w-20 text-sm bg-white dark:bg-[#2C2C2E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100" 
                    placeholder="Tempo"
                    onKeyDown={(e) => e.key === 'Enter' && saveEditing(op.id)}
                  />
                </div>
              ) : (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{op.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {op.time.toFixed(1)} {getPtUnit(op.unit)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 ml-2">
                {editingId === op.id ? (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10" onClick={() => saveEditing(op.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-500 hover:bg-rose-500/10" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-[#002D72] hover:bg-[#002D72]/10" onClick={() => startEditing(op)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10" onClick={() => onRemove(op.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
