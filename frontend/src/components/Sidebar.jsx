import { useState } from 'react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { icon: '◉', label: 'Dashboard', href: '#' },
    { icon: '✦', label: 'Exams', href: '#' },
    { icon: '◍', label: 'Students', href: '#' },
    { icon: '↗', label: 'Analytics', href: '#' },
    { icon: '⚙', label: 'Settings', href: '#' },
  ]

  return (
    <aside className={`border-r border-slate-200 bg-white/90 backdrop-blur transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} `}>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
              CS
            </div>
            {isOpen && (
              <div>
                <p className="text-sm font-semibold text-slate-900">Career Station</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Analytics</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {isOpen ? '⟨' : '⟩'}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {isOpen ? 'Premium institute analytics • v1.0.0' : 'v1'}
        </div>
      </div>
    </aside>
  )
}
