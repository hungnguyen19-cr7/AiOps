import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LoginModal({ onClose }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Xử lý đăng nhập truyền thống
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    console.log("Login with:", formData)
    setTimeout(() => {
      setLoading(false)
      // Login thành công -> lưu token & chuyển trang
      localStorage.setItem('aiops_auth', 'true')
      navigate('/admin')
      onClose()
    }, 1500)
  }

  // Xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      localStorage.setItem('aiops_auth', 'true')
      navigate('/admin')
      onClose()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-overlay absolute inset-0 bg-navy/80" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 40 }}
        className="relative w-full max-w-sm neon-border rounded-lg bg-navy-light overflow-hidden"
      >
        <div className="scan-line" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-neon/50 text-xs tracking-widest uppercase block mb-1">
                // system_auth
              </span>
              <h2 className="font-display font-bold text-2xl text-white">Login</h2>
            </div>
            <button onClick={onClose} className="text-silver/40 hover:text-neon p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Form đăng nhập truyền thống */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Username / Email</label>
              <input 
                type="text" 
                required
                className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                placeholder="Username"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Password</label>
              <input 
                type="Password" 
                required
                className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-neon text-navy font-bold py-3 rounded mt-2 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(0,255,170,0.3)]"
            >
              Access System
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-silver/10"></div></div>
            <span className="relative px-4 bg-navy-light text-silver/40 text-xs font-mono">OR CONTINUE WITH</span>
          </div>

          {/* Google Login Option */}
          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.03 }}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-3 rounded hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium">Google Account</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}