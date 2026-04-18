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
  slack_app_token: '',
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

function formatDateTime(dateValue) {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [hasConfig, setHasConfig] = useState(false)

  // Section 2: Knowledge upload states
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [manifestUploadSuccess, setManifestUploadSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [knowledgeDocs, setKnowledgeDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [docsPage, setDocsPage] = useState(1)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewContent, setPreviewContent] = useState('')
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  // Section 3: Cloud config management states
  const [configTab, setConfigTab] = useState('list') // 'list' | 'create'
  const [configs, setConfigs] = useState([])
  const [loadingConfigs, setLoadingConfigs] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState(
    localStorage.getItem(SELECTED_TENANT_STORAGE_KEY) || ''
  )
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [editingTenantId, setEditingTenantId] = useState(null)
  const [configForm, setConfigForm] = useState(INITIAL_CONFIG_FORM)
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' })
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState(null)

  // Section 4: Monitoring Data
  const [alerts, setAlerts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts') // 'alerts' | 'audit'
  const [alertsPage, setAlertsPage] = useState(1)
  const [auditLogsPage, setAuditLogsPage] = useState(1)
  const [expandedLogId, setExpandedLogId] = useState(null)
  const [logSourceDetails, setLogSourceDetails] = useState({})
  const [loadingLogId, setLoadingLogId] = useState(null)
  const [logModal, setLogModal] = useState(null) // { logId, rca_summary }
  const [logSearchQuery, setLogSearchQuery] = useState('')

  // Section 5: Sidebar Navigation
  const [activeView, setActiveView] = useState('monitoring') // 'monitoring' | 'knowledge' | 'config' | 'management'

  // Section 6: Management Client Data
  const isAdmin = useMemo(() => localStorage.getItem('aiops_auth') === 'admin', [])

  const [clients] = useState([
    { tenant_id: 'bc36f154-0e15-4ffb-ab5c-155eef029a46', organization: 'NTQ Solution', contact_email: 'admin@ntq-solution.com.vn', environment: 'Hybrid (AWS + On-Prem)', region: 'Vietnam / Singapore', status: 'Active', security_posture: 'Healthy', active_alerts: 3, total_remediations: 142, compliance_level: 'SOC 2 Type II', last_sync: '2026-03-17T13:45:00Z' },
    { tenant_id: 'fe89a211-5ba3-4d97-87c2-b93ac6886af2', organization: 'Global FinTech Corp', contact_email: 'sec-ops@globalfin.io', environment: 'Multi-Cloud (Azure + GCP)', region: 'USA (East)', status: 'Warning', security_posture: 'At Risk (IAM Drift)', active_alerts: 12, total_remediations: 850, compliance_level: 'GDPR + SOC 2', last_sync: '2026-03-17T14:10:00Z' },
    { tenant_id: '92da11c6-147c-4773-b33a-8811b2c976f8', organization: 'CyberDyne Systems', contact_email: 'root@cyberdyne.tech', environment: 'On-Premise (Private Data Center)', region: 'Germany', status: 'Maintenance', security_posture: 'Locked', active_alerts: 0, total_remediations: 12, compliance_level: 'ISO 27001', last_sync: '2026-03-16T23:59:59Z' },
    { tenant_id: 'ca55e6c1-5ba3-4d97-87c2-b93ac6886af2', organization: 'Future AI Labs', contact_email: 'ops@futureai.io', environment: 'Google Cloud Platform', region: 'USA (West)', status: 'Active', security_posture: 'Healthy', active_alerts: 1, total_remediations: 3200, compliance_level: 'SOC 2 Type II', last_sync: '2026-03-17T12:00:00Z' },
  ])

  const statsSummary = { total_tenants: 4, total_managed_nodes: 1250, avg_security_score: '92/100', critical_action_required: 1 }

  const sidebarItems = useMemo(() => {
    const base = [
      { id: 'monitoring', label: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )},
      { id: 'knowledge', label: 'Knowledge Base', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )},
      { id: 'config', label: 'Tenants Setup', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )},
    ]
    if (isAdmin) {
      base.push({ id: 'management', label: 'Management Client', icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )})
    }
    return base
  }, [isAdmin])

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

  const loadMonitoringData = async (tenantId, showLoading = true) => {
    if (!tenantId) return
    if (showLoading) setLoadingData(true)
    try {
      const [alertsData, logsData] = await Promise.all([
        request(`/api/v1/alerts?limit=15&offset=${(alertsPage - 1) * 15}`, {
          headers: { 'X-Tenant-ID': tenantId }
        }),
        request(`/api/v1/auditlogs?limit=15&offset=${(auditLogsPage - 1) * 15}`, {
          headers: { 'X-Tenant-ID': tenantId }
        })
      ])
      setAlerts(alertsData || [])
      setAuditLogs(logsData || [])
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      if (showLoading) setLoadingData(false)
    }
  }

  const loadSourceLogs = async (logId) => {
    if (!selectedTenantId || logSourceDetails[logId]) return
    setLoadingLogId(logId)
    try {
      const details = await request(`/api/v1/auditlogs/${logId}`, {
        headers: { 'X-Tenant-ID': selectedTenantId }
      })
      setLogSourceDetails(prev => ({ ...prev, [logId]: details.source_logs || null }))
    } catch (error) {
      console.error('Failed to load source logs:', error)
      setLogSourceDetails(prev => ({ ...prev, [logId]: null }))
    } finally {
      setLoadingLogId(null)
    }
  }

  const loadKnowledgeDocs = async (tenantId, showLoading = true) => {
    if (!tenantId) return
    if (showLoading) setLoadingDocs(true)
    try {
      const resp = await request(`/api/v1/knowledge/documents?limit=15&offset=${(docsPage - 1) * 15}`, {
        headers: { 'X-Tenant-ID': tenantId }
      })
      setKnowledgeDocs(resp?.items || [])
    } catch (error) {
      console.error('Failed to load knowledge documents:', error)
    } finally {
      if (showLoading) setLoadingDocs(false)
    }
  }

  const handleDeleteKnowledgeDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    if (!selectedTenantId) return
    try {
      // Assuming DELETE /api/v1/knowledge/documents/{docId} or /api/v1/knowledge/{docId}
      // Often, the endpoint matches the collection endpoint:
      await request(`/api/v1/knowledge/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'X-Tenant-ID': selectedTenantId }
      })
      loadKnowledgeDocs(selectedTenantId, false)
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert(`Failed to delete document: ${error.message}`)
    }
  }

  const handlePreviewDoc = async (doc) => {
    setPreviewDoc(doc)
    setPreviewContent('')
    setPreviewError('')
    setPreviewPdfUrl(null)
    setPreviewLoading(true)
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/knowledge/documents/${doc.doc_id}/content`, {
        headers: { 'X-Tenant-ID': selectedTenantId }
      })
      if (!resp.ok) throw new Error(`Lỗi server: ${resp.status}`)
      if (doc.file_type === 'pdf') {
        const blob = await resp.blob()
        setPreviewPdfUrl(URL.createObjectURL(blob))
      } else {
        setPreviewContent(await resp.text())
      }
    } catch (err) {
      setPreviewError(err.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreview = () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
    setPreviewDoc(null)
    setPreviewContent('')
    setPreviewError('')
    setPreviewPdfUrl(null)
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
    loadMonitoringData(selectedTenantId, true)

    const intervalId = setInterval(() => {
      loadMonitoringData(selectedTenantId, false)
    }, 5000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId, alertsPage, auditLogsPage])

  useEffect(() => {
    if (!selectedTenantId || activeView !== 'knowledge') return

    loadKnowledgeDocs(selectedTenantId, true)
    const intervalId = setInterval(() => {
      loadKnowledgeDocs(selectedTenantId, false)
    }, 5000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId, activeView, docsPage])

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
      aws_access_key: config.cloud_provider === 'aws' ? (config.credential_ref || '') : '',
      aws_secret_access_key: '',
      slack_channel: config.slack_channel || '',
      slack_bot_token: '',
      slack_app_token: '',
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
      aws_assume_role: configForm.aws_access_key.trim() || null,
      aws_secret_access_key: configForm.aws_secret_access_key.trim() || null,
      slack_channel: configForm.slack_channel.trim() || null,
      slack_bot_token: configForm.slack_bot_token.trim() || null,
      slack_app_token: configForm.slack_app_token.trim() || null,
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

  const handleDeleteConfig = async (tenant) => {
    try {
      await request(`/api/v1/tenants/${tenant.tenant_id}`, {
        method: 'DELETE',
      })
      
      setConfigMessage({ type: 'success', text: 'Configuration deleted successfully.' })
      
      if (String(tenant.tenant_id) === String(selectedTenantId)) {
        setSelectedTenantId('')
        setSelectedTenant(null)
        localStorage.removeItem(SELECTED_TENANT_STORAGE_KEY)
      }

      await loadConfigs()
    } catch (error) {
      setConfigMessage({ type: 'error', text: `Failed to delete configuration: ${error.message}` })
    } finally {
      setTenantToDelete(null)
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
        loadKnowledgeDocs(selectedTenantId, false)
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
      <Header isAdmin={true} onLogout={handleLogout} isSidebarExpanded={true} />

      <div className="flex-1 flex pt-[72px]">
        <aside 
          className="border-r border-white/5 bg-[#0a0f18]/30 backdrop-blur-xl fixed top-[72px] bottom-0 left-0 z-20 hidden lg:flex flex-col w-72 p-6 overflow-y-auto custom-scrollbar"
        >
          <nav className="space-y-2 w-full">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
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

        {/* Dynamic Content Area */}
        <main className="flex flex-col flex-1 lg:ml-72 transition-all duration-300 min-h-[calc(100vh-72px)] relative">
          <div className="flex-1 w-full space-y-12 p-8 lg:p-12">
            <div>
              <h1 className="font-display font-bold text-4xl text-white">
                AIOps <span className="text-neon uppercase tracking-tighter italic">Command Center</span>
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {activeView === 'monitoring' && (
                <motion.div
                  key="monitoring"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >

        <div className="relative mt-8 mb-12">
          <div className="neon-border rounded-lg bg-navy-light p-8 transition-all duration-700">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.6)]" />
                System Monitoring
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-neon/30" />
                  <span className="w-3 h-3 rounded-full bg-neon/30" />
                </div>
              </div>
            </div>



            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-[500px] h-auto max-h-[800px]">
              <div className="flex bg-white/5 border-b border-white/5 shrink-0">
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
                            <td className="px-4 py-3 text-silver/40">{formatDateTime(alert.created_at)}</td>
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
                        <th className="px-4 py-3 border-b border-white/5">Source Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingData ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-4 py-4"><div className="h-2 bg-white/5 rounded w-full" /></td>
                          </tr>
                        ))
                      ) : auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-20 text-center text-silver/20 italic tracking-widest">AUDIT STREAM EMPTY</td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.log_id} className="hover:bg-white/[0.02] transition-colors group align-top">
                            <td className="px-4 py-3 text-silver/80 group-hover:text-white transition-colors">{log.rca_summary}</td>
                            <td className="px-4 py-3 text-neon/70 uppercase">[{log.action_type}] {log.action_name}</td>
                            <td className="px-4 py-3 text-silver/40">{log.approver_user_id}</td>
                            <td className="px-4 py-3 text-silver/40">{formatDateTime(log.created_at)}</td>
                            <td className="px-4 py-3">
                              <span className={log.outcome === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}>{log.outcome}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setLogModal({ logId: log.log_id, rca_summary: log.rca_summary })
                                  setLogSearchQuery('')
                                  loadSourceLogs(log.log_id)
                                }}
                                className="text-[10px] px-2 py-1 border border-neon/30 rounded text-neon/70 hover:text-neon hover:bg-neon/10 transition-all whitespace-nowrap flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                View Logs
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-t border-white/5 mt-auto shrink-0">
                <button
                  disabled={activeTab === 'alerts' ? alertsPage === 1 : auditLogsPage === 1}
                  onClick={() => {
                    const setPage = activeTab === 'alerts' ? setAlertsPage : setAuditLogsPage;
                    setPage(p => Math.max(1, p - 1));
                  }}
                  className="px-3 py-1.5 text-xs font-mono text-silver/60 hover:text-white disabled:opacity-30 disabled:hover:text-silver/60 transition-colors border border-white/10 hover:border-white/30 rounded flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  PREV
                </button>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-silver/40 uppercase tracking-widest">
                    Page <span className="text-neon">{activeTab === 'alerts' ? alertsPage : auditLogsPage}</span>
                  </span>
                </div>
                <button
                  disabled={activeTab === 'alerts' ? alerts.length < 15 : auditLogs.length < 15}
                  onClick={() => {
                    const setPage = activeTab === 'alerts' ? setAlertsPage : setAuditLogsPage;
                    setPage(p => p + 1);
                  }}
                  className="px-3 py-1.5 text-xs font-mono text-silver/60 hover:text-white disabled:opacity-30 disabled:hover:text-silver/60 transition-colors border border-white/10 hover:border-white/30 rounded flex items-center gap-2"
                >
                  NEXT
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}

              {activeView === 'knowledge' && (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <div className="space-y-8">
          <div className="neon-border rounded-lg p-6 bg-navy-light relative overflow-hidden mb-8">
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
          </div>

          {/* Uploaded Documents Table */}
          <div className="neon-border rounded-lg p-6 bg-navy-light relative overflow-hidden flex flex-col min-h-[500px] h-auto max-h-[800px]">
            <h2 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Document Library
            </h2>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-[10px] border-separate border-spacing-0">
                <thead className="sticky top-0 bg-[#0d1525] text-silver/40 uppercase tracking-widest z-10">
                  <tr>
                    <th className="px-4 py-3 border-b border-white/5">Filename</th>
                    <th className="px-4 py-3 border-b border-white/5">Type</th>
                    <th className="px-4 py-3 border-b border-white/5">Status</th>
                    <th className="px-4 py-3 border-b border-white/5">Upload Time</th>
                    <th className="px-4 py-3 border-b border-white/5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingDocs ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-4 py-4"><div className="h-2 bg-white/5 rounded w-full" /></td>
                      </tr>
                    ))
                  ) : knowledgeDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center text-silver/20 italic tracking-widest">NO DOCUMENTS FOUND</td>
                    </tr>
                  ) : (
                    knowledgeDocs.map((doc) => (
                      <tr key={doc.doc_id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3 text-silver/80 group-hover:text-white transition-colors flex items-center gap-2">
                          <svg className="w-4 h-4 text-neon/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span className="truncate max-w-[200px] lg:max-w-[400px]">{doc.filename}</span>
                        </td>
                        <td className="px-4 py-3 text-neon/70 uppercase">{doc.file_type || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1 h-1 rounded-full ${['processed', 'completed', 'active'].includes(doc.status?.toLowerCase()) ? 'bg-green-400' : 'bg-yellow-400'}`} />
                            <span className={['processed', 'completed', 'active'].includes(doc.status?.toLowerCase()) ? 'text-green-400/80' : 'text-yellow-400/80'}>{doc.status || 'Pending'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-silver/40">{formatDateTime(doc.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handlePreviewDoc(doc)}
                            className="text-silver/40 hover:text-neon p-1.5 rounded hover:bg-white/5 transition-all mr-1"
                            title="Preview Document"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteKnowledgeDoc(doc.doc_id)}
                            className="text-silver/40 hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-all"
                            title="Delete Document"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-t border-white/5 mt-4 shrink-0 rounded-b-lg">
              <button
                disabled={docsPage === 1}
                onClick={() => setDocsPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-mono text-silver/60 hover:text-white disabled:opacity-30 disabled:hover:text-silver/60 transition-colors border border-white/10 hover:border-white/30 rounded flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                PREV
              </button>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-silver/40 uppercase tracking-widest">
                  Page <span className="text-neon">{docsPage}</span>
                </span>
              </div>
              <button
                disabled={knowledgeDocs.length < 15}
                onClick={() => setDocsPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-mono text-silver/60 hover:text-white disabled:opacity-30 disabled:hover:text-silver/60 transition-colors border border-white/10 hover:border-white/30 rounded flex items-center gap-2"
              >
                NEXT
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </motion.div>
      )}

              {activeView === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >

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
                          <th className="text-left px-4 py-3 font-medium">Slack Tokens</th>
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
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-mono flex items-center gap-1 ${config.slack_bot_token ? 'text-green-400' : 'text-silver/30'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${config.slack_bot_token ? 'bg-green-400' : 'bg-white/20'}`} />
                                  Bot {config.slack_bot_token ? 'xoxb-…' : 'not set'}
                                </span>
                                <span className={`text-[10px] font-mono flex items-center gap-1 ${config.slack_app_token ? 'text-neon' : 'text-silver/30'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${config.slack_app_token ? 'bg-neon' : 'bg-white/20'}`} />
                                  App {config.slack_app_token ? 'xapp-…' : 'not set'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-silver/80">{formatDate(config.created_at)}</td>
                            <td className="px-4 py-3 flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => beginEditConfig(config)}
                                className="text-neon hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setTenantToDelete(config)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete
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
                          <div className={`space-y-2 ${configForm.cloud_provider === 'aws' ? 'md:col-span-2' : ''}`}>
                            <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">
                              {configForm.cloud_provider === 'aws' ? 'AWS Assume Role' : configForm.cloud_provider === 'azure' ? 'Client ID' : 'Client Email'}
                            </label>
                            <input
                              type={configForm.cloud_provider === 'aws' ? "text" : "password"}
                              value={configForm.aws_access_key}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, aws_access_key: e.target.value }))}
                              placeholder={configForm.cloud_provider === 'aws' ? 'arn:aws:iam::account:role/role-name' : configForm.cloud_provider === 'azure' ? 'UUID...' : 'service-account@...'}
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
                            />
                          </div>

                          {configForm.cloud_provider !== 'aws' && (
                            <div className="space-y-2">
                              <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">
                                {configForm.cloud_provider === 'azure' ? 'Client Secret' : 'Private Key'}
                              </label>
                              <input
                                type="password"
                                value={configForm.aws_secret_access_key}
                                onChange={(e) => setConfigForm((prev) => ({ ...prev, aws_secret_access_key: e.target.value }))}
                                placeholder="••••••••••••"
                                className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 border border-white/10 rounded-lg p-4">
                          <label className="font-mono text-[10px] text-silver/40 uppercase tracking-[0.2em] block">Slack Integration</label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="font-mono text-[10px] text-silver/60 uppercase tracking-[0.15em] block">slack_channel</label>
                              <input
                                type="text"
                                value={configForm.slack_channel}
                                onChange={(e) => setConfigForm((prev) => ({ ...prev, slack_channel: e.target.value }))}
                                placeholder="#aiops-alerts"
                                className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="font-mono text-[10px] text-silver/60 uppercase tracking-[0.15em] block">
                                slack_bot_token
                                <span className="ml-2 text-silver/30 normal-case tracking-normal">Bot User OAuth Token (xoxb-…)</span>
                              </label>
                              <input
                                type="password"
                                value={configForm.slack_bot_token}
                                onChange={(e) => setConfigForm((prev) => ({ ...prev, slack_bot_token: e.target.value }))}
                                placeholder={editingTenantId ? '(unchanged)' : 'xoxb-...'}
                                className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-silver/60 uppercase tracking-[0.15em] block">
                              slack_app_token
                              <span className="ml-2 text-silver/30 normal-case tracking-normal">App-Level Token for Socket Mode (xapp-…)</span>
                            </label>
                            <input
                              type="password"
                              value={configForm.slack_app_token}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, slack_app_token: e.target.value }))}
                              placeholder={editingTenantId ? '(unchanged)' : 'xapp-...'}
                              className="w-full bg-navy border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 font-mono"
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
        </motion.div>
      )}
      </AnimatePresence>

      {activeView === 'management' && isAdmin && (() => {
        const statusColors = {
          Active: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
          Warning: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
          Maintenance: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        }
        const postureColors = {
          Healthy: 'text-green-400',
          Locked: 'text-blue-400',
        }
        const getPostureColor = (p) => postureColors[p] || 'text-yellow-400'
        const getStatusStyle = (s) => statusColors[s] || { text: 'text-silver/50', bg: 'bg-white/5', border: 'border-white/10' }

        return (
          <motion.div
            key="management"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Tenants', value: statsSummary.total_tenants, accent: 'text-neon' },
                { label: 'Managed Nodes', value: statsSummary.total_managed_nodes.toLocaleString(), accent: 'text-blue-400' },
                { label: 'Avg Security Score', value: statsSummary.avg_security_score, accent: 'text-green-400' },
                { label: 'Critical Actions', value: statsSummary.critical_action_required, accent: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="neon-border rounded-lg p-5 bg-navy-light/50 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                  <p className="font-mono text-[10px] text-silver/40 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-2xl font-display font-bold ${stat.accent}`}>{stat.value}</p>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon/5 group-hover:bg-neon/20 transition-all" />
                </div>
              ))}
            </div>

            {/* Client Table */}
            <div className="neon-border rounded-lg bg-navy-light overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <h2 className="font-display font-bold text-xl text-white">Client Management Console</h2>
                <span className="ml-auto font-mono text-[10px] text-silver/30 uppercase tracking-widest">{clients.length} tenants</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-xs border-separate border-spacing-y-1 p-4">
                  <thead>
                    <tr className="text-silver/30 uppercase tracking-[0.15em] text-[9px]">
                      <th className="px-4 py-3">Organization</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Environment</th>
                      <th className="px-4 py-3">Region</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Security Posture</th>
                      <th className="px-4 py-3 text-center">Alerts</th>
                      <th className="px-4 py-3 text-center">Remediations</th>
                      <th className="px-4 py-3">Compliance</th>
                      <th className="px-4 py-3">Last Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const sStyle = getStatusStyle(client.status)
                      return (
                        <tr key={client.tenant_id} className="bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
                          <td className="px-4 py-4 rounded-l border-y border-l border-white/5">
                            <p className="font-bold text-white group-hover:text-neon transition-colors">{client.organization}</p>
                            <p className="text-[9px] text-silver/30 mt-0.5 truncate max-w-[140px]">{client.tenant_id.slice(0,8)}…</p>
                          </td>
                          <td className="px-4 py-4 border-y border-white/5 text-silver/50 truncate max-w-[160px]">{client.contact_email}</td>
                          <td className="px-4 py-4 border-y border-white/5 text-silver/60">{client.environment}</td>
                          <td className="px-4 py-4 border-y border-white/5 text-silver/60">{client.region}</td>
                          <td className="px-4 py-4 border-y border-white/5">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest border ${sStyle.text} ${sStyle.bg} ${sStyle.border}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className={`px-4 py-4 border-y border-white/5 ${getPostureColor(client.security_posture)}`}>
                            {client.security_posture}
                          </td>
                          <td className="px-4 py-4 border-y border-white/5 text-center">
                            <span className={client.active_alerts > 5 ? 'text-red-400 font-bold' : client.active_alerts > 0 ? 'text-yellow-400' : 'text-green-400'}>
                              {client.active_alerts}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-y border-white/5 text-center text-silver/60">
                            {client.total_remediations.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 border-y border-white/5 text-silver/50">{client.compliance_level}</td>
                          <td className="px-4 py-4 rounded-r border-y border-r border-white/5 text-silver/40">
                            {formatDateTime(client.last_sync)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )
      })()}

            <Footer isAdmin={true} />
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tenantToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-md bg-navy-light border border-red-500/30 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.15)] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                  <svg className="w-8 h-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="font-display font-bold text-xl uppercase tracking-widest text-white">Delete Tenant</h3>
                </div>
                
                <p className="text-silver/70 tracking-wide text-sm leading-relaxed mb-6 font-mono">
                  Are you absolutely sure you want to delete <br />
                  <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded inline-block mt-2 font-display">{tenantToDelete.name}</span>?
                  <br /><br />
                  This action cannot be undone and will immediately cease monitoring for this tenant.
                </p>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <button
                    onClick={() => setTenantToDelete(null)}
                    className="px-5 py-2.5 rounded font-display font-medium text-xs tracking-widest uppercase text-silver/70 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(tenantToDelete)}
                    className="px-5 py-2.5 rounded font-display font-bold text-xs tracking-widest uppercase bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Knowledge Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="bg-[#0d1525] border border-white/10 rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white font-medium truncate">{previewDoc.filename}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-silver/60 uppercase shrink-0">
                  {previewDoc.file_type}
                </span>
              </div>
              <button
                onClick={closePreview}
                className="text-silver/40 hover:text-white p-1.5 rounded hover:bg-white/5 transition-all shrink-0 ml-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {previewLoading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {previewError && !previewLoading && (
                <div className="p-6 text-red-400 text-sm">{previewError}</div>
              )}
              {!previewLoading && !previewError && previewDoc.file_type === 'pdf' && previewPdfUrl && (
                <iframe
                  src={previewPdfUrl}
                  className="w-full border-0"
                  style={{ minHeight: '600px' }}
                  title={previewDoc.filename}
                />
              )}
              {!previewLoading && !previewError && previewDoc.file_type !== 'pdf' && (
                <pre className="whitespace-pre-wrap font-mono text-xs text-silver/80 p-5 leading-relaxed">
                  {previewContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Source Logs Modal */}
      {logModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setLogModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl bg-[#0d1525] border border-white/10 rounded-xl shadow-2xl flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <div className="text-xs font-mono text-neon uppercase tracking-widest mb-1">CloudWatch Source Logs</div>
                <div className="text-[10px] text-silver/40 font-mono truncate max-w-lg">
                  {logSourceDetails[logModal.logId]?.cloudwatch?.resource_id
                    ? `${logSourceDetails[logModal.logId].cloudwatch.resource_id} — ${logSourceDetails[logModal.logId].cloudwatch.event_count} events — last ${logSourceDetails[logModal.logId].cloudwatch.lookback_seconds}s`
                    : logModal.rca_summary?.slice(0, 80)}
                </div>
              </div>
              <button onClick={() => setLogModal(null)} className="text-silver/40 hover:text-white transition-colors ml-4 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Search bar */}
            <div className="px-5 py-3 border-b border-white/5 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Search log lines..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-[11px] font-mono text-silver/80 placeholder-silver/20 focus:outline-none focus:border-neon/40 focus:bg-white/[0.07] transition-all"
                  autoFocus
                />
                {logSearchQuery && (
                  <button onClick={() => setLogSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver/30 hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              {logSearchQuery && logSourceDetails[logModal.logId]?.cloudwatch?.log_lines && (
                <div className="text-[9px] text-silver/30 mt-1 font-mono">
                  {logSourceDetails[logModal.logId].cloudwatch.log_lines.filter(l => l.toLowerCase().includes(logSearchQuery.toLowerCase())).length} matches
                </div>
              )}
            </div>

            {/* Log content */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-4">
              {loadingLogId === logModal.logId ? (
                <div className="flex items-center justify-center py-16 text-silver/30 text-xs font-mono">
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Loading logs…
                </div>
              ) : logSourceDetails[logModal.logId]?.cloudwatch?.log_lines?.length > 0 ? (() => {
                const lines = logSourceDetails[logModal.logId].cloudwatch.log_lines
                const q = logSearchQuery.toLowerCase()
                const filtered = q ? lines.filter(l => l.toLowerCase().includes(q)) : lines
                if (filtered.length === 0) return (
                  <div className="text-center text-silver/20 italic text-xs py-16 font-mono">No lines match "{logSearchQuery}"</div>
                )
                return (
                  <table className="w-full border-separate border-spacing-0">
                    <tbody>
                      {filtered.map((line, idx) => {
                        const isError = /error|exception|fatal|critical/i.test(line)
                        const isWarn = /warn/i.test(line)
                        const parts = q ? line.split(new RegExp(`(${logSearchQuery})`, 'gi')) : [line]
                        return (
                          <tr key={idx} className={`group ${isError ? 'bg-red-900/10' : isWarn ? 'bg-yellow-900/10' : 'hover:bg-white/[0.02]'}`}>
                            <td className="pr-4 py-0.5 text-right text-[9px] font-mono text-silver/20 select-none w-10 shrink-0">{idx + 1}</td>
                            <td className={`py-0.5 font-mono text-[10px] leading-relaxed break-all ${isError ? 'text-red-400/80' : isWarn ? 'text-yellow-400/80' : 'text-silver/60'}`}>
                              {q ? parts.map((p, i) =>
                                p.toLowerCase() === q
                                  ? <mark key={i} className="bg-neon/30 text-neon rounded px-0.5">{p}</mark>
                                  : p
                              ) : line}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })() : (
                <div className="text-center text-silver/20 italic text-xs py-16 font-mono">No source logs available for this entry</div>
              )}
            </div>

            {/* Footer */}
            {logSourceDetails[logModal.logId]?.cloudwatch?.fetched_at && (
              <div className="px-5 py-2.5 border-t border-white/5 shrink-0 text-[9px] font-mono text-silver/20">
                Fetched at {logSourceDetails[logModal.logId].cloudwatch.fetched_at}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}