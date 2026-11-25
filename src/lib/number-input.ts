import { useEffect, useState } from "react";

/**
 * Texto inicial de um campo numérico: zero (ou vazio) aparece em branco, para o usuário
 * não precisar apagar o "0" antes de digitar. Outros valores mantêm as casas decimais como estão.
 */
export function blankZero(v: number | undefined | null): string {
  if (v === undefined || v === null || Number.isNaN(v) || v === 0) return "";
  return v.toString().replace(".", ",");
}

/**
 * Estado local de um campo numérico controlado: mostra vazio quando o valor é zero e
 * não apaga o que está sendo digitado (ex.: "0." antes de "0.5").
 */
export function useBlankZeroText(value: number | undefined | null) {
  const toText = (v: number | undefined | null) => (v ? String(v) : "");
  const [text, setText] = useState(() => toText(value));
  useEffect(() => {
    if ((Number(text) || 0) !== (Number(value) || 0)) setText(toText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return [text, setText] as const;
}
