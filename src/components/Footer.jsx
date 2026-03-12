import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const phases = [
  {
    phase: 'Phase 1',
    status: 'ACTIVE',
    title: 'Observe & Analyze',
    items: ['Alert correlation', 'AI root cause analysis', 'Multi-cluster monitoring', 'Slack/Teams integration'],
  },
  {
    phase: 'Phase 2',
    status: 'Q2 2025',
    title: 'Act & Automate',
    items: ['Auto-remediation', 'Human-in-the-Loop', 'Runbook automation', 'Predictive scaling'],
  },
  {
    phase: 'Phase 3',
    status: 'Q4 2025',
    title: 'Learn & Optimize',
    items: ['Self-learning AI', 'Capacity planning', 'Cost optimization', 'Multi-cloud support'],
  },
]

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden border-t border-neon/10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-mid pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        {/* Roadmap */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="font-mono text-xs tracking-[0.4em] text-neon/60 uppercase mb-3 block">
              // development_roadmap
            </span>
            <h3 className="font-display font-bold text-2xl text-white">Development Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phases.map((p, i) => (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`neon-border rounded-lg p-6 relative ${
                  p.status === 'ACTIVE' ? 'bg-neon/5 border-neon/40' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-bold text-white text-sm">{p.phase}</span>
                  <span className={`font-mono text-xs tracking-widest px-3 py-1 rounded-sm ${
                    p.status === 'ACTIVE'
                      ? 'bg-neon text-navy font-bold'
                      : 'border border-silver/20 text-silver/40'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <h4 className="font-display font-semibold text-neon text-sm mb-3">{p.title}</h4>
                <ul className="space-y-1.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-silver/50 text-xs font-mono">
                      <span className="text-neon/50">›</span> {item}
                    </li>
                  ))}
                </ul>

                {p.status === 'ACTIVE' && (
                  <div className="absolute top-3 right-3">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-neon rounded-full"
                      style={{ boxShadow: '0 0 8px rgba(0,255,170,0.8)' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* SLA & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 py-10 border-t border-b border-white/5">
          {/* Logo & desc */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 36 36" className="w-8 h-8">
                <polygon points="18,2 33,10 33,26 18,34 3,26 3,10" fill="none" stroke="#00FFAA" strokeWidth="1.5" />
                <polygon points="18,8 27,13 27,23 18,28 9,23 9,13" fill="rgba(0,255,170,0.1)" stroke="#00FFAA" strokeWidth="1" />
                <circle cx="18" cy="18" r="3" fill="#00FFAA" />
              </svg>
              <span className="font-display font-bold text-white">
                AGENTIC<span className="text-neon">AIOps</span>
              </span>
            </div>
            <p className="text-silver/40 text-sm leading-relaxed font-light">
              AI-Powered DevOps Automation. From Alert to Action in minutes, not hours.
            </p>

            {/* SLA Badge */}
            <div className="mt-5 inline-flex items-center gap-2 neon-border rounded px-4 py-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-neon rounded-full"
              />
              <span className="font-display font-bold text-neon text-sm">99.99%</span>
              <span className="font-mono text-silver/40 text-xs">Uptime SLA</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4 tracking-wider">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Roadmap', 'Changelog', 'Documentation'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-silver/40 text-sm hover:text-neon transition-colors font-light">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4 tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-silver/40 text-sm hover:text-neon transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-neon/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>contact@agentic-aiops.io</span>
              </li>
              <li className="flex items-center gap-2 text-silver/40 text-sm hover:text-neon transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-neon/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.043.032.056a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                </svg>
                <span>Discord Community</span>
              </li>
              <li className="flex items-center gap-2 text-silver/40 text-sm hover:text-neon transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-neon/60" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-silver/20 tracking-wider">
            © 2025 Agentic AIOps. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="font-mono text-xs text-silver/20 hover:text-neon/60 transition-colors">Privacy Policy</a>
            <a href="#" className="font-mono text-xs text-silver/20 hover:text-neon/60 transition-colors">Terms of Service</a>
            <Link to="/trust" className="font-mono text-xs text-silver/20 hover:text-neon transition-colors font-bold group flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-neon group-hover:animate-pulse" />
              Trust Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
