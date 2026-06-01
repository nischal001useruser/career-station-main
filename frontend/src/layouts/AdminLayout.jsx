/**
 * Admin Layout
 * Wrapper for all admin pages with sidebar
 */

import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 md:h-screen">
      <div className="flex flex-col md:flex-row md:h-full">
        <div className="md:sticky md:top-0 md:h-screen">
          <AdminSidebar />
        </div>

        <div className="flex-1 min-w-0 md:h-full">
          <main className="min-h-screen md:h-full md:overflow-auto bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.08),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#f8fbff_100%)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
