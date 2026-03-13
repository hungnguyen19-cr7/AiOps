import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'

const resourcesData = [
  { title: 'SOC 2 Type 2 Report - 2025', status: 'Compliant', type: 'Report', category: 'COMPLIANCE', id: 'soc2' },
  { title: 'ISO 42001 Certificate', status: 'Compliant', type: 'Certificate', category: 'COMPLIANCE', id: 'iso' },
  { title: 'HIPAA Assessment', status: 'Compliant', type: 'Assessment', category: 'COMPLIANCE', id: 'hipaa' },
  { title: 'Data Protection and Encryption Policy', type: 'Policy', category: 'RESOURCES', id: 'dpep' },
  { title: 'Company Handbook', type: 'Policy', category: 'RESOURCES', id: 'handbook' },
  { title: 'Data Classification Policy', type: 'Policy', category: 'RESOURCES', id: 'dcp' },
]

const controlsData = [
  {
    category: 'Asset management',
    items: [
      { text: 'Secure media disposal', status: 'pass' },
      { text: 'POI device security and inspection', status: 'pass' },
      { text: 'Network security infrastructure inventory', status: 'pass' },
      { text: 'Technology asset inventory', status: 'pass' },
      { text: 'Annual in-scope asset inventory review', status: 'pass' },
    ]
  },
  {
    category: 'Business continuity and disaster recovery',
    items: [
      { text: 'Emergency operations continuity', status: 'pass' },
      { text: 'Database backups', status: 'pass' },
      { text: 'Emergency ePHI access procedures', status: 'pass' },
      { text: 'Business continuity and disaster recovery plan', status: 'pass' },
      { text: 'Multi-availability zone deployment', status: 'pass' },
    ]
  }
]

const subprocessorsData = [
  { name: 'Amazon Web Service', role: 'Cloud Infrastructure & Platform Services', location: 'USA' },
  { name: 'Railway', role: 'Cloud Infrastructure & Platform Services', location: 'USA' },
  { name: 'Anthropic', role: 'AI & ML Services', location: 'USA' },
  { name: 'Azure', role: 'Cloud Infrastructure & Platform Services', location: 'USA' },
]

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'resources', label: 'Resources' },
  { id: 'controls', label: 'Controls' },
  { id: 'subprocessors', label: 'Subprocessors' },
  { id: 'updates', label: 'Updates' },
]

