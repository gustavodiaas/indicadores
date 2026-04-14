import { useState } from "react";
import { type GboData, type GboOperation } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

interface Props {
  data: GboData;
  onChange: (d: Partial<GboData>) => void;
}

export function GboModule({ data, onChange }: Props) {
  const [newOpName, setNewOpName] = useState("");
  const [newOpTime, setNewOpTime] = useState("");

  // Motor de Cálculo Takt Time (Convertendo tudo para a unidade base de visualização)
  const calculateTakt = () => {
    if (!data.turnoTempo || !data.demanda) return null;
    let shiftInSeconds = data.turnoUnidade === "hours" ? data.turnoTempo * 3600 : data.turnoTempo * 60;
    let taktInSeconds = shiftInSeconds / data.demanda;
    return data.tempoUnidade === "minutes" ? taktInSeconds / 60 : taktInSeconds;
  };

  const taktTime = calculateTakt();

  // Tratamento do Gráfico
  const maxOperationTime = data.operacoes.length > 0 ? Math.max(...data.operacoes.map(o => o.time)) : 0;
  const yAxisMax = Math.ceil(Math.max(maxOperationTime * 1.1, (taktTime || 0) * 1.1));

  const addOperation = () => {
    if (!newOpName || !newOpTime) return;
    const op: GboOperation = { id: Date.now().toString(), name: newOpName, time: Number(newOpTime) };
    onChange({ operacoes: [...data.operacoes, op] });
    setNewOpName("");
    setNewOpTime("");
  };

  const removeOp = (id: string) => onChange({ operacoes: data.operacoes.filter(o => o.id !== id) });

  return (
    <div className="flex gap-8 h-full">
      {/* Esquerda: Parâmetros e Inserção */}
      <div className="w-[40%] flex flex-col gap-6 overflow-y-auto pr-4 pb-12">
        
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Parâmetros de Takt Time</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Tempo do Turno" value={data.turnoTempo} onChange={v => onChange({ turnoTempo: Number(v) || 0 })} type="number" />
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Unidade Turno</label>
              <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={data.turnoUnidade} onChange={e => onChange({ turnoUnidade: e.target.value as any })}>
                <option value="hours">Horas</option>
                <option value="minutes">Minutos</option>
              </select>
            </div>
            <InputField label={`Demanda (${data.demandaUnidade}/dia)`} value={data.demanda} onChange={v => onChange({ demanda: Number(v) || 0 })} type="number" />
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Un. Gráfico</label>
              <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none" value={data.tempoUnidade} onChange={e => onChange({ tempoUnidade: e.target.value as any })}>
                <option value="seconds">Segundos</option>
                <option value="minutes">Minutos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 text-lg">Operações do Processo</h3>
          <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1"><InputField label="Nome da Operação" value={newOpName} onChange={setNewOpName} /></div>
            <div className="w-24"><InputField label={`Tempo (${data.tempoUnidade === 'seconds' ? 's' : 'min'})`} value={newOpTime} onChange={setNewOpTime} type="number" /></div>
            <button onClick={addOperation} className="h-10 px-4 bg-blue-600 text-white rounded-md font-bold text-xs uppercase shadow-md active:scale-95">Add</button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {data.operacoes.map(op => (
              <div key={op.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <GripVertical className="h-4 w-4 text-slate-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-700">{op.name}</p>
                  <p className="text-xs text-slate-500">{op.time.toFixed(1)} {data.tempoUnidade}</p>
                </div>
                <button onClick={() => removeOp(op.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {data.operacoes.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">Nenhuma operação adicionada.</p>}
          </div>
        </div>
      </div>

      {/* Direita: Dashboard e Yamazumi */}
      <div className="w-[60%] flex flex-col gap-6 overflow-y-auto pb-12">
        {taktTime ? (
          <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Takt Time Calculado</h4>
              <p className="text-3xl font-black text-white">{taktTime.toFixed(2)} <span className="text-sm font-normal text-slate-400">{data.tempoUnidade}/un</span></p>
            </div>
            {data.operacoes.some(o => o.time > taktTime) && (
              <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-bold">Gargalo Detectado</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500 text-sm italic">
            Preencha o Turno e a Demanda para visualizar o Takt Time.
          </div>
        )}

        {/* GRÁFICO GBO */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b pb-2">Balanceamento Operacional</h4>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.operacoes} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fill: '#64748b', fontSize: 11 }} tickMargin={10} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, yAxisMax]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                
                {taktTime && <ReferenceLine y={taktTime} stroke="#0f172a" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'TAKT', fill: '#0f172a', fontSize: 10, fontWeight: 'bold' }} />}
                
                <Bar dataKey="time" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {data.operacoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={taktTime && entry.time > taktTime ? "#ef4444" : "#2563eb"} className="transition-all duration-300 hover:opacity-80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
