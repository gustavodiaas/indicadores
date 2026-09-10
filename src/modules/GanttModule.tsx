export function GanttModule() {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-16 overflow-hidden">
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 bg-transparent"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
