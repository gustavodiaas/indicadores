export function GanttModule() {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-16 overflow-hidden p-3 bg-[#F5F5F7] dark:bg-[#0B0B0F]">
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 bg-transparent rounded-[20px] shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_22px_56px_rgba(0,0,0,0.24)]"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
