export function GanttModule() {
  return (
    <div className="w-full h-full" style={{ height: "calc(100vh - 120px)" }}>
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 rounded-xl"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
