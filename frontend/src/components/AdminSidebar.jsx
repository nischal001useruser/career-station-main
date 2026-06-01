/**
 * Admin Dashboard Sidebar Navigation
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, admin } = useAuth()

  const menuItems = [
    { icon: '◉', label: 'Dashboard', path: '/admin/dashboard' },
    { icon: '✦', label: 'Input Test', path: '/admin/input-test' },
    { icon: '↗', label: 'Input Result', path: '/admin/input-result' },
    { icon: '↗', label: 'View Past Results', path: '/admin/past-results' },
    { icon: '◌', label: 'Weekly Reports', path: '/admin/weekly-reports' },
    { icon: '◍', label: 'Students', path: '/admin/students' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <aside className={`bg-slate-950 text-white transition-all duration-300 ${isOpen ? 'w-full md:w-72' : 'w-full md:w-20'} flex flex-col h-full flex-1 border-b md:border-b-0 md:border-r border-slate-800`}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-slate-950">
              CS
            </div>
            {isOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">Career Station</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Exam Analytics</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg border border-slate-700 px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            {isOpen ? '⟨' : '⟩'}
          </button>
        </div>
      </div>

      {isOpen && admin && (
        <div className="mx-3 mt-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-blue-200">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{admin.username}</p>
          <p className="mt-1 text-[11px] text-blue-100/80">Administrator workspace</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-5 space-y-2">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${isActive(item.path) ? 'bg-white/15 text-white' : 'bg-slate-800 text-blue-200'}`}>
              {item.icon}
            </span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-300 transition hover:bg-rose-600/90 hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sm">↩</span>
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {isOpen && (
        <div className="px-3 pb-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
          Premium institute analytics • v1.0.0
        </div>
      )}
    </aside>
  )
}
