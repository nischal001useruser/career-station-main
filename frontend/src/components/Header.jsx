export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Institute Overview</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Career Station Exam Analytics</h1>
          <p className="text-sm text-slate-500">Professional institute insights across exams, students, and performance trends.</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">AD</span>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">Admin Director</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Live view</p>
          </div>
        </div>
      </div>
    </header>
  )
}
