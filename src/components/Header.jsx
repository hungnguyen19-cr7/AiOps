import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Header({ onLoginClick, isAdmin, onLogout, isSidebarExpanded = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const userEmail = localStorage.getItem('aiops_user') || 'Admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Problem', href: '/#problem' },
    { label: 'Solution', href: '/#solution' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Contact', href: '/#footer' },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy/90 backdrop-blur-md border-b border-neon/10'
          : 'bg-transparent'
      }`}
    >
      <div 
        className={`flex items-center justify-between h-[72px] w-full transition-all duration-300 ${
          isAdmin 
            ? 'px-4 lg:px-4' 
            : 'max-w-7xl mx-auto px-6 py-4'
        }`}
      >
        <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex-shrink-0">
            {/* Animated hexagon logo */}
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <polygon
                points="18,2 33,10 33,26 18,34 3,26 3,10"
                fill="none"
                stroke="#00FFAA"
                strokeWidth="1.5"
                className="group-hover:stroke-[#00D4FF] transition-colors duration-300"
              />
              <polygon
                points="18,8 27,13 27,23 18,28 9,23 9,13"
                fill="rgba(0,255,170,0.1)"
                stroke="#00FFAA"
                strokeWidth="1"
                className="group-hover:fill-[rgba(0,212,255,0.15)] transition-colors duration-300"
              />
              <circle cx="18" cy="18" r="3" fill="#00FFAA" className="group-hover:fill-[#00D4FF] transition-colors duration-300" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-neon transition-colors duration-300">
            AGENTIC<span className="text-neon">AIOps</span>
          </span>
        </a>

        {/* Desktop Nav */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-silver/70 hover:text-neon text-sm font-body font-medium tracking-wider uppercase transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-neon group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>
        )}

        {/* Login Button */}
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-neon/20 flex items-center justify-center text-neon font-bold text-xs">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-sm font-mono">{userEmail}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-red-400 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded transition-colors text-sm font-mono tracking-widest uppercase border border-red-500/30"
              >
                Logout
              </button>
            </div>
          ) : (
            <motion.button
              id="login-btn"
              onClick={onLoginClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-neon hidden md:flex items-center gap-2 bg-neon/10 border border-neon/40 text-neon font-display font-semibold text-sm tracking-widest px-6 py-2.5 rounded-sm hover:bg-neon/20 transition-all duration-300"
              style={{ boxShadow: '0 0 15px rgba(0,255,170,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              LOGIN
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-silver hover:text-neon transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>
    </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-navy-light border-t border-neon/10 px-6 py-4 flex flex-col gap-4"
        >
          {!isAdmin ? (
            <>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-silver/70 hover:text-neon text-sm font-medium tracking-wider uppercase transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => { onLoginClick(); setMobileOpen(false) }}
                className="text-left text-neon font-semibold text-sm tracking-widest uppercase"
              >
                Login →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-2">
                <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center text-neon font-bold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-mono truncate max-w-[200px]">{userEmail}</span>
                  <span className="text-silver/50 text-xs">Admin</span>
                </div>
              </div>
              <button
                onClick={() => { onLogout(); setMobileOpen(false) }}
                className="text-left text-red-400 hover:text-red-300 font-semibold text-sm tracking-widest uppercase py-2"
              >
                Logout
              </button>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  )
}
