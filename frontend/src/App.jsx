import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import StudentResultPortal from './pages/StudentResultPortal'
import {
  InputTestPage,
  InputResultPage,
  PastResultsPage,
  WeeklyReportsPage,
  StudentsPage,
} from './pages/AdminPages'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/input-test"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InputTestPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/input-result"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <InputResultPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/past-results"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PastResultsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/weekly-reports"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <WeeklyReportsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <StudentsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/student-results" element={<StudentResultPortal />} />

          {/* Redirect root to student results */}
          <Route path="/" element={<Navigate to="/student-results" replace />} />

          {/* Catch all - redirect to student results */}
          <Route path="*" element={<Navigate to="/student-results" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
