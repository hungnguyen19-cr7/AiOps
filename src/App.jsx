import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'
import AdminIncidentsPage from './pages/AdminIncidentsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import TrustPage from './pages/TrustPage'

// Protected Route Guard
function ProtectedRoute({ children, requireAdmin = false }) {
  const authState = localStorage.getItem('aiops_auth')
  if (!authState) return <Navigate to="/adminlogin" replace />
  if (requireAdmin && authState !== 'admin') return <Navigate to="/admin" replace />
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-navy text-silver font-body relative overflow-x-hidden">
      {/* Global background grid */}
      <div className="fixed inset-0 grid-bg grid-animated opacity-60 pointer-events-none z-0" />
      
      {/* Radial glow at top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-neon opacity-60 pointer-events-none z-0" />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adminlogin" element={<AdminLoginPage />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/incidents" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminIncidentsPage />
          </ProtectedRoute>
        } />

        <Route path="/trust/:section?" element={<TrustPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
