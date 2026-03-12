import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8012').replace(/\/$/, '')
const ALLOWED_EXTENSIONS = ['pdf', 'md', 'txt']
const SELECTED_TENANT_STORAGE_KEY = 'aiops_selected_tenant_id'

const INITIAL_CONFIG_FORM = {
  name: '',
  cloud_provider: null,
  aws_access_key: '',
  aws_secret_access_key: '',
  slack_channel: '',
  slack_bot_token: '',
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.detail || 'Request failed')
  }

  return data
}

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB')
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [hasConfig, setHasConfig] = useState(false)

  // Section 2: Knowledge upload states
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [manifestUploadSuccess, setManifestUploadSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Section 3: Cloud config management states
  const [configTab, setConfigTab] = useState('list') // 'list' | 'create'
  const [configs, setConfigs] = useState([])
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [editingTenantId, setEditingTenantId] = useState(null)
  const [configForm, setConfigForm] = useState(INITIAL_CONFIG_FORM)
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' })
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('aiops_auth')
    navigate('/')
  }

  const loadConfigs = async () => {
    setLoadingConfigs(true)
    setConfigMessage({ type: '', text: '' })

    try {
      const data = await request('/api/v1/tenants')
      setConfigs(data)
      setHasConfig(data.length > 0)
      const storedTenantId = localStorage.getItem(SELECTED_TENANT_STORAGE_KEY)

      if (data.length === 0) {
        setSelectedTenantId('')
        setSelectedTenant(null)
      } else {
        const selectedFromState = data.some((item) => String(item.tenant_id) === String(selectedTenantId))
        const selectedFromStorage = data.some((item) => String(item.tenant_id) === String(storedTenantId))

        if (selectedFromState) {
          setSelectedTenantId(String(selectedTenantId))
        } else if (selectedFromStorage) {
          setSelectedTenantId(String(storedTenantId))
        } else {
          setSelectedTenantId(String(data[0].tenant_id))
        }
      }
    } catch (error) {
      setConfigMessage({ type: 'error', text: error.message })
      setHasConfig(false)
    } finally {
      setLoadingConfigs(false)
    }
  }

  const loadSelectedTenant = async (tenantId) => {
    if (!tenantId) {
      setSelectedTenant(null)
      localStorage.removeItem(SELECTED_TENANT_STORAGE_KEY)
      return
    }

    try {
      const tenant = await request(`/api/v1/tenants/${tenantId}`)
      setSelectedTenant(tenant)
      localStorage.setItem(SELECTED_TENANT_STORAGE_KEY, String(tenant.tenant_id))
      setSelectedTenantId(String(tenant.tenant_id))
    } catch (error) {
      setSelectedTenant(null)
      localStorage.removeItem(SELECTED_TENANT_STORAGE_KEY)
      setConfigMessage({ type: 'error', text: error.message })
    }
  }

  useEffect(() => {
    loadConfigs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedTenantId) {
      setSelectedTenant(null)
      localStorage.removeItem(SELECTED_TENANT_STORAGE_KEY)
      return
    }

    loadSelectedTenant(selectedTenantId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId])

  const filteredConfigs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return configs

    return configs.filter((item) => {
      return (
        (item.name || '').toLowerCase().includes(keyword) ||
        (item.credential_ref || '').toLowerCase().includes(keyword) ||
        (item.slack_channel || '').toLowerCase().includes(keyword)
      )
    })
  }, [configs, searchText])

  const resetConfigForm = () => {
    setConfigForm(INITIAL_CONFIG_FORM)
    setEditingTenantId(null)
  }

  const beginCreateConfig = () => {
    resetConfigForm()
    setConfigTab('create')
  }

  const beginEditConfig = (config) => {
    setConfigForm({
      name: config.name || '',
      cloud_provider: config.cloud_provider || 'aws',
      aws_access_key: '',
      aws_secret_access_key: '',
      slack_channel: config.slack_channel || '',
      slack_bot_token: '',
    })
    setEditingTenantId(String(config.tenant_id))
    setConfigTab('create')
  }

  const handleSaveConfig = async (event) => {
    event.preventDefault()
    setSavingConfig(true)
    setConfigMessage({ type: '', text: '' })

    const isEditing = !!editingTenantId
    const payload = {
      name: configForm.name.trim(),
      cloud_provider: configForm.cloud_provider,
      credential_ref: isEditing
        ? (configForm.aws_access_key.trim() || null)
        : (configForm.aws_access_key.trim() || 'placeholder'),
      aws_access_key: configForm.aws_access_key.trim() || null,
      aws_secret_access_key: configForm.aws_secret_access_key.trim() || null,
      slack_channel: configForm.slack_channel.trim() || null,
      slack_bot_token: configForm.slack_bot_token.trim() || null,
    }

    try {
      if (!payload.name && configForm.cloud_provider) {
        throw new Error('Name is required')
      }
      if (!configForm.cloud_provider) {
        throw new Error('Please select a cloud provider')
      }

      if (editingTenantId) {
        await request(`/api/v1/tenants/${editingTenantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        await loadSelectedTenant(editingTenantId)
        setConfigMessage({ type: 'success', text: 'Configuration updated successfully.' })
      } else {
        const created = await request('/api/v1/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        setSelectedTenantId(String(created.tenant_id))
        localStorage.setItem(SELECTED_TENANT_STORAGE_KEY, String(created.tenant_id))
        await loadSelectedTenant(String(created.tenant_id))
        setConfigMessage({ type: 'success', text: 'Configuration created successfully.' })
      }

      await loadConfigs()
      setConfigTab('list')
      resetConfigForm()
    } catch (error) {
      setConfigMessage({ type: 'error', text: error.message })
    } finally {
      setSavingConfig(false)
    }
  }

  const handleFileSelection = (event) => {
    const pickedFiles = Array.from(event.target.files || [])
    const validFiles = []

    for (const file of pickedFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && ALLOWED_EXTENSIONS.includes(ext)) {
        validFiles.push(file)
      }
    }

    const uniqueFiles = validFiles.filter((file, index, list) => {
      return list.findIndex((f) => f.name === file.name) === index
    })

    setUploadedFiles(uniqueFiles)
    setManifestUploadSuccess(false)
    setUploadError(validFiles.length === pickedFiles.length ? '' : 'Only PDF, Markdown, and TXT files are allowed.')
  }

  const uploadKnowledgeFiles = async () => {
    if (!selectedTenantId) {
      setUploadError('Please select a cloud config before uploading documents.')
      return
    }

    if (uploadedFiles.length === 0) {
      setUploadError('Please select at least one valid knowledge document.')
      return
    }

    setUploading(true)
    setManifestUploadSuccess(false)
    setUploadError('')

    try {
      for (const file of uploadedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('metadata', JSON.stringify({ uploaded_from: 'admin_console', filename: file.name }))

        await request('/api/v1/knowledge/upload', {
          method: 'POST',
          headers: {
            'X-Tenant-ID': selectedTenantId,
          },
          body: formData,
        })
      }

      setManifestUploadSuccess(true)
      setUploadedFiles([])
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col pt-24 pb-16 px-6">
      <Header isAdmin={true} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto w-full space-y-8 mt-4">
        <div>
          <span className="font-mono text-neon/60 text-xs tracking-[0.4em] uppercase mb-2 block">
            // system_dashboard
          </span>
          <h1 className="font-display font-bold text-3xl text-white">
            AIOps <span className="text-neon">Command Center</span>
          </h1>
        </div>

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
              {['CPU Usage', 'Memory Load', 'Active Pods', 'Network Traffic'].map((metric) => (
                <div key={metric} className="p-4 bg-white/5 border border-white/10 rounded flex flex-col justify-between">
                  <span className="font-mono text-[10px] text-silver/40 uppercase tracking-widest">{metric}</span>
                  <span className="font-display font-bold text-2xl text-neon mt-2">{Math.floor(Math.random() * 40 + 20)}%</span>
                </div>
              ))}
            </div>

            <div className="bg-black/40 rounded-lg p-6 h-64 font-mono text-sm overflow-hidden relative border border-white/5">
              <div className="text-silver/60 mb-3">AIOPS ACTIVE STREAM</div>
              <div className="space-y-2">
                <div className="text-neon/80">[SYSTEM] Initialization complete.</div>
                <div className="text-silver/80">[INFO] Config manager connected to /api/v1/tenants.</div>
                <div className="text-silver/80">[INFO] Knowledge upload connected to /api/v1/knowledge/upload.</div>
                <div className="text-yellow-400/80">[WARN] Ensure backend URL is set in VITE_API_BASE_URL.</div>
                <div className="text-neon/80">[SYSTEM] Agentic loop idle. Waiting for alerts.</div>
              </div>
              <div className="absolute bottom-6 left-6 flex gap-2 items-center">
                <span className="text-neon">_</span>
                <span className="w-2 h-4 bg-neon animate-pulse" />
              </div>
            </div>
          </div>

          {!hasConfig && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-navy/20 backdrop-blur-sm rounded-lg border border-white/5">
              <svg className="w-16 h-16 text-silver/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-display font-bold text-xl text-white mb-2 text-center">No Configuration Detected</h3>
              <p className="font-mono text-xs text-silver/50 text-center max-w-md leading-relaxed">
                The monitor dashboard is currently inactive. Please create at least one cloud config in section 3.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="neon-border rounded-lg p-6 bg-navy-light relative overflow-hidden">
            <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
              Upload Knowledge Documents
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Knowledge files for /api/v1/knowledge/upload</label>
                {selectedTenant ? (
                  <span className="font-mono text-[10px] text-neon/70 border border-neon/20 bg-neon/5 rounded px-2 py-0.5">
                    Tenant: {selectedTenant.name}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-red-400/70 border border-red-400/20 bg-red-400/5 rounded px-2 py-0.5">
                    No tenant selected
                  </span>
                )}
              </div>

              <div className="border border-dashed border-white/20 rounded-md p-8 bg-white/5 hover:border-neon/40 hover:bg-neon/5 transition-all text-center cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,.md,.txt,text/plain,text/markdown,application/pdf"
                  multiple
                  onChange={handleFileSelection}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={uploading}
                />
                <AnimatePresence>
                  {uploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-navy/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-md border border-neon/30"
                    >
                      <div className="w-10 h-10 border-2 border-neon/20 border-t-neon rounded-full animate-spin mb-3" />
                      <span className="font-mono text-[10px] text-neon uppercase tracking-widest animate-pulse">Processing Documents...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <svg className="w-8 h-8 text-neon/60 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="font-mono text-sm text-silver/80 block mb-1">Select Knowledge Files</span>
                <span className="font-mono text-[10px] text-silver/40">Accepts .pdf, .md, .txt only</span>
              </div>

              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10 group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <svg className="w-3 h-3 text-neon shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-mono text-[10px] text-silver/80 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
                            setManifestUploadSuccess(false)
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
                      Knowledge Files Uploaded
                    </motion.div>
                  )}
                </AnimatePresence>
                {uploadError && (
                  <p className="mt-2 text-red-300 font-mono text-[11px]">{uploadError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={uploadKnowledgeFiles}
                disabled={uploadedFiles.length === 0 || !selectedTenantId || uploading}
                className="bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-8 py-3 rounded transition-all hover:bg-neon/90 hover:shadow-[0_0_20px_rgba(0,255,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="neon-border rounded-lg p-6 bg-navy-light relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_rgba(0,255,170,0.6)]" />
                Config Tenants
              </h2>
            </div>

            {configMessage.text && (
              <div className={`mb-4 text-[11px] font-mono ${configMessage.type === 'error' ? 'text-red-300' : 'text-neon'}`}>
                {configMessage.text}
              </div>
            )}

            <AnimatePresence mode="wait">
              {configTab === 'list' ? (
                <motion.div key="config-list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search configurations..."
                      className="w-full md:max-w-md bg-navy border border-white/10 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon/40"
                    />
                    <button
                      type="button"
                      onClick={beginCreateConfig}
                      className="bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded transition-all hover:bg-neon/90"
                    >
                      + New Configuration
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-white/10 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-white/5 text-silver/70">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">Name</th>
                          <th className="text-left px-4 py-3 font-medium">Credential Ref</th>
                          <th className="text-left px-4 py-3 font-medium">Slack Channel</th>
                          <th className="text-left px-4 py-3 font-medium">Slack Bot Token</th>
                          <th className="text-left px-4 py-3 font-medium">Created</th>
                          <th className="text-left px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingConfigs && (
                          [...Array(3)].map((_, i) => (
                            <tr key={`skeleton-${i}`} className="border-t border-white/10 animate-pulse">
                              <td className="px-4 py-4"><div className="h-4 bg-white/10 rounded w-24 mb-2"/><div className="h-3 bg-white/5 rounded w-16"/></td>
                              <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-12"/></td>
                              <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-20"/></td>
                              <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-16"/></td>
                              <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-16"/></td>
                              <td className="px-4 py-4"><div className="h-3 bg-white/5 rounded w-10"/></td>
                            </tr>
                          ))
                        )}

                        {!loadingConfigs && filteredConfigs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-silver/50">No cloud configurations found.</td>
                          </tr>
                        )}

                        {!loadingConfigs && filteredConfigs.map((config) => (
                          <tr key={config.tenant_id} className="border-t border-white/10 hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{config.name}</div>
                              <button
                                type="button"
                                onClick={() => setSelectedTenantId(String(config.tenant_id))}
                                className={`mt-1 text-[10px] font-mono px-2 py-0.5 rounded border ${String(config.tenant_id) === String(selectedTenantId) ? 'border-neon/40 text-neon bg-neon/10' : 'border-white/15 text-silver/50'}`}
                              >
                                {String(config.tenant_id) === String(selectedTenantId) ? 'Selected' : 'Select'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-silver/80">{config.credential_ref ? '***' : '-'}</td>
                            <td className="px-4 py-3 text-silver/80">{config.slack_channel || '-'}</td>
                            <td className="px-4 py-3 text-silver/80">{config.slack_bot_token ? '***' : '-'}</td>
                            <td className="px-4 py-3 text-silver/80">{formatDate(config.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => beginEditConfig(config)}
                                className="text-neon hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="config-form" onSubmit={handleSaveConfig} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Cloud Provider Select (Dropdown) */}
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Step 1: Choose Cloud Provider</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
                        className={`w-full flex justify-between items-center px-4 py-3 border rounded font-mono text-[10px] tracking-widest transition-all ${
                          isConfigDropdownOpen || configForm.cloud_provider ? 'border-neon bg-neon/10 text-neon shadow-[0_0_15px_rgba(0,255,170,0.1)]' : 'border-white/10 text-silver/60 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {configForm.cloud_provider && <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />}
                          <span className="uppercase tracking-widest">
                            {configForm.cloud_provider ? `${configForm.cloud_provider} Selected` : 'Choose Cloud Provider'}
                          </span>
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${isConfigDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {isConfigDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="z-30 w-full mt-2 bg-[#0a0f18] border border-neon/30 rounded overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative"
                          >
                            {['aws', 'azure', 'gcp'].map((p) => {
                              const isSelected = configForm.cloud_provider === p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => {
                                    setConfigForm(prev => ({ ...prev, cloud_provider: p }));
                                    setIsConfigDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 font-mono text-[10px] transition-all border-b border-white/5 last:border-none uppercase tracking-widest flex items-center justify-between ${
                                    isSelected ? 'bg-neon/20 text-neon' : 'text-silver/60 hover:bg-neon/10 hover:text-neon'
                                  }`}
                                >
                                  <span>{p}</span>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence>
                    {configForm.cloud_provider && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">name</label>
                          <input
                            type="text"
                            value={configForm.name}
                            onChange={(e) => setConfigForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Configuration name"
                            className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">
                              {configForm.cloud_provider === 'aws' ? 'AWS Access Key' : configForm.cloud_provider === 'azure' ? 'Client ID' : 'Client Email'}
                            </label>
                            <input
                              type="password"
                              value={configForm.aws_access_key}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, aws_access_key: e.target.value }))}
                              placeholder={configForm.cloud_provider === 'aws' ? 'AKIA...' : configForm.cloud_provider === 'azure' ? 'UUID...' : 'service-account@...'}
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">
                              {configForm.cloud_provider === 'aws' ? 'AWS Secret Access Key' : configForm.cloud_provider === 'azure' ? 'Client Secret' : 'Private Key'}
                            </label>
                            <input
                              type="password"
                              value={configForm.aws_secret_access_key}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, aws_secret_access_key: e.target.value }))}
                              placeholder="••••••••••••"
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">slack_channel</label>
                            <input
                              type="text"
                              value={configForm.slack_channel}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, slack_channel: e.target.value }))}
                              placeholder="#aiops-alerts"
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">slack_bot_token</label>
                            <input
                              type="text"
                              value={configForm.slack_bot_token}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, slack_bot_token: e.target.value }))}
                              placeholder="xoxb-..."
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <button
                            type="submit"
                            disabled={savingConfig}
                            className="bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-6 py-3 rounded transition-all hover:bg-neon/90 disabled:opacity-50"
                          >
                            {savingConfig ? 'Saving...' : editingTenantId ? 'Update Configuration' : 'Create Configuration'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfigTab('list')
                              resetConfigForm()
                            }}
                            className="border border-white/20 text-silver font-display font-bold text-sm tracking-widest uppercase px-6 py-3 rounded transition-all hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.form>


              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}