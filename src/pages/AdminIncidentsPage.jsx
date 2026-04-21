import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const INCIDENTS_PROXY_BASE_URL = '/api/incident-controls'
const INCIDENTS_ENABLED = true
const INCIDENTS_STATUS_PATH = '/api/demo/status'
const INCIDENTS_STATUS_POLL_INTERVAL_MS = 3000

const INCIDENT_CONFIGS = [
  {
    id: 'cpu-memory-leak',
    title: 'CPU / Memory Leak',
    description: 'Creates real CPU and memory pressure on the garage-sale-online application server.',
    startPath: '/api/demo/cpu-memory-leak',
    stopPath: '/api/demo/cpu-memory-leak/stop',
    startPayload: {
      durationSeconds: 45,
      cpuWorkers: 2,
      memoryMbPerStep: 16,
      memoryStepMs: 1000,
    },
  },
  {
    id: 'disk-full',
    title: 'Disk Full',
    description: 'Pushes root filesystem usage toward the configured threshold on the real server.',
    startPath: '/api/demo/disk-full',
    stopPath: '/api/demo/disk-full/stop',
    startPayload: {
      durationSeconds: 120,
      fillMb: 512,
      targetUsagePercent: 90,
    },
  },
  {
    id: 'slow-query',
    title: 'Slow Query',
    description: 'Creates application-visible latency without applying destructive pressure to the real database.',
    startPath: '/api/demo/slow-query',
    stopPath: '/api/demo/slow-query/stop',
    startPayload: {
      durationSeconds: 90,
      delayMs: 1500,
      sampleRate: 1,
      scope: 'all',
    },
  },
  {
    id: 'db-pool-exhausted',
    title: 'DB Pool Exhausted',
    description: 'Simulates connection pool contention so requests can delay or fail at the application layer.',
    startPath: '/api/demo/db-pool-exhausted',
    stopPath: '/api/demo/db-pool-exhausted/stop',
    startPayload: {
      durationSeconds: 90,
      concurrency: 40,
      queueDelayMs: 1200,
      failureRate: 0.35,
    },
  },
]

const initialStatus = INCIDENT_CONFIGS.reduce((acc, incident) => {
  acc[incident.id] = {
    isStarting: false,
    isStopping: false,
    state: 'idle',
    message: 'No action yet.',
    incidentId: '',
    lastAction: '',
  }
  return acc
}, {})

function getShortMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback
  return payload.reason || payload.error || payload.status || fallback
}

