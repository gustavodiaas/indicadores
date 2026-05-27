"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Layers, Activity, AlertTriangle, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Operation {
  id: string
  name: string
  time: number
  unit: "minutes" | "seconds"
}

interface CalculationsDashboardProps {
  operations: Operation[]
  timeUnit: "minutes" | "seconds"
  taktTime?: number
  taktTimeUnit?: "minutes" | "seconds" | "hours"
  demandUnit?: string
}

export function CalculationsDashboard({
  operations,
  timeUnit,
  taktTime,
  taktTimeUnit,
  demandUnit = "peças",
}: CalculationsDashboardProps) {
  if (!operations.length) return null

  const getPtUnit = (u: string) => {
    if (u === "seconds") return "segundos"
    if (u === "minutes") return "minutos"
    if (u === "hours") return "horas"
    return u
  }

  const convertToSeconds = (time: number, unit: "minutes" | "seconds") => (unit === "minutes" ? time * 60 : time)
  const convertFromSeconds = (timeSec: number, targetUnit: "minutes" | "seconds") =>
    targetUnit === "minutes" ? timeSec / 60 : timeSec

  const opsInSec = operations.map((op) => ({
    ...op,
    timeSec: convertToSeconds(op.time, op.unit),
  }))

  const totalTimeSec = opsInSec.reduce((acc, op) => acc + op.timeSec, 0)
  const totalTime = convertFromSeconds(totalTimeSec, timeUnit)
  const avgTime = totalTime / operations.length

  const maxSec = Math.max(...opsInSec.map((o) => o.timeSec))
  const bottleneck = opsInSec.find((o) => o.timeSec === maxSec)
  const bottleneckTime = bottleneck ? convertFromSeconds(bottleneck.timeSec, timeUnit) : 0

  const taktTimeInDisplayUnit = taktTime ? convertFromSeconds(taktTime, timeUnit) : undefined

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tempo Total */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{totalTime.toFixed(1)}</div>
            <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              {getPtUnit(timeUnit)}
            </Badge>
          </CardContent>
        </Card>

        {/* Número de Operações */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operações</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{operations.length}</div>
            <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              Etapas
            </Badge>
          </CardContent>
        </Card>

        {/* Tempo Médio */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tempo Médio</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{avgTime.toFixed(1)}</div>
            <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              {getPtUnit(timeUnit)}
            </Badge>
          </CardContent>
        </Card>

        {/* Operação Gargalo */}
        <Card className="bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider animate-pulse">Gargalo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent className="relative z-10 w-full overflow-hidden">
            <div className="text-xl md:text-2xl font-bold text-rose-600 dark:text-rose-400 drop-shadow-sm truncate max-w-full" title={bottleneck?.name}>
              {bottleneck?.name || "-"}
            </div>
            <Badge variant="outline" className="mt-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 text-[10px] uppercase tracking-wider">
              {bottleneckTime.toFixed(1)} {getPtUnit(timeUnit)}
            </Badge>
          </CardContent>
        </Card>

        {/* Takt Time */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Takt Time</CardTitle>
            <Timer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">
              {taktTimeInDisplayUnit ? taktTimeInDisplayUnit.toFixed(1) : "-"}
            </div>
            <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              {getPtUnit(timeUnit)} / un
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
