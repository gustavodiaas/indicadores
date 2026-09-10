export function GanttModule() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-6rem)]">
      <iframe
        src="/gantt/index.html"
        className="w-full h-full min-h-[calc(100vh-6rem)] border-0 rounded-2xl bg-transparent"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
