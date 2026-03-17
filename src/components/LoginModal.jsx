import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'

// ─── Helpers ────────────────────────────────────────────────────────────────
const USERS_KEY = 'aiops_users' // { email: username }

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {} } catch { return {} }
}
function saveUser(email, username) {
  const users = getUsers()
  users[email.toLowerCase()] = username
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function getUsername(email) {
  return getUsers()[email.toLowerCase()] || null
}

// ─── Google Login Button (hook must live here to stay inside provider) ───────
function GoogleLoginButton({ onSuccess, onError, disabled, label = 'Continue with Google' }) {
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
        )
        const info = await res.json()
        onSuccess({ email: info.email, name: info.name, picture: info.picture })
      } catch {
        onSuccess({ email: 'google_user@gmail.com', name: 'Google User' })
      }
    },
    onError,
  })

  return (
    <motion.button
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-3 rounded hover:bg-white/10 transition-all disabled:opacity-50"
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}

// Fallback when Google is not configured
function GoogleFallbackButton({ label }) {
  return (
    <button
      type="button"
      title="Add VITE_GOOGLE_CLIENT_ID to .env to enable Google login"
      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-white/30 py-3 rounded cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span className="text-sm">{label} (Not configured)</span>
    </button>
  )
}

const hasGoogle = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

// ─── Set Username Step (after Google login for new user) ─────────────────────
function SetUsernameStep({ googleInfo, onDone }) {
  const [username, setUsername] = useState(googleInfo.name?.split(' ')[0] || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) { setError('Please enter a username'); return }
    if (trimmed.length < 2) { setError('Username must be at least 2 characters'); return }
    saveUser(googleInfo.email, trimmed)
    onDone(trimmed)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">👤</span>
        </div>
        <h3 className="text-white font-display font-bold text-lg">Set your username</h3>
        <p className="text-silver/50 text-xs mt-1 font-mono">Logged in as <span className="text-neon/70">{googleInfo.email}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
            placeholder="coolname123"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-neon text-navy font-bold py-3 rounded uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(0,255,170,0.3)]"
        >
          Save & Enter System
        </motion.button>
      </form>
    </motion.div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function LoginModal({ onClose }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [step, setStep] = useState('form') // 'form' | 'set-username'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingGoogleInfo, setPendingGoogleInfo] = useState(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const finishLogin = (username) => {
    localStorage.setItem('aiops_auth', 'true')
    localStorage.setItem('aiops_user', username)
    navigate('/admin')
    onClose()
  }

  // ── Standard Login ──
  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const email = loginEmail.toLowerCase()
      const existingUsername = getUsername(email)
      // Use stored username, or fallback to email prefix
      const display = existingUsername || email.split('@')[0]
      finishLogin(display)
    }, 1000)
  }

  // ── Register ──
  const handleRegister = (e) => {
    e.preventDefault()
    setError('')
    const email = regEmail.toLowerCase()
    const trimmed = regUsername.trim()
    if (!trimmed) { setError('Please enter a username'); return }
    const existing = getUsername(email)
    if (existing) {
      setError(`Email already registered with username "${existing}". Please log in instead.`)
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      saveUser(email, trimmed)
      finishLogin(trimmed)
    }, 1000)
  }

  // ── Google ──
  const handleGoogleSuccess = ({ email, name }) => {
    const existing = getUsername(email)
    if (existing) {
      // Known user → log in directly
      finishLogin(existing)
    } else {
      // New user → ask for username
      setPendingGoogleInfo({ email, name })
      setStep('set-username')
    }
  }

  const handleUsernameSet = (username) => {
    finishLogin(username)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-silver/40 hover:text-neon p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {step === 'set-username' ? (
              <SetUsernameStep key="set-username" googleInfo={pendingGoogleInfo} onDone={handleUsernameSet} />
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div className="mb-6">
                  <span className="font-mono text-neon/50 text-xs tracking-widest uppercase block mb-1">// system_auth</span>
                  <h2 className="font-display font-bold text-2xl text-white">
                    {tab === 'login' ? 'Login' : 'Register'}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex border border-white/10 rounded-lg overflow-hidden mb-6">
                  {['login', 'register'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError('') }}
                      className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
                        tab === t ? 'bg-neon/10 text-neon border-r border-neon/20' : 'text-silver/40 hover:text-silver hover:bg-white/5'
                      }`}
                    >
                      {t === 'login' ? 'Sign In' : 'Register'}
                    </button>
                  ))}
                </div>

                {/* Forms */}
                {tab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Email / Username</label>
                      <input
                        type="text" required value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Password</label>
                      <input
                        type="password" required value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full bg-neon text-navy font-bold py-3 rounded mt-2 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(0,255,170,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <><svg className="animate-spin h-4 w-4 text-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Signing in...</> : 'Access System'}
                    </motion.button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Email</label>
                      <input
                        type="email" required value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Username <span className="text-neon/60">(shown in header)</span></label>
                      <input
                        type="text" required value={regUsername}
                        onChange={(e) => { setRegUsername(e.target.value); setError('') }}
                        className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                        placeholder="yourname"
                      />
                    </div>
                    <div>
                      <label className="block text-silver/60 text-xs uppercase mb-1.5 ml-1 font-mono">Password</label>
                      <input
                        type="password" required value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-navy border border-silver/20 rounded px-4 py-2.5 text-white focus:outline-none focus:border-neon transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs ml-1">{error}</p>}
                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full bg-neon text-navy font-bold py-3 rounded mt-2 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(0,255,170,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <><svg className="animate-spin h-4 w-4 text-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Creating account...</> : 'Create Account'}
                    </motion.button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-silver/10" /></div>
                  <span className="relative px-4 bg-navy-light text-silver/40 text-xs font-mono">OR</span>
                </div>

                {/* Google Button */}
                {hasGoogle ? (
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={(err) => console.error('Google error:', err)}
                    disabled={loading}
                    label={tab === 'login' ? 'Sign in with Google' : 'Register with Google'}
                  />
                ) : (
                  <GoogleFallbackButton label={tab === 'login' ? 'Sign in with Google' : 'Register with Google'} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}