export default function TrustPage() {
  const { section = 'overview' } = useParams()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [section])

  const renderSection = () => {
    switch (section) {
      case 'overview':
        return <OverviewView />
      case 'resources':
        return <ResourcesView />
      case 'controls':
        return <ControlsView />
      case 'subprocessors':
        return <SubprocessorsView />
      default:
        return <div className="py-20 text-center font-mono text-silver/40">Section "{section}" coming soon...</div>
    }
  }

  return (
    <div className="min-h-screen bg-[#060910] text-silver font-sans selection:bg-neon/30">
      {/* Refined Header for Trust Center */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-navy/90 backdrop-blur-md border-neon/10 py-2' : 'bg-transparent border-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Branding - Matching AdminPage style */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex-shrink-0">
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
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="font-display font-bold text-lg tracking-wider text-white">
                  AGENTIC<span className="text-neon">AIOps</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-silver/40 uppercase tracking-[0.2em] whitespace-nowrap">
                  Trust Center
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/trust/${tab.id}`)}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${
                    section === tab.id 
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                      : 'text-silver/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-1.5 text-silver/30 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="bg-white text-navy px-4 py-2 rounded text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-2 hover:bg-silver transition-all shadow-lg hover:shadow-white/5 shrink-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 1h-3.9c-1 0-1.9.4-2.6 1.1l-10.4 10.4c-1.4 1.4-1.4 3.7 0 5.1l3.9 3.9c1.4 1.4 3.7 1.4 5.1 0l10.4-10.4c.7-.7 1.1-1.6 1.1-2.6v-3.9c0-2-1.6-3.6-3.6-3.6zm-2.4 6c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
              </svg>
              Request Access
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function OverviewView() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-navy via-navy-light to-orange-900/20 group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/60 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-12 max-w-3xl space-y-6">
          <h1 className="font-display font-bold text-5xl text-white leading-tight">
            Trust Center
          </h1>
          <p className="text-silver/70 text-lg leading-relaxed">
            AGENTIC AIOps is committed to maintaining the highest standards of security and regulatory practices. Our mission is to provide transparent, secure operations and clear accountability for all our customers and partners. This portal provides a comprehensive view of our security posture and compliance status.
          </p>
          <div className="flex items-center gap-2 text-silver/40 font-mono text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            security@agentic-aiops.io
          </div>
        </div>

        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-neon/10 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full" />
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-silver/30 group-focus-within:text-neon transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search reports, policies, controls..."
          className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-16 text-white text-base focus:outline-none focus:border-neon/30 focus:ring-1 focus:ring-neon/30 transition-all placeholder:text-silver/20 shadow-lg"
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <kbd className="hidden md:block bg-navy px-2 py-1 rounded border border-white/10 text-[10px] text-silver/30 font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Compliance & Trust */}
        <div className="lg:col-span-4 space-y-12">
          {/* Compliance Badges */}
          <section>
            <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-silver/40 mb-6">Compliance</h3>
            <div className="space-y-4">
              {[
                { title: 'ISO 42001', img: '/image/trust/iso.webp' },
                { title: 'SOC 2 Type II', img: '/image/trust/soc2.webp' },
                { title: 'HIPAA', img: '/image/trust/hipaa.webp' }
              ].map((c) => (
                <div key={c.title} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-white/10 overflow-hidden group-hover:scale-105 transition-transform shadow-xl">
                      <img src={c.img} alt={c.title} className="w-full h-full object-contain p-2" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-green-400 font-mono">
                        <span className="w-1 h-1 rounded-full bg-green-400" />
                        Compliant
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-silver/40 mb-6">Trusted By</h3>
            <div className="grid grid-cols-4 gap-4">
              <a 
                href="https://ntq.com.vn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="aspect-square bg-white rounded-lg flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer border border-white/10 overflow-hidden shadow-lg p-2"
              >
                <img src="/image/trust/ntq_solution_jsc_logo.jpeg" alt="NTQ Solution" className="w-full h-full object-contain" />
              </a>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-lg flex items-center justify-center grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer border border-white/5">
                  <div className="w-2/3 h-2/3 bg-silver/10 rounded-sm" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Resources & Controls */}
        <div className="lg:col-span-8 space-y-16">
          {/* Resources Preview */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-silver/40">Resources</h3>
              <button className="text-[11px] text-silver/40 hover:text-neon flex items-center gap-1 transition-colors group">
                View all <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {resourcesData.slice(0, 5).map((res) => (
                <div key={res.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group cursor-pointer text-sm">
                  <div className="flex items-center gap-4">
                    <svg className="w-5 h-5 text-silver/30 group-hover:text-neon transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-silver/80 group-hover:text-white transition-colors font-medium">{res.title}</span>
                  </div>
                  <button className="flex items-center gap-2 text-silver/30 hover:text-white transition-colors text-xs font-mono">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Request
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Controls Preview */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-silver/40">Controls</h3>
              <button className="text-[11px] text-silver/40 hover:text-neon flex items-center gap-1 transition-colors group">
                See all 210 controls <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {controlsData.map((cat) => (
                <div key={cat.category} className="space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2 hover:text-neon cursor-pointer transition-colors group uppercase tracking-widest">
                    {cat.category}
                    <span className="text-silver/20 group-hover:translate-x-0.5 transition-transform text-xs">›</span>
                  </h4>
                  <ul className="space-y-3">
                    {cat.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-xs">
                        <span className="text-neon mt-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path d="M20 6L9 17L4 12" />
                          </svg>
                        </span>
                        <span className="text-silver/60 leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                    <li className="text-[11px] text-silver/30 font-mono pl-7 underline cursor-pointer hover:text-neon">+ {cat.category === 'Asset management' ? '2 more' : '1 more'}</li>
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Subprocessors Preview */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-silver/40">Subprocessors</h3>
              <button className="text-[11px] text-silver/40 hover:text-neon flex items-center gap-1 transition-colors group">
                View all <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {subprocessorsData.slice(0, 4).map((sub) => (
                <div key={sub.name} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 bg-navy rounded flex items-center justify-center border border-white/5 group-hover:border-neon/20 transition-colors">
                    <div className="w-1/2 h-1/2 bg-neon/10 rounded-sm border border-neon/20" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                    <p className="text-[11px] text-silver/40 font-mono uppercase tracking-wider">{sub.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="pt-24 flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-silver/40">Powered by</span>
        <div className="flex items-center gap-3 font-display font-bold text-white text-xl">
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <polygon
                points="18,2 33,10 33,26 18,34 3,26 3,10"
                fill="none"
                stroke="#00FFAA"
                strokeWidth="1.5"
              />
              <polygon
                points="18,8 27,13 27,23 18,28 9,23 9,13"
                fill="rgba(0,255,170,0.1)"
                stroke="#00FFAA"
                strokeWidth="1"
              />
              <circle cx="18" cy="18" r="3" fill="#00FFAA" />
            </svg>
          </div>
          AGENTIC<span className="text-neon">AIOps</span>
        </div>
      </div>
    </div>
  )
}

function ResourcesView() {
  return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-3xl font-display font-bold text-white">Resources</h2>
      <p className="text-silver/40 font-mono">Detailed resources list view coming soon...</p>
      <button onClick={() => window.history.back()} className="text-neon hover:underline font-mono text-sm">Return to Overview</button>
    </div>
  )
}

function ControlsView() {
  return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-3xl font-display font-bold text-white">Security Controls</h2>
      <p className="text-silver/40 font-mono">Detailed controls inventory coming soon...</p>
      <button onClick={() => window.history.back()} className="text-neon hover:underline font-mono text-sm">Return to Overview</button>
    </div>
  )
}

function SubprocessorsView() {
  return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-3xl font-display font-bold text-white">Subprocessors</h2>
      <p className="text-silver/40 font-mono">Detailed list of third-party processors coming soon...</p>
      <button onClick={() => window.history.back()} className="text-neon hover:underline font-mono text-sm">Return to Overview</button>
    </div>
  )
}