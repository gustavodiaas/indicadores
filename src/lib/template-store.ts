// Guarda no navegador (IndexedDB) a versão do relatório que o consultor carregou,
// para não precisar carregar de novo a cada projeto. Nada sai do computador.

export interface StoredTemplate {
  name: string;
  savedAt: string;
  data: ArrayBuffer;
}

const DB = "central-indicadores";
const STORE = "modelos";
const KEY = "relatorio-atendimento";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

export const loadTemplate = () => run<StoredTemplate | undefined>("readonly", s => s.get(KEY)).catch(() => undefined);
export const saveTemplate = (t: StoredTemplate) => run<unknown>("readwrite", s => s.put(t, KEY));
export const deleteTemplate = () => run<unknown>("readwrite", s => s.delete(KEY));
