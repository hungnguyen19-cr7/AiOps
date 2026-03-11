import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function AdminPage() {
  const navigate = useNavigate()
  const [hasConfig, setHasConfig] = useState(false)
  
  // Section 2: Upload Manifest States
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [manifestUploadSuccess, setManifestUploadSuccess] = useState(false)

  // Section 3: Form states
  const [secretType, setSecretType] = useState('cloud') // 'cloud' | 'on-premise'
  const [cloudProvider, setCloudProvider] = useState(null)
  const [onPremiseMethod, setOnPremiseMethod] = useState('file') // 'file' | 'ssh'
  const [servers, setServers] = useState([
    { ip: '192.168.1.10', status: 'Stored', date: '2023-10-24' }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [newServerIp, setNewServerIp] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('aiops_auth')
    navigate('/')
  }

  const handleDeploy = (e) => {
    e.preventDefault()
    // Simulate upload & deploy
    setHasConfig(true)
  }

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col pt-24 pb-16 px-6">
      {/* Header - Reused with admin state */}
      <Header isAdmin={true} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto w-full space-y-8 mt-4">
        {/* Title */}
        <div>
          <span className="font-mono text-neon/60 text-xs tracking-[0.4em] uppercase mb-2 block">
            // system_dashboard
          </span>
          <h1 className="font-display font-bold text-3xl text-white">
            AIOps <span className="text-neon">Command Center</span>
          </h1>
        </div>

        {/* Section 1: System Monitor */}
        <div className="relative mt-8 mb-12">
          <div className={`neon-border rounded-lg bg-navy-light p-8 transition-all duration-700 ${!hasConfig ? 'blur-md opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display font-bold text-2xl text-white">1. System Monitoring</h2>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
                <span className="w-3 h-3 rounded-full bg-neon/30" />
                <span className="w-3 h-3 rounded-full bg-neon/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {['CPU Usage', 'Memory Load', 'Active Pods', 'Network Traffic'].map((metric, i) => (
                <div key={metric} className="p-4 bg-white/5 border border-white/10 rounded flex flex-col justify-between">
                  <span className="font-mono text-[10px] text-silver/40 uppercase tracking-widest">{metric}</span>
                  <span className="font-display font-bold text-2xl text-neon mt-2">{Math.floor(Math.random() * 40 + 20)}%</span>
                </div>
              ))}
            </div>

            {/* Terminal Feed */}
            <div className="bg-black/40 rounded-lg p-6 h-64 font-mono text-sm overflow-hidden relative border border-white/5">
              <div className="text-silver/60 mb-3">AIOPS ACTIVE STREAM</div>
              <div className="space-y-2">
                <div className="text-neon/80">[SYSTEM] Initialization complete.</div>
                <div className="text-silver/80">[INFO] Connecting to cluster nodes... OK.</div>
                <div className="text-silver/80">[INFO] Beginning anomaly detection scan.</div>
                <div className="text-yellow-400/80">[WARN] Minor latency detected in us-east region.</div>
                <div className="text-neon/80">[SYSTEM] Agentic loop idle. Waiting for alerts.</div>
              </div>
              <div className="absolute bottom-6 left-6 flex gap-2 items-center">
                <span className="text-neon">_</span>
                <span className="w-2 h-4 bg-neon animate-pulse" />
              </div>
            </div>
          </div>

          {/* Empty State Overlay */}
          {!hasConfig && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-navy/20 backdrop-blur-sm rounded-lg border border-white/5">
              <svg className="w-16 h-16 text-silver/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-display font-bold text-xl text-white mb-2 text-center">No Configuration Detected</h3>
              <p className="font-mono text-xs text-silver/50 text-center max-w-md leading-relaxed">
                The monitor dashboard is currently inactive. Please define your environment secrets and manifest files via the Upload Configuration panel to activate real-time tracking and AIOps agents.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleDeploy} className="space-y-8">
          {/* Section 2: Upload Manifest */}
          <div className="neon-border rounded-lg p-6 bg-navy-light relative overflow-hidden">
            <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              Upload Manifest
            </h2>

            <div className="space-y-3">
              <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Manifest & Topology Files</label>
              <div className="border border-dashed border-white/20 rounded-md p-8 bg-white/5 hover:border-neon/40 hover:bg-neon/5 transition-all text-center cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".jpg,.png,.jpeg,.yaml,.json,global" 
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files)
                    setUploadedFiles(prev => {
                      const existingNames = new Set(prev.map(f => f.name))
                      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name))
                      return [...prev, ...uniqueNewFiles]
                    })
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <svg className="w-8 h-8 text-neon/60 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="font-mono text-sm text-silver/80 block mb-1">Select Files</span>
                <span className="font-mono text-[10px] text-silver/40">Accepts .jpg, .png, .yaml, .json, global files</span>
              </div>
              {/* File List */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10 group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <svg className="w-3 h-3 text-neon shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-mono text-[10px] text-silver/80 truncate">{file.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
                          }}
                          className="opacity-0 group-hover:opacity-100 text-silver/40 hover:text-red-400 p-1 rounded-full hover:bg-white/5 transition-all"
                          title="Remove file"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="flex-1">
                <AnimatePresence>
                  {manifestUploadSuccess && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-neon/10 border border-neon/30 rounded text-neon font-mono text-[10px] uppercase tracking-widest">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Files Ready for Deployment
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    setManifestUploadSuccess(true)
                  }
                }}
                disabled={uploadedFiles.length === 0}
                className="bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-8 py-3 rounded transition-all hover:bg-neon/90 hover:shadow-[0_0_20px_rgba(0,255,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </button>
            </div>
          </div>

          {/* Section 3: Infrastructure Credentials (FULL: CLOUD & ON-PREM) */}
          <div className="neon-border rounded-lg p-6 bg-navy-light relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_rgba(0,255,170,0.6)]" />
                Infrastructure Credentials
              </h2>
              <div className="flex gap-2 p-1 bg-navy rounded border border-white/5">
                {['cloud', 'on-premise'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setSecretType(type); setUploadSuccess(false); setShowAddForm(false); }}
                    className={`px-4 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded transition-all ${
                      secretType === type ? 'bg-neon text-navy font-bold' : 'text-silver/40 hover:text-silver/70'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {secretType === 'cloud' ? (
                /* --- GIAO DIỆN CHO CLOUD --- */
                <motion.div key="cloud-flow" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Step 1: Select Cloud Provider</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['AWS', 'Azure', 'GCP'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCloudProvider(p.toLowerCase())}
                          className={`py-3 border rounded font-mono text-[10px] transition-all ${
                            cloudProvider === p.toLowerCase() ? 'bg-neon/10 border-neon text-neon' : 'border-white/5 text-silver/30 hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {cloudProvider && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Step 2: Upload {cloudProvider.toUpperCase()} Credentials</label>
                        <div className="border border-dashed border-neon/30 rounded-lg p-10 bg-neon/5 text-center hover:bg-neon/10 transition-all cursor-pointer relative group">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                          <svg className="w-10 h-10 text-neon/40 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-white font-display text-xs uppercase tracking-widest">Drop Credential File</p>
                          <p className="text-silver/30 text-[9px] mt-1">.JSON, .CSV OR .YAML</p>
                        </div>
                        <button type="button" onClick={() => setUploadSuccess(true)} className="w-full bg-neon text-navy font-bold py-3.5 rounded text-[10px] uppercase tracking-[0.3em]">Save Cloud Config</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* --- GIAO DIỆN CHO ON-PREMISE (Giữ nguyên phần List & Add IP của anh) --- */
                <motion.div key="onprem-flow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Stored Nodes Inventory</label>
                    <div className="grid grid-cols-1 gap-2">
                      {servers.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded group hover:border-neon/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon/30 group-hover:bg-neon shadow-neon" />
                            <span className="font-mono text-xs text-silver/80">{s.ip}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[9px] font-mono">
                            <span className="text-silver/20">{s.date}</span>
                            <span className="text-neon px-2 py-0.5 border border-neon/20 rounded bg-neon/5 uppercase">Stored</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!showAddForm ? (
                    <button type="button" onClick={() => setShowAddForm(true)} className="w-full py-4 border border-dashed border-white/10 rounded font-mono text-[10px] text-silver/30 hover:border-neon/40 hover:text-neon transition-all uppercase tracking-widest bg-white/[0.02]">+ Add New On-Premise Node</button>
                  ) : (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-5 border border-neon/20 bg-neon/5 rounded-lg space-y-5">
                      <input type="text" placeholder="SERVER IP / HOSTNAME" className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-neon/40 font-mono" onChange={(e) => setNewServerIp(e.target.value)} />
                      <div className="border border-dashed border-white/10 rounded-lg p-8 text-center relative group hover:border-neon/20 bg-navy/50">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                        <p className="text-[10px] font-mono text-silver/40 uppercase">Drop SSH Private Key</p>
                      </div>
                      <button type="button" onClick={() => { if(newServerIp) { setServers([{ip: newServerIp, status: 'Stored', date: '2023-10-26'}, ...servers]); setUploadSuccess(true); setShowAddForm(false); }}} className="w-full bg-neon text-navy font-bold py-3.5 rounded text-[10px] uppercase tracking-[0.3em]">Save to Database</button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thanh thông báo thành công dùng chung cho cả 2 */}
            <AnimatePresence>
              {uploadSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-neon/10 border border-neon/30 rounded flex items-center justify-center gap-3">
                  <span className="font-mono text-[9px] text-neon uppercase font-bold tracking-[0.2em]">Data Stored Successfully</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  )
}
