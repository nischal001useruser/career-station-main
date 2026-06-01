import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'


/**
 * Admin Dashboard
 * Main dashboard with stats and navigation
 */

const quickActions = [
  { icon: '✏', title: 'Input Test', description: 'Create a new exam and answer key', accent: 'bg-blue-50 text-blue-700 border-blue-200', path: '/admin/input-test' },
  { icon: '↗', title: 'Input Result', description: 'Enter student answers and scores', accent: 'bg-emerald-50 text-emerald-700 border-emerald-200', path: '/admin/input-result' },
  { icon: '◍', title: 'Manage Students', description: 'Review student profiles and analytics', accent: 'bg-violet-50 text-violet-700 border-violet-200', path: '/admin/students' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboardStats, setDashboardStats] = useState({
    students: 0,
    exams: 0,
    weekTests: 0,
    pendingReports: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardStats = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [studentsResponse, examsResponse, resultsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/students`),
        fetch(`${API_BASE_URL}/exams`),
        fetch(`${API_BASE_URL}/results`),

      ])

      const [studentsData, examsData, resultsData] = await Promise.all([
        studentsResponse.json(),
        examsResponse.json(),
        resultsResponse.json(),
      ])

      if (!studentsResponse.ok) {
        throw new Error(studentsData.message || 'Failed to load students')
      }
      if (!examsResponse.ok) {
        throw new Error(examsData.message || 'Failed to load exams')
      }
      if (!resultsResponse.ok) {
        throw new Error(resultsData.message || 'Failed to load results')
      }

      const studentsCount = Array.isArray(studentsData.data) ? studentsData.data.length : 0
      const examsCount = Array.isArray(examsData.data) ? examsData.data.length : 0
      const resultsCount = Array.isArray(resultsData.data) ? resultsData.data.length : 0

      setDashboardStats({
        students: studentsCount,
        exams: examsCount,
        weekTests: examsCount,
        pendingReports: resultsCount,
      })
    } catch (fetchError) {
      console.error(fetchError)
      setError(fetchError.message || 'Unable to load dashboard stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const overviewStats = [
    { title: 'Total Students', value: isLoading ? '...' : dashboardStats.students, icon: '◍', tone: 'from-blue-600 to-cyan-500', trend: 'Registered learners', description: 'Registered students' },
    { title: 'Total Exams', value: isLoading ? '...' : dashboardStats.exams, icon: '✦', tone: 'from-emerald-500 to-teal-500', trend: 'Exam sessions tracked', description: 'Created exams' },
    { title: 'This Week Tests', value: isLoading ? '...' : dashboardStats.weekTests, icon: '✓', tone: 'from-violet-500 to-fuchsia-500', trend: 'Active test sessions', description: 'Tests this week' },
    { title: 'Pending Reports', value: isLoading ? '...' : dashboardStats.pendingReports, icon: '◌', tone: 'from-amber-500 to-orange-500', trend: 'Results ready for review', description: 'Reports to review' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/20">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Premium Institute Workspace</p>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">Career Station Exam Analytics</h1>
              <p className="mt-2 text-sm text-slate-200 md:text-base">
                Monitor exam creation, student performance, leaderboard outcomes, and weekly reporting from one premium admin dashboard.
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-3 gap-2 rounded-2xl bg-white/5 p-2 text-center text-xs font-semibold text-slate-100">
              <div className="rounded-xl bg-white/10 px-3 py-2">Real-time</div>
              <div className="rounded-xl px-3 py-2 text-slate-300">Structured</div>
              <div className="rounded-xl px-3 py-2 text-slate-300">Clean</div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Performance Focus</p>
              <p className="mt-2 text-lg font-semibold">Result review and analytics</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Reporting</p>
              <p className="mt-2 text-lg font-semibold">Weekly insights ready</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100">Structure</p>
              <p className="mt-2 text-lg font-semibold">Admin workflows</p>
            </div>
          </div>
        </section>

        {error && (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">
            <p className="font-semibold">Dashboard data could not be loaded</p>
            <p className="mt-1 text-sm">{error}</p>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Workflow Actions</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Quick launch area</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700">Three core actions</span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionButton key={action.title} {...action} onClick={() => navigate(action.path)} />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Insights</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Top performance snapshot</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Live preview</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Top performing batch</p>
                    <p className="mt-1 text-xs text-slate-500">Student averages are trending upward across recent panels.</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700">96.4%</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Weekly report readiness</p>
                    <p className="mt-1 text-xs text-slate-500">Teacher feedback, trend charts, and repeated mistake summaries are ready for review.</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-blue-700">On track</span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Leaderboard coverage</p>
                    <p className="mt-1 text-xs text-slate-500">Past results and student analytics stay organized for quick benchmarking.</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-violet-700">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PlaceholderCard title="Recent Exams" description="Latest exam sessions and entry summaries stay organized for fast review." accent="from-blue-600 to-cyan-500" />
          <PlaceholderCard title="Recent Results" description="Recent student submissions and performance snapshots are grouped into clear result moments." accent="from-emerald-500 to-teal-500" />
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, tone, trend, description }) {
  return (
    <div className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-lg font-bold text-white shadow-md`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">{description}</p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{trend}</span>
      </div>
    </div>
  )
}

function QuickActionButton({ icon, title, description, accent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${accent}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/75 text-lg font-bold">{icon}</div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm opacity-80">{description}</p>
    </button>
  )
}

function PlaceholderCard({ title, description, accent }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Section</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${accent}`} />
      </div>
      <p className="text-sm text-slate-500">{description}</p>
      <div className="mt-4 flex min-h-40 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400 ring-1 ring-inset ring-slate-200">
        Refined dashboard placeholder with premium spacing and layout.
      </div>
    </div>
  )
}
