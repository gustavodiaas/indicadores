import { describe, expect, it } from "vitest";
import { SMART_FACTORY_URL, buildSmartFactoryEmail, firstName, gmailUrl, isValidEmail, mailtoUrl } from "./smart-factory";

describe("Smart Factory e-mail", () => {
  const msg = buildSmartFactoryEmail({ nome: "MARIA DE SOUZA", empresa: "Metalúrgica Exemplo Ltda", remetente: "Ana Consultora" });

  it("greets by first name and includes the company, form link and signature", () => {
    expect(firstName("MARIA DE SOUZA")).toBe("Maria");
    expect(msg.subject).toBe("Formulário Smart Factory – Metalúrgica Exemplo Ltda");
    expect(msg.body).toMatch(/^Olá, Maria!/);
    expect(msg.body).toContain("da Metalúrgica Exemplo Ltda");
    expect(msg.body).toContain(SMART_FACTORY_URL);
    expect(msg.body.trim().endsWith("Ana Consultora")).toBe(true);
  });

  it("works without name, company or signature", () => {
    const m = buildSmartFactoryEmail({ nome: "", empresa: "", remetente: "" });
    expect(m.subject).toBe("Formulário Smart Factory");
    expect(m.body).toMatch(/^Olá!/);
    expect(m.body.trim().endsWith("Atenciosamente,")).toBe(true);
  });

  it("builds mailto and Gmail links that round-trip the message", () => {
    const mailto = mailtoUrl("contato@exemplo.com.br", msg);
    expect(mailto.startsWith("mailto:contato%40exemplo.com.br?subject=")).toBe(true);
    expect(decodeURIComponent(mailto.split("body=")[1])).toBe(msg.body);
    const gmail = new URL(gmailUrl("contato@exemplo.com.br", msg));
    expect(gmail.hostname).toBe("mail.google.com");
    expect(gmail.searchParams.get("to")).toBe("contato@exemplo.com.br");
    expect(gmail.searchParams.get("su")).toBe(msg.subject);
    expect(gmail.searchParams.get("body")).toBe(msg.body);
  });

  it("validates e-mails", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("sem-arroba")).toBe(false);
  });
});
