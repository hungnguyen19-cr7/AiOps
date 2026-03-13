import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.ai-agentops.info/').replace(/\/$/, '')
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

  // Section 4: Monitoring Data
  const [alerts, setAlerts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts') // 'alerts' | 'audit'

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

  const loadMonitoringData = async (tenantId) => {
    if (!tenantId) return
    setLoadingData(true)
    try {
      const [alertsData, logsData] = await Promise.all([
        request(`/api/v1/alerts?limit=10&offset=0`, {
          headers: { 'X-Tenant-ID': tenantId }
        }),
        request(`/api/v1/auditlogs?limit=10&offset=0`, {
          headers: { 'X-Tenant-ID': tenantId }
        })
      ])
      setAlerts(alertsData || [])
      setAuditLogs(logsData || [])
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setLoadingData(false)
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
    loadMonitoringData(selectedTenantId)
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

    pickedFiles.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && ALLOWED_EXTENSIONS.includes(ext)) {
        validFiles.push(file)
      }
    })

    setUploadedFiles(prev => {
      // Append new files to existing ones, filtering out duplicates by name
      const existingNames = new Set(prev.map(f => f.name))
      const uniqueNewFiles = validFiles.filter(f => !existingNames.has(f.name))
      return [...prev, ...uniqueNewFiles]
    })

    setManifestUploadSuccess(false)
    setUploadError(validFiles.length === pickedFiles.length ? '' : 'Only PDF, Markdown, and TXT files are allowed.')
    
    // Reset input value to allow selecting the same file again if it was removed from the list
    if (event.target) event.target.value = ''
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

    const filesToUpload = [...uploadedFiles]
    let successCount = 0
    let lastError = ''

    try {
      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('metadata', JSON.stringify({ uploaded_from: 'admin_console', filename: file.name }))

        try {
          await request('/api/v1/knowledge/upload', {
            method: 'POST',
            headers: {
              'X-Tenant-ID': selectedTenantId,
            },
            body: formData,
          })
          successCount++
          // Remove from list as we succeed
          setUploadedFiles(prev => prev.filter(f => f.name !== file.name))
        } catch (err) {
          lastError = `Failed to upload ${file.name}: ${err.message}`
          console.error(lastError)
        }
      }

      if (successCount === filesToUpload.length) {
        setManifestUploadSuccess(true)
      } else if (successCount > 0) {
        setUploadError(`Uploaded ${successCount}/${filesToUpload.length} files. ${lastError}`)
      } else {
        setUploadError(lastError || 'Upload failed.')
      }
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col font-body">
      <Header isAdmin={true} onLogout={handleLogout} />

      <main className="flex-1 pt-24 pb-16 px-6">
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
          <div className="neon-border rounded-lg bg-navy-light p-8 transition-all duration-700">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.6)]" />
                System Monitoring
              </h2>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => loadMonitoringData(selectedTenantId)}
                  disabled={loadingData}
                  className="p-1.5 rounded-full hover:bg-white/10 text-silver/40 hover:text-neon transition-all"
                  title="Manual Refresh"
                >
                  <svg className={`w-4 h-4 ${loadingData ? 'animate-spin text-neon' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-neon/30" />
                  <span className="w-3 h-3 rounded-full bg-neon/30" />
                </div>
              </div>
            </div>



            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
              <div className="flex bg-white/5 border-b border-white/5">
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`flex-1 px-4 py-3 font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'alerts' ? 'text-neon bg-neon/5 border-b-2 border-neon' : 'text-silver/40 hover:text-silver/70'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'alerts' ? 'bg-neon shadow-[0_0_8px_rgba(0,255,170,0.6)]' : 'bg-silver/20'}`} />
                  Alerts {alerts.length > 0 && `(${alerts.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex-1 px-4 py-3 font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'audit' ? 'text-neon bg-neon/5 border-b-2 border-neon' : 'text-silver/40 hover:text-silver/70'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'audit' ? 'bg-neon shadow-[0_0_8px_rgba(0,255,170,0.6)]' : 'bg-silver/20'}`} />
                  Audit Logs {auditLogs.length > 0 && `(${auditLogs.length})`}
                </button>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar">
                {activeTab === 'alerts' ? (
                  <table className="w-full text-left font-mono text-[10px] border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0d1525] text-silver/40 uppercase tracking-widest z-10">
                      <tr>
                        <th className="px-4 py-3 border-b border-white/5">ID</th>
                        <th className="px-4 py-3 border-b border-white/5">Source</th>
                        <th className="px-4 py-3 border-b border-white/5">Severity</th>
                        <th className="px-4 py-3 border-b border-white/5">Status</th>
                        <th className="px-4 py-3 border-b border-white/5">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingData ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-4 py-4"><div className="h-2 bg-white/5 rounded w-full" /></td>
                          </tr>
                        ))
                      ) : alerts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-20 text-center text-silver/20 italic tracking-widest">NO ACTIVE ALERTS DETECTED</td>
                        </tr>
                      ) : (
                        alerts.map((alert) => (
                          <tr key={alert.alert_id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 text-silver/60 group-hover:text-neon transition-colors cursor-help" title={alert.alert_id}>
                              {alert.alert_id.split('-')[0]}...
                            </td>
                            <td className="px-4 py-3 text-white uppercase">{alert.source}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-sm border ${
                                alert.severity === 'HIGH' ? 'text-red-400 border-red-400/30 bg-red-400/5' :
                                alert.severity === 'MEDIUM' ? 'text-orange-400 border-orange-400/30 bg-orange-400/5' :
                                'text-blue-400 border-blue-400/30 bg-blue-400/5'
                              }`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full ${alert.status === 'Resolved' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                <span className={alert.status === 'Resolved' ? 'text-green-400/80' : 'text-yellow-400/80'}>{alert.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-silver/40">{new Date(alert.created_at).toLocaleTimeString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left font-mono text-[10px] border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-[#0d1525] text-silver/40 uppercase tracking-widest z-10">
                      <tr>
                        <th className="px-4 py-3 border-b border-white/5">Summary</th>
                        <th className="px-4 py-3 border-b border-white/5">Action</th>
                        <th className="px-4 py-3 border-b border-white/5">Actor</th>
                        <th className="px-4 py-3 border-b border-white/5">Time</th>
                        <th className="px-4 py-3 border-b border-white/5">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingData ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-4 py-4"><div className="h-2 bg-white/5 rounded w-full" /></td>
                          </tr>
                        ))
                      ) : auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-20 text-center text-silver/20 italic tracking-widest">AUDIT STREAM EMPTY</td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.log_id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 text-silver/80 group-hover:text-white transition-colors">{log.rca_summary}</td>
                            <td className="px-4 py-3 text-neon/70 uppercase">[{log.action_type}] {log.action_name}</td>
                            <td className="px-4 py-3 text-silver/40">{log.approver_user_id}</td>
                            <td className="px-4 py-3 text-silver/40">{new Date(log.created_at).toLocaleTimeString()}</td>
                            <td className="px-4 py-3">
                              <span className={log.outcome === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}>{log.outcome}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>


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
    </main>
    <Footer />
  </div>
  )
}