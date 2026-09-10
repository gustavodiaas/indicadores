export function GanttModule() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 bg-transparent"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
