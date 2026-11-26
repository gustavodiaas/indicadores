// Foto do mapa do Estado Atual do MFV, pedida ao MFV que fica carregado (escondido) dentro do app.

export interface MfvMapImage {
  dataUrl: string;
  data: Uint8Array;
  width: number;
  height: number;
}

export type MfvCaptureResult =
  | { status: "ok"; image: MfvMapImage }
  | { status: "empty" }
  | { status: "unavailable"; error?: string };

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const mfvFrame = () => document.querySelector<HTMLIFrameElement>('iframe[src="/mfv/index.html"]');

/** Pede a foto ao MFV; repete o pedido enquanto o MFV ainda está carregando. */
export function captureMfvCurrentMap(timeoutMs = 20000): Promise<MfvCaptureResult> {
  return new Promise(resolve => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let done = false;
    const finish = (result: MfvCaptureResult) => {
      if (done) return;
      done = true;
      window.removeEventListener("message", onMessage);
      clearInterval(retry);
      clearTimeout(timer);
      resolve(result);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "mfv-capture-result" || event.data.requestId !== requestId) return;
      const { status, dataUrl, width, height, error } = event.data;
      if (status === "ok" && typeof dataUrl === "string") finish({ status: "ok", image: { dataUrl, data: dataUrlToBytes(dataUrl), width, height } });
      else if (status === "empty") finish({ status: "empty" });
      else finish({ status: "unavailable", error });
    };
    const ask = () => mfvFrame()?.contentWindow?.postMessage({ type: "mfv-capture-current", requestId }, window.location.origin);
    window.addEventListener("message", onMessage);
    const retry = setInterval(ask, 1500);
    const timer = setTimeout(() => finish({ status: "unavailable", error: "O MFV não respondeu." }), timeoutMs);
    ask();
  });
}
