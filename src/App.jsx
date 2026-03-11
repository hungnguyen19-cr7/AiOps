import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'

// Protected Route Guard
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('aiops_auth') === 'true'
  if (!isAuthenticated) return <Navigate to="/" replace />
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
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