export default function AdminIncidentsPage() {
  const navigate = useNavigate()
  const [incidentStates, setIncidentStates] = useState(initialStatus)
  const latestStatusRequestRef = useRef(0)
  const isReady = useMemo(() => {
    return INCIDENTS_ENABLED && Boolean(INCIDENTS_PROXY_BASE_URL)
  }, [])
  const sidebarItems = useMemo(() => ([
    {
      id: 'monitoring',
      label: 'Dashboard',
      route: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      route: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'config',
      label: 'Tenants Setup',
      route: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'incidents',
      label: 'Incident Control',
      route: '/admin/incidents',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
      ),
    },
    {
      id: 'management',
      label: 'Management Client',
      route: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ]), [])
  const activeView = 'incidents'

  const updateIncidentState = (incidentId, updater) => {
    setIncidentStates((prev) => ({
      ...prev,
      [incidentId]: updater(prev[incidentId]),
    }))
  }

  const resetIncidentState = (incidentId) => {
    updateIncidentState(incidentId, () => ({
      ...initialStatus[incidentId],
      message: 'No action yet.',
    }))
  }

  const markIncidentActive = (incidentId, data, action) => {
    updateIncidentState(incidentId, (prev) => ({
      ...prev,
      isStarting: false,
      isStopping: false,
      state: 'success',
      incidentId: data?.incidentId || prev.incidentId,
      message: getShortMessage(data, action === 'start' ? 'Incident started successfully.' : 'Incident stopped successfully.'),
      lastAction: action,
    }))
  }

  const markIncidentStopped = (incidentId, data) => {
    updateIncidentState(incidentId, () => ({
      ...initialStatus[incidentId],
      state: 'success',
      message: getShortMessage(data, 'Incident stopped successfully.'),
      lastAction: 'stop',
    }))
  }

  const refreshStatuses = async () => {
    if (!isReady) {
      return
    }

    const requestId = latestStatusRequestRef.current + 1
    latestStatusRequestRef.current = requestId

    try {
      const response = await fetch(`${INCIDENTS_PROXY_BASE_URL}${INCIDENTS_STATUS_PATH}`, {
        cache: 'no-store',
      })
      const data = await response.json().catch(() => null)
      if (requestId !== latestStatusRequestRef.current) {
        return
      }
      if (!response.ok) {
        throw new Error(getShortMessage(data, `Request failed with status ${response.status}`))
      }

      setIncidentStates((prev) => INCIDENT_CONFIGS.reduce((acc, incident) => {
        const runtimeState = data?.incidents?.[incident.id]
        const wasBusy = prev[incident.id]?.isStarting || prev[incident.id]?.isStopping
        acc[incident.id] = {
          ...initialStatus[incident.id],
          ...prev[incident.id],
          isStarting: false,
          isStopping: false,
          state: runtimeState?.active ? 'success' : 'idle',
          incidentId: runtimeState?.incidentId || '',
          message: runtimeState?.active
            ? `Incident active via ${runtimeState.source || 'runtime-state'}.`
            : wasBusy
              ? prev[incident.id]?.message || 'No action yet.'
              : 'No active incident.',
          lastAction: runtimeState?.active ? 'start' : '',
        }
        return acc
      }, {}))
    } catch {
      if (requestId !== latestStatusRequestRef.current) {
        return
      }
    }
  }

  useEffect(() => {
    refreshStatuses()
    const intervalId = window.setInterval(refreshStatuses, INCIDENTS_STATUS_POLL_INTERVAL_MS)
    const handleFocus = () => {
      refreshStatuses()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isReady])

  const callIncidentApi = async ({ incidentId, path, body, action }) => {
    updateIncidentState(incidentId, (prev) => ({
      ...prev,
      isStarting: action === 'start',
      isStopping: action === 'stop',
      state: 'loading',
      message: `${action === 'start' ? 'Starting' : 'Stopping'} incident...`,
      lastAction: action,
    }))

    try {
      if (!isReady) {
        throw new Error('Incident controls are disabled or missing built-in proxy connection settings.')
      }

      const response = await fetch(`${INCIDENTS_PROXY_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(getShortMessage(data, `Request failed with status ${response.status}`))
      }

      if (action === 'start') {
        markIncidentActive(incidentId, data, action)
        await refreshStatuses()
        return
      }

      markIncidentStopped(incidentId, data)
      await refreshStatuses()
    } catch (error) {
      if (action === 'stop') {
        resetIncidentState(incidentId)
      }

      updateIncidentState(incidentId, (prev) => ({
        ...prev,
        isStarting: false,
        isStopping: false,
        state: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastAction: action,
      }))
      await refreshStatuses()
    }
  }

  const handleStart = (incident) => {
    callIncidentApi({
      incidentId: incident.id,
      path: incident.startPath,
      body: incident.startPayload,
      action: 'start',
    })
  }

  const handleStop = (incident) => {
    const current = incidentStates[incident.id]
    callIncidentApi({
      incidentId: incident.id,
      path: incident.stopPath,
      body: current.incidentId ? { incidentId: current.incidentId } : {},
      action: 'stop',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('aiops_auth')
    navigate('/')
  }

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col font-body">
      <Header isAdmin={true} onLogout={handleLogout} isSidebarExpanded={true} />

      <div className="flex-1 flex pt-[72px]">
        <aside
          className="border-r border-white/5 bg-[#0a0f18]/30 backdrop-blur-xl fixed top-[72px] bottom-0 left-0 z-20 hidden lg:flex flex-col w-72 p-6 overflow-y-auto custom-scrollbar"
        >
          <nav className="space-y-2 w-full">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-4 rounded px-4 py-3.5 transition-all duration-300 group relative ${
                  activeView === item.id
                    ? 'bg-neon/10 border border-neon/30 text-neon shadow-[0_0_20px_rgba(0,255,170,0.1)]'
                    : 'text-silver/40 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className={`transition-colors duration-300 ${activeView === item.id ? 'text-neon' : 'text-silver/30 group-hover:text-silver'}`}>
                  {item.icon}
                </div>
                <span className="font-display font-medium text-sm tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
                {activeView === item.id && (
                  <div className="ml-auto w-1.5 h-4 bg-neon rounded-full shadow-[0_0_8px_rgba(0,255,170,0.6)]" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex flex-col flex-1 lg:ml-72 transition-all duration-300 min-h-[calc(100vh-72px)] relative">
          <div className="flex-1 w-full space-y-8 p-8 lg:p-12">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="w-fit text-silver/60 hover:text-neon font-mono text-xs tracking-[0.2em] uppercase transition-colors"
              >
                ← Back to Admin
              </button>
              <div>
                <h1 className="font-display font-bold text-4xl text-white">
                  Incident <span className="text-neon uppercase tracking-tighter italic">Control</span>
                </h1>
                <p className="mt-3 max-w-3xl text-silver/60 text-sm leading-relaxed">
                  Trigger and stop the four real incident scenarios already provisioned in garage-sale-online. This page is intended for controlled drills only.
                </p>
              </div>
            </div>

            <div className="neon-border rounded-lg bg-red-500/10 border border-red-500/20 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-red-300">Warning</p>
              <p className="mt-2 text-sm text-silver/80 leading-relaxed">
                These actions can create real host pressure or application-visible degradation. Use only in approved drill windows.
              </p>
            </div>

            {!isReady && (
              <div className="neon-border rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-yellow-300">Controls disabled</p>
                <p className="mt-2 text-sm text-silver/80 leading-relaxed">
                  Incident controls are currently unavailable because the built-in incident proxy settings are incomplete.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {INCIDENT_CONFIGS.map((incident) => {
                const state = incidentStates[incident.id]
                const isBusy = state.isStarting || state.isStopping
                const isActive = Boolean(state.incidentId) && state.lastAction === 'start' && state.state === 'success'
                const canStart = isReady && !isBusy && !isActive
                const canStop = isReady && !isBusy && isActive
                const statusTone = state.state === 'success'
                  ? 'text-green-400 border-green-400/20 bg-green-400/10'
                  : state.state === 'error'
                    ? 'text-red-400 border-red-400/20 bg-red-400/10'
                    : state.state === 'loading'
                      ? 'text-yellow-300 border-yellow-300/20 bg-yellow-300/10'
                      : 'text-silver/50 border-white/10 bg-white/5'

                return (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-shimmer neon-border rounded-lg p-6 bg-navy-light/70 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon/80">{incident.id}</p>
                        <h2 className="mt-2 font-display font-bold text-2xl text-white">{incident.title}</h2>
                      </div>
                      <div className={`px-3 py-1 rounded border text-[10px] font-mono uppercase tracking-[0.2em] ${statusTone}`}>
                        {state.state}
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-silver/70 leading-relaxed min-h-[72px]">{incident.description}</p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleStart(incident)}
                        disabled={!canStart}
                        className="btn-neon rounded-sm px-4 py-3 bg-neon/10 border border-neon/40 text-neon font-display font-semibold text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {state.isStarting ? 'STARTING...' : 'START'}
                      </button>
                      <button
                        onClick={() => handleStop(incident)}
                        disabled={!canStop}
                        className="btn-neon rounded-sm px-4 py-3 bg-red-500/10 border border-red-400/40 text-red-300 font-display font-semibold text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {state.isStopping ? 'STOPPING...' : 'STOP'}
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 text-sm">
                      <div className="rounded border border-white/10 bg-black/20 px-4 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver/40">Latest incident ID</p>
                        <p className="mt-2 break-all text-silver/80">{state.incidentId || '-'}</p>
                      </div>
                      <div className="rounded border border-white/10 bg-black/20 px-4 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver/40">Last response</p>
                        <p className="mt-2 text-silver/80 leading-relaxed">{state.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      <Footer isAdmin={true} />
    </div>
  )
}
