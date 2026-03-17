import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('aiops_auth', 'admin')
        localStorage.setItem('aiops_user', username)
        navigate('/admin')
      } else {
        setError('Invalid credentials. Please verify your administrative access.')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-neon opacity-20 blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="neon-border rounded-xl bg-navy-light/80 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
          <div className="scan-line" />
          
          <div className="text-center mb-8">
            <span className="font-mono text-neon/60 text-[10px] tracking-[0.3em] uppercase block mb-2">
              Secure_Access_Portal
            </span>
            <h1 className="font-display font-bold text-3xl text-white tracking-widest uppercase">
              Admin <span className="text-neon">Login</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="font-mono text-[10px] text-silver/40 uppercase tracking-widest block mb-2 ml-1">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-navy border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon/50 transition-all font-mono"
                placeholder="root_admin"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-silver/40 uppercase tracking-widest block mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon/50 transition-all font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded text-center font-mono"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-neon text-navy font-display font-bold text-sm tracking-[0.2em] uppercase py-4 rounded-lg shadow-[0_0_20px_rgba(0,255,170,0.2)] hover:shadow-[0_0_30px_rgba(0,255,170,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : 'Establish Connection'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => navigate('/')}
              className="font-mono text-[9px] text-silver/30 hover:text-neon uppercase tracking-[0.2em] transition-colors"
            >
              ← Back to Main Interface
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
