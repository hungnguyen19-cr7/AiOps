import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const resources = [
  { title: 'SOC 2 Type 2 Report - 2025', icon: '📄', type: 'PDF' },
  { title: 'W-9 Form', icon: '📝', type: 'PDF' },
  { title: 'Tax Residency Certificate', icon: '🏛️', type: 'PDF' },
  { title: 'Privacy Policy', icon: '🔒', type: 'Link' },
]

const controls = [
  {
    category: 'Infrastructure Security',
    items: ['Unique production database authentication enforced', 'Unique account authentication enforced', 'Production application access restricted'],
    icon: '☁️'
  },
  {
    category: 'Organizational Security',
    items: ['Performance evaluations conducted', 'MDM system utilized', 'Security awareness training'],
    icon: '🏢'
  },
  {
    category: 'Product Security',
    items: ['Data encryption utilized at rest & transit', 'Control self-assessments conducted', 'Automated vulnerability scanning'],
    icon: '🛡️'
  },
  {
    category: 'Internal Security',
    items: ['Cybersecurity insurance maintained', 'Configuration management system established', 'Change management procedures enforced'],
    icon: '⚙️'
  }
]

const subprocessors = [
  { name: 'Google Cloud Platform', role: 'Primary Cloud Provider', location: 'USA', handles: 'Meeting Content (Recording, Transcript)', isAI: false },
  { name: 'Anthropic', role: 'AI Provider', location: 'USA', handles: 'Meeting Content Data', isAI: true },
  { name: 'OpenAI', role: 'AI Provider', location: 'USA', handles: 'Meeting Content Data', isAI: true },
  { name: 'Voyage AI', role: 'AI Provider', location: 'USA', handles: 'Meeting Content Data', isAI: true },
]

const faqs = [
  {
    q: 'Where do you store data?',
    a: 'All data is stored in the United States. For those customers located in the EU/UK we are GDPR compliant and are happy to sign a DPA. Contact trust@yourdomain.com.'
  },
  {
    q: 'How long is my data retained?',
    a: 'We retain your recordings and other data indefinitely unless you manually delete individual recordings or your account. Specific retention requirements (e.g. purge all recordings after 2 years) are supported on our Enterprise plan.'
  },
  {
    q: 'What happens to my data if I delete my account?',
    a: 'When you delete your account, all recording data (video, transcripts) and metadata is removed immediately. After an additional 7 days, all data is completely purged from our backups as well.'
  }
]

export default function TrustPage() {
  const navigate = useNavigate()
  const [activeFaq, setActiveFaq] = useState(null)

  return (
    <div className="relative z-10 min-h-screen bg-navy flex flex-col pt-24 pb-16 px-6">
      <Header />

      <div className="max-w-5xl mx-auto w-full space-y-20 mt-4">
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
            Welcome! If you have any questions check out our FAQ at the bottom of the page or contact our security team. For system status please visit our status page.
          </p>
        </motion.div>

        {/* Other Resources */}
        <section>
          <h2 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-neon" />
            Compliance Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((res, i) => (
              <motion.div
                key={res.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2, borderColor: 'rgba(0, 255, 170, 0.4)' }}
                className="neon-border p-4 bg-navy-light rounded-lg cursor-pointer group transition-all flex items-center gap-3"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {res.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{res.title}</h3>
                  <span className="text-[10px] text-neon font-mono uppercase tracking-wider">{res.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security Controls */}
        <section>
          <h2 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            Security Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {controls.map((control, i) => (
              <motion.div
                key={control.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{control.icon}</span>
                  <h3 className="font-display font-bold text-lg text-white">{control.category}</h3>
                </div>
                <ul className="space-y-3">
                  {control.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-mono text-xs text-silver/70">
                      <span className="text-neon mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Subprocessors */}
        <section>
          <h2 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            Subprocessors
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subprocessors.map((sub, i) => (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-navy-light border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-base">{sub.name}</h3>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-silver font-mono uppercase tracking-wider">
                    {sub.location}
                  </span>
                </div>
                <div className="text-xs text-silver/60 font-mono mb-3">
                  • {sub.role}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-silver/80 font-mono">
                    <span>🔒</span> Handles {sub.handles}
                  </div>
                  {sub.isAI && (
                    <div className="flex items-center gap-2 text-[11px] text-neon font-mono bg-neon/10 w-fit px-2 py-1 rounded">
                      <span>🤖</span> Forbidden from training AI on Customer Data
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto w-full pt-8">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="border border-white/10 rounded-lg bg-navy-light overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white text-sm">{faq.q}</span>
                  <span className="text-neon text-xl font-mono">
                    {activeFaq === i ? '-' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4 font-mono text-xs text-silver/70 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Action Call */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-neon/5 border border-neon/20 rounded-2xl p-12 text-center space-y-6 mt-12"
        >
          <h2 className="font-display font-bold text-3xl text-white">Need more details?</h2>
          <p className="font-mono text-silver/60 text-sm max-w-xl mx-auto">
            Our security team is ready to assist with your DDQ (Due Diligence Questionnaires) and specific security reviews.
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