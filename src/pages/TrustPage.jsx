import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const certs = [
  {
    title: 'SOC 2 Type II',
    status: 'Certified',
    desc: 'Rigorous independent audit of our security, availability, and confidentiality controls.',
    icon: '🛡️'
  },
  {
    title: 'ISO 27001',
    status: 'Compliant',
    desc: 'International standard for information security management systems (ISMS).',
    icon: '🌐'
  },
  {
    title: 'GDPR',
    status: 'Active',
    desc: 'Strict adherence to European data protection and privacy regulations.',
    icon: '⚖️'
  },
  {
    title: 'Encryption',
    status: 'AES-256',
    desc: 'Military-grade encryption for all data at rest and in transit.',
    icon: '🔐'
  }
]

export default function TrustPage() {
  const navigate = useNavigate()

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col pt-24 pb-16 px-6">
      <Header />

      <div className="max-w-5xl mx-auto w-full space-y-16 mt-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <span className="font-mono text-neon/60 text-xs tracking-[0.4em] uppercase">
            // security_compliance_portal
          </span>
          <h1 className="font-display font-bold text-5xl text-white">
            Trust & <span className="text-neon">Security Center</span>
          </h1>
          <p className="font-mono text-silver/60 text-sm max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade security is baked into our DNA. We maintain the highest standards of data protection to ensure your infrastructure and knowledge are always safe.
          </p>
        </motion.div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, borderColor: 'rgba(0, 255, 170, 0.4)' }}
              className="neon-border p-6 bg-navy-light rounded-lg group transition-all"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {cert.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-1">{cert.title}</h3>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-neon/10 border border-neon/30 rounded text-neon font-mono text-[9px] uppercase tracking-widest mb-4">
                <span className="w-1 h-1 rounded-full bg-neon animate-pulse" />
                {cert.status}
              </div>
              <p className="font-mono text-[11px] text-silver/50 leading-relaxed">
                {cert.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-neon" />
              Data Sovereignty
            </h2>
            <div className="space-y-4 font-mono text-xs text-silver/70 leading-relaxed">
              <p>
                We believe you should own your data. Our platform is designed with data isolation in mind, ensuring that your knowledge base is never mixed with other tenants.
              </p>
              <ul className="space-y-2 list-disc list-inside text-silver/50">
                <li>Isolated VPC environments per enterprise client</li>
                <li>Encryption keys managed via HSM-backed vaults</li>
                <li>Automatic data scrubbing and ephemeral processing</li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              Continuous Auditing
            </h2>
            <div className="space-y-4 font-mono text-xs text-silver/70 leading-relaxed">
              <p>
                Security isn't a one-time event. We perform continuous automated scanning and regular third-party penetration testing to stay ahead of threats.
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-white text-[10px] uppercase font-bold tracking-widest mb-1">Last External Audit</div>
                  <div className="text-neon text-xs">March 10, 2024 - Passed</div>
                </div>
                <button 
                  onClick={() => alert('Report download requested.')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-silver hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Call */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neon/5 border border-neon/20 rounded-2xl p-12 text-center space-y-6 mt-12"
        >
          <h2 className="font-display font-bold text-3xl text-white">Questions about our architecture?</h2>
          <p className="font-mono text-silver/60 text-sm max-w-xl mx-auto">
            Our security team is ready to assist with your DDQ (Due Diligence Questionnaires) and security reviews.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-lg transition-all hover:bg-neon/90 hover:shadow-[0_0_30px_rgba(0,255,170,0.3)]">
              Contact Security Team
            </button>
            <button 
              onClick={() => navigate('/')}
              className="border border-white/10 text-white font-display font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-lg transition-all hover:bg-white/5"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
