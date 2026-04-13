import { useState } from "react";
import {
  type ResumoData, type AppState, type Acao5W2H,
  calcProdutividade, calcPayback, calcMovimentacao,
  calcQualidade, calcDisponibilidade, calcLeadTime, calcArea
} from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ResumoData;
  state: AppState;
  onChange: (d: Partial<ResumoData>) => void;
}

function generateTexto(state: AppState): string {
  const prod = calcProdutividade(state.produtividade);
  const pb = calcPayback(state.payback, state.produtividade);
  const mov = calcMovimentacao(state.movimentacao);
  const qual = calcQualidade(state.qualidade);
  const disp = calcDisponibilidade(state.disponibilidade);
  const lt = calcLeadTime(state.leadtime);
  const ar = calcArea(state.area);

  const lines: string[] = [];
  if (state.resumo.nomeEmpresa) lines.push(`Empresa: ${state.resumo.nomeEmpresa} — ${state.resumo.cidade}`);
  if (state.resumo.ramo) lines.push(`Ramo: ${state.resumo.ramo} | Turnos: ${state.resumo.turnos}`);
  if (state.resumo.ferramentas) lines.push(`Ferramentas Aplicadas: ${state.resumo.ferramentas}`);
  lines.push("");
  lines.push("KPIs Alcançados:");
  if (prod.ganho) lines.push(`• Produtividade: ganho de ${prod.ganho.toFixed(1)}%`);
  if (pb.reducaoMensal) lines.push(`• Payback: ${pb.paybackMeses.toFixed(1)} meses (economia de R$ ${pb.reducaoMensal.toLocaleString("pt-BR")}/mês)`);
  if (mov.reducaoDist) lines.push(`• Movimentação: redução de ${mov.reducaoDist.toFixed(1)}% em distância`);
  if (qual.aumento) lines.push(`• Qualidade: aumento de ${qual.aumento.toFixed(1)} p.p.`);
  if (disp.aumento) lines.push(`• Disponibilidade: aumento de ${disp.aumento.toFixed(1)} p.p.`);
  if (lt.reducao) lines.push(`• Lead Time: redução de ${lt.reducao.toFixed(1)}%`);
  if (ar.reducaoArea) lines.push(`• Área: redução de ${ar.reducaoArea.toFixed(1)}% (economia R$ ${ar.economiaMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês)`);

  return lines.join("\n");
}

export function ResumoModule({ data, state, onChange }: Props) {
  const [newAcao, setNewAcao] = useState<Partial<Acao5W2H>>({});
  const texto = generateTexto(state);

  const addAcao = () => {
    const a: Acao5W2H = {
      id: Date.now().toString(),
      what: newAcao.what || "",
      why: newAcao.why || "",
      where: newAcao.where || "",
      when: newAcao.when || "",
      who: newAcao.who || "",
      how: newAcao.how || "",
      howMuch: newAcao.howMuch || "",
    };
    onChange({ acoes: [...data.acoes, a] });
    setNewAcao({});
  };

  const removeAcao = (id: string) => {
    onChange({ acoes: data.acoes.filter(a => a.id !== id) });
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5 overflow-y-auto">
        <h3 className="section-title">Resumo Executivo</h3>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Nome da Empresa" value={data.nomeEmpresa} onChange={v => onChange({ nomeEmpresa: v })} type="text" />
          <InputField label="Cidade" value={data.cidade} onChange={v => onChange({ cidade: v })} type="text" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <InputField label="Ramo" value={data.ramo} onChange={v => onChange({ ramo: v })} type="text" />
          <InputField label="Turnos" value={data.turnos} onChange={v => onChange({ turnos: Number(v) || 1 })} />
          <InputField label="Processos" value={data.processos} onChange={v => onChange({ processos: v })} type="text" />
        </div>
        <InputField label="Ferramentas Aplicadas" value={data.ferramentas} onChange={v => onChange({ ferramentas: v })} type="text" placeholder="5S, VSM, Kanban, SMED..." />

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Plano de Ação (5W2H)</h4>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {(["what", "why", "where", "when", "who", "how", "howMuch"] as const).map(k => (
              <div key={k} className="input-group">
                <Label className="text-xs text-muted-foreground capitalize">{k === "howMuch" ? "How Much" : k.charAt(0).toUpperCase() + k.slice(1)}</Label>
                <Input className="h-8 text-xs" value={newAcao[k] || ""} onChange={e => setNewAcao(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="flex items-end">
              <Button size="sm" onClick={addAcao} className="h-8"><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
            </div>
          </div>

          {data.acoes.length > 0 && (
            <div className="space-y-2 mt-3">
              {data.acoes.map(a => (
                <div key={a.id} className="flex items-start gap-2 p-2 rounded border bg-muted/30 text-xs">
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    <span><b>O quê:</b> {a.what}</span>
                    <span><b>Por quê:</b> {a.why}</span>
                    <span><b>Onde:</b> {a.where}</span>
                    <span><b>Quando:</b> {a.when}</span>
                    <span><b>Quem:</b> {a.who}</span>
                    <span><b>Como:</b> {a.how}</span>
                    <span><b>Quanto:</b> {a.howMuch}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeAcao(a.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Texto Consolidado</h3>
        <div className="kpi-card">
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
        </div>
      </div>
    </div>
  );
}
