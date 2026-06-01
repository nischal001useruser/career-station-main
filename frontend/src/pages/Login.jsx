/**
 * Admin Login Page
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(username, password)

    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_20%),linear-gradient(180deg,#f8fbff_0%,#e2e8f0_100%)] px-4 py-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/20 md:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-slate-950">
            CS
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Admin Access</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Career Station</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
            A premium educational analytics workspace designed for institute-grade exam review, student insights, and weekly reporting.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Insights</p>
              <p className="mt-2 text-lg font-semibold">Detailed performance tracking</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Reporting</p>
              <p className="mt-2 text-lg font-semibold">Weekly report-ready review</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-300/50 backdrop-blur md:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Secure access</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your credentials to access the institute dashboard.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
