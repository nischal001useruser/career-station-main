export default function Dashboard() {
  const stats = [
    { title: 'Total Exams', value: '0', icon: '✦', tone: 'bg-blue-600', detail: 'Institution-wide assessment count' },
    { title: 'Total Students', value: '0', icon: '◍', tone: 'bg-emerald-600', detail: 'Students tracked across classes' },
    { title: 'Average Score', value: '0%', icon: '↗', tone: 'bg-violet-600', detail: 'Performance average across data' },
    { title: 'Pass Rate', value: '0%', icon: '✓', tone: 'bg-amber-500', detail: 'Passing rate across sessions' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Analytics Overview</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Career Station Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">Clean institute-level analytics with polished cards, spacing, and reporting focus.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Premium layout</div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.title} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-3 text-4xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white ${stat.tone}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Performance Chart</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Exam Performance</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Placeholder</span>
            </div>
            <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400 ring-1 ring-inset ring-slate-200">
              Chart placeholder with polished presentation.
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Distribution</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Student Distribution</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Placeholder</span>
            </div>
            <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400 ring-1 ring-inset ring-slate-200">
              Distribution placeholder with refined card spacing.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
