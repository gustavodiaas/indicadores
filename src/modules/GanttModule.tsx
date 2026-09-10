export function GanttModule() {
  return (
    <div className="w-full h-[calc(100vh-6rem)] overflow-hidden rounded-2xl">
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 bg-transparent"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
