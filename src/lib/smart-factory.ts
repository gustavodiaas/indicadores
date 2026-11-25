// Convite por e-mail para o cliente preencher o Formulário Smart Factory (B+P Smart Factory).

export const SMART_FACTORY_URL =
  "https://script.google.com/macros/s/AKfycby_RZOtXubpA3zXRIvPLv5ctkKwyVOsrf6EUCxaNjQDiwEJBpO-B8WMnxVBiaeQNdmj/exec";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());

/** "JOÃO DA SILVA" → "João" */
export function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first ? first.charAt(0).toLocaleUpperCase("pt-BR") + first.slice(1).toLocaleLowerCase("pt-BR") : "";
}

export interface SmartFactoryEmail {
  subject: string;
  body: string;
}

export function buildSmartFactoryEmail({ nome, empresa, remetente }: { nome: string; empresa: string; remetente: string }): SmartFactoryEmail {
  const saudacao = firstName(nome) ? `Olá, ${firstName(nome)}!` : "Olá!";
  const daEmpresa = empresa.trim() ? `da ${empresa.trim()}` : "da sua empresa";
  const subject = `Formulário Smart Factory${empresa.trim() ? ` – ${empresa.trim()}` : ""}`;
  const body = [
    saudacao,
    "",
    `Como parte do atendimento do Programa Brasil Mais Produtivo, pedimos o preenchimento do Formulário Smart Factory ${daEmpresa}.`,
    "",
    "O formulário identifica os principais desafios da empresa e ajuda a recomendar tecnologias de transformação digital.",
    "",
    `Acesse: ${SMART_FACTORY_URL}`,
    "",
    "Qualquer dúvida, estou à disposição.",
    "",
    "Atenciosamente,",
    ...(remetente.trim() ? [remetente.trim()] : []),
  ].join("\n");
  return { subject, body };
}

/** Abre o aplicativo de e-mail padrão do computador (Outlook, Mail…). */
export function mailtoUrl(to: string, { subject, body }: SmartFactoryEmail): string {
  return `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Abre a tela "Escrever" do Gmail no navegador, já preenchida. */
export function gmailUrl(to: string, { subject, body }: SmartFactoryEmail): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: to.trim(), su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
