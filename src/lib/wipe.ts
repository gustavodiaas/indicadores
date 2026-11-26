// "Apagar dados": remove o projeto e os arquivos carregados deste navegador.
// A limpeza roda no início do carregamento da página, antes do app, do Gantt e do MFV abrirem,
// para nenhum deles regravar dados ou segurar o banco aberto durante a exclusão.

const FLAG = "lean-wipe-pending";

/** Dados de projeto no localStorage (app, MFV e Gantt). Tema e login da nuvem do MFV ficam. */
export const WIPE_KEYS = [
  "consultoria-lean-state",
  "consultoria-lean-module",
  "mfv-canvas:v5", "mfv-canvas:v4", "mfv-canvas:v3", "mfv-canvas:v2", "mfv-simulation:v2", "mfv-live-order:v1",
  "exata.trabalhoPadronizado.v1", "exata.trabalhoPadronizado.videoPositions", "exata.trabalhoPadronizado.activeVideo",
];

/** Arquivos carregados (IndexedDB): modelo do relatório, projetos do MFV e vídeos do Gantt. */
export const WIPE_DATABASES = ["central-indicadores", "mfv-projects", "exata.trabalhoPadronizado.videos"];

function deleteDatabase(name: string): Promise<void> {
  return new Promise(resolve => {
    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}

/** Marca a limpeza e recarrega a página; a exclusão acontece em runPendingWipe(). */
export async function requestWipe() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    await wipeNow(); // sem sessionStorage: limpa agora mesmo
  }
  location.reload();
}

async function wipeNow() {
  for (const key of WIPE_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignora */ }
  }
  await Promise.all(WIPE_DATABASES.map(deleteDatabase));
}

/** Executa a limpeza pedida antes do recarregamento. Retorna true se apagou algo. */
export async function runPendingWipe(): Promise<boolean> {
  let pending = false;
  try { pending = sessionStorage.getItem(FLAG) === "1"; } catch { pending = false; }
  if (!pending) return false;
  await wipeNow();
  try { sessionStorage.removeItem(FLAG); } catch { /* ignora */ }
  return true;
}
