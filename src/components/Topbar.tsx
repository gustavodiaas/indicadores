import { Download, Upload, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
  onPDF: () => void;
}

export function Topbar({ onExport, onImport, onPDF }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold">Consultoria de Manufatura Enxuta</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1.5" /> Exportar JSON
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 mr-1.5" /> Importar JSON
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }} />
        <Button size="sm" onClick={onPDF}>
          <FileDown className="h-4 w-4 mr-1.5" /> Gerar PDF
        </Button>
      </div>
    </header>
  );
}
