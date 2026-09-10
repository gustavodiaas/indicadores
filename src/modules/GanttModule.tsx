interface GanttModuleProps {
  active: boolean;
}

export function GanttModule({ active }: GanttModuleProps) {
  return (
    <div className={`fixed top-0 right-0 bottom-0 left-[72px] overflow-hidden p-3 bg-[#F5F5F7] dark:bg-[#0B0B0F] transition-opacity duration-150 ${active ? "opacity-100 visible z-40" : "opacity-0 invisible pointer-events-none -z-10"}`}>
      <iframe
        src="/gantt/index.html"
        className="w-full h-full border-0 bg-transparent rounded-[20px] shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_22px_56px_rgba(0,0,0,0.24)]"
        title="Trabalho Padronizado - Gantt"
        allow="fullscreen"
      />
    </div>
  );
}
