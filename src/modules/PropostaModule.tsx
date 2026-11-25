import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ExternalLink, FileUp, Loader2, AlertTriangle, Mail, MessageCircle, ShieldCheck, Wand2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buildSmartFactoryEmail, gmailUrl, isValidEmail, mailtoUrl } from "@/lib/smart-factory";
import type { AppState } from "@/store/useAppStore";
import { camposEncontrados, emptyProposta, extractPdfText, parseProposta, whatsappUrl, type PropostaData } from "@/lib/proposta-parser";
import { buildFillItems, buildPatches, defaultSelection, type FillModule } from "@/lib/proposta-fill";

interface Props {
  data: PropostaData;
  state: AppState;
  onChange: (d: Partial<PropostaData>) => void;
  onApply: (patches: { [K in FillModule]?: Partial<AppState[K]> }) => void;
}

const objetoLabel = { manufatura: "Consultoria em Manufatura Enxuta", energia: "Consultoria em Eficiência Energética", "": "—" } as const;
const porteLabel = { micro: "Microempresa", pequena: "Pequena empresa", "": "—" } as const;

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-100 break-words">{value || "—"}</dd>
    </div>
  );
}

function WhatsAppButton({ phone, name }: { phone: string; name: string }) {
  const url = whatsappUrl(phone);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir conversa no WhatsApp com ${name || phone}`}
      className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors">
      <MessageCircle className="h-3.5 w-3.5" /> Abrir no WhatsApp
    </a>
  );
}

function SmartFactoryButton({ email, name, empresa, remetente }: { email: string; name: string; empresa: string; remetente: string }) {
  if (!isValidEmail(email)) return null;
  const msg = buildSmartFactoryEmail({ nome: name, empresa, remetente });
  const item = "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md cursor-pointer text-slate-700 dark:text-slate-200 outline-none focus:bg-black/[0.05] dark:focus:bg-white/10";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={`Enviar o Formulário Smart Factory para ${name || email}`}
          className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors">
          <Mail className="h-3.5 w-3.5" /> Enviar Formulário Smart Factory <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[2000] min-w-[220px] p-1">
        <DropdownMenuItem asChild className={item}>
          <a href={gmailUrl(email, msg)} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Abrir no Gmail</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={item}>
          <a href={mailtoUrl(email, msg)}><Mail className="h-3.5 w-3.5" /> Abrir no Outlook / app de e-mail</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="input-section space-y-4">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-200 dark:border-white/10 pb-2">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
    </div>
  );
}

export function PropostaModule({ data, state, onChange, onApply }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "error">("idle");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [applied, setApplied] = useState(0);
  const hasData = Boolean(data.importadoEm);

  const items = useMemo(() => (hasData ? buildFillItems(data, state) : []), [data, state, hasData]);
  const [selected, setSelected] = useState<Set<string>>(() => defaultSelection(items));
  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const readFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setError("Envie a proposta em PDF.");
      return;
    }
    setStatus("reading");
    setError("");
    setApplied(0);
    try {
      const text = await extractPdfText(await file.arrayBuffer());
      const parsed = parseProposta(text);
      if (camposEncontrados(parsed) < 3) {
        setStatus("error");
        setError("Não reconheci os dados deste PDF. A leitura funciona com a Proposta Comercial do Brasil Mais Produtivo (SENAI/SEBRAE) gerada pelo sistema, não com PDFs escaneados.");
        return;
      }
      const next = { ...parsed, arquivo: file.name, importadoEm: new Date().toISOString() };
      onChange(next);
      setSelected(defaultSelection(buildFillItems(next, state)));
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Não foi possível abrir este PDF. Verifique se o arquivo não está protegido por senha ou corrompido.");
    }
  };

  const apply = () => {
    const { patches, count } = buildPatches(items, selected, state);
    onApply(patches);
    setApplied(count);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f); }}
        className={`input-section flex flex-col items-center justify-center gap-3 text-center py-10 border-2 border-dashed transition-colors ${dragging ? "border-[#1D4ED8] bg-blue-50/60 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}
      >
        {status === "reading" ? <Loader2 className="h-9 w-9 animate-spin text-[#1D4ED8] dark:text-[#60A5FA]" /> : <FileUp className="h-9 w-9 text-[#1D4ED8] dark:text-[#60A5FA]" />}
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {status === "reading" ? "Lendo a proposta…" : hasData ? "Enviar outra proposta" : "Arraste aqui o PDF da Proposta Comercial"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Modelo do Programa Brasil Mais Produtivo (SENAI/SEBRAE)</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "reading"}
          className="h-9 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-60 transition-colors"
        >
          Selecionar PDF
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" aria-label="Arquivo da proposta em PDF"
          onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" /> O PDF é lido no seu navegador e não é enviado para nenhum servidor. CPFs não são guardados.
        </p>
      </div>

      {status === "error" && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {hasData && (
        <>
          <div className="input-section space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">Preencher módulos</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{data.arquivo}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Marque o que deve ser preenchido. Campos que já têm outro valor ficam desmarcados para não sobrescrever o que você digitou.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    <th className="w-8 py-2"></th>
                    <th className="py-2 pr-3">Módulo</th>
                    <th className="py-2 pr-3">Campo</th>
                    <th className="py-2 pr-3">Valor da proposta</th>
                    <th className="py-2">Valor atual</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const conflito = item.atual.trim() && item.atual.trim() !== item.novo.trim();
                    return (
                      <tr key={item.id} className="border-t border-slate-100 dark:border-white/5 align-top">
                        <td className="py-2.5">
                          <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)}
                            aria-label={`Preencher ${item.campo} (${item.moduloLabel})`} className="h-4 w-4 accent-[#1D4ED8]" />
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-200">{item.moduloLabel}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{item.campo}</td>
                        <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-100">{item.novo}</td>
                        <td className={`py-2.5 ${conflito ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}>
                          {item.atual || "vazio"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="button" onClick={apply} disabled={selected.size === 0}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-50 transition-colors">
                <Wand2 className="h-4 w-4" /> Preencher {selected.size} {selected.size === 1 ? "campo" : "campos"}
              </button>
              {applied > 0 && (
                <span role="status" className="inline-flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400">
                  <CheckCircle2 className="h-4 w-4" /> {applied} {applied === 1 ? "campo preenchido" : "campos preenchidos"}.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Section title="Proposta">
              <Info label="Nº da proposta" value={data.numero} />
              <Info label="Objeto" value={objetoLabel[data.objeto]} />
              <Info label="Data de emissão" value={data.dataEmissao} />
              <Info label="Validade" value={data.validade} />
              <Info label="Prazo de execução" value={data.prazoDias ? `${data.prazoDias} dias` : ""} />
              <Info label="Meta do programa" value={data.metaPercentual ? `${data.objeto === "energia" ? "−" : "+"}${data.metaPercentual}% ${data.objeto === "energia" ? "de consumo de energia" : "de produtividade"}` : ""} />
              <Info label="Unidade SENAI" value={data.unidadeSenai} />
              <Info label="Contato SENAI" value={[data.contatoSenai, data.contatoSenaiTelefone, data.contatoSenaiEmail].filter(Boolean).join(" · ")} />
            </Section>
            <Section title="Cliente">
              <Info label="Razão social" value={data.razaoSocial} />
              <Info label="CNPJ" value={data.cnpj} />
              <Info label="CNAE" value={data.cnae} />
              <Info label="Porte" value={porteLabel[data.porte]} />
              <Info label="Funcionários" value={data.funcionarios} />
              <Info label="Cidade" value={[data.cidade, data.uf].filter(Boolean).join(" / ")} />
              <div className="sm:col-span-2"><Info label="Segmento" value={data.segmento} /></div>
              <div className="sm:col-span-2"><Info label="Endereço" value={data.endereco} /></div>
            </Section>
            <Section title="Responsável legal">
              <Info label="Nome" value={data.responsavelLegal} />
              <Info label="Cargo" value={data.responsavelCargo} />
              <div className="min-w-0">
                <Info label="Telefone" value={data.responsavelTelefone} />
                <WhatsAppButton phone={data.responsavelTelefone} name={data.responsavelLegal} />
              </div>
              <div className="min-w-0">
                <Info label="E-mail" value={data.responsavelEmail} />
                <SmartFactoryButton email={data.responsavelEmail} name={data.responsavelLegal} empresa={data.razaoSocial} remetente="" />
              </div>
            </Section>
            <Section title="Acompanhamento do atendimento">
              <Info label="Nome" value={data.acompanhamentoNome} />
              <Info label="Setor" value={data.acompanhamentoSetor} />
              <div className="min-w-0">
                <Info label="Telefone" value={data.acompanhamentoTelefone} />
                <WhatsAppButton phone={data.acompanhamentoTelefone} name={data.acompanhamentoNome} />
              </div>
              <div className="min-w-0">
                <Info label="E-mail" value={data.acompanhamentoEmail} />
                <SmartFactoryButton email={data.acompanhamentoEmail} name={data.acompanhamentoNome} empresa={data.razaoSocial} remetente="" />
              </div>
            </Section>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => { onChange(emptyProposta); setApplied(0); }}
              className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              Remover dados da proposta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
