import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const INCIDENTS_PROXY_BASE_URL = '/api/incident-controls'
const INCIDENTS_ENABLED = true
const INCIDENTS_API_KEY = 'JnjRzsJUIqlzWADuGaIiyTceurXaEdWv'

const INCIDENT_CONFIGS = [
  {
    id: 'cpu-memory-leak',
    title: 'CPU / Memory Leak',
    description: 'Creates real CPU and memory pressure on the garage-sale-online application server.',
    startPath: '/api/demo/cpu-memory-leak',
    stopPath: '/api/demo/cpu-memory-leak/stop',
    startPayload: {
      durationSeconds: 60,
      cpuWorkers: 2,
      memoryMbPerStep: 8,
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

  const isReady = useMemo(() => {
    return INCIDENTS_ENABLED && Boolean(INCIDENTS_PROXY_BASE_URL) && Boolean(INCIDENTS_API_KEY)
  }, [])

  const updateIncidentState = (incidentId, updater) => {
    setIncidentStates((prev) => ({
      ...prev,
      [incidentId]: updater(prev[incidentId]),
    }))
  }

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

      updateIncidentState(incidentId, (prev) => ({
        ...prev,
        isStarting: false,
        isStopping: false,
        state: 'success',
        incidentId: data?.incidentId || prev.incidentId,
        message: getShortMessage(data, action === 'start' ? 'Incident started successfully.' : 'Incident stopped successfully.'),
        lastAction: action,
      }))
    } catch (error) {
      updateIncidentState(incidentId, (prev) => ({
        ...prev,
        isStarting: false,
        isStopping: false,
        state: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastAction: action,
      }))
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

      <main className="flex-1 pt-[72px] lg:ml-0">
        <div className="w-full max-w-7xl mx-auto p-8 lg:p-12 space-y-8">
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

      <Footer isAdmin={true} />
    </div>
  )
}
