import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const oaaSteps = [
  {
    id: 'observe',
    short: 'O',
    label: 'Observe',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Observe',
    desc: 'Collect metrics, logs, and traces from the entire system. Detect anomalies in real-time with zero false negatives.',
    detail: 'Prometheus · Loki · Tempo · OpenTelemetry',
  },
  {
    id: 'analyze',
    short: 'A',
    label: 'Analyze',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'Analyze',
    desc: 'AI Agent performs root cause analysis, assesses severity levels, and recommends high-confidence remediation actions.',
    detail: 'LLM · RAG · Knowledge Graph · Context Aware',
  },
  {
    id: 'act',
    short: 'A',
    label: 'Act',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Act',
    desc: 'Automatically execute actions: scale pods, restart services, rollback deployments — with human approval via Slack.',
    detail: 'Kubernetes · Ansible · Terraform · Slack/Teams',
  },
]

const comparisonRows = [
  { traditional: 'Reactive only (alerts)', feature: 'Response', agentic: 'Proactive root cause analysis', win: true },
  { traditional: 'Manual, static runbooks', feature: 'Remediation', agentic: 'AI auto-execute & self-learn', win: true },
  { traditional: 'MTTR 4–8 hours', feature: 'Speed', agentic: 'MTTR < 2 minutes', win: true },
  { traditional: 'High alert fatigue', feature: 'Alert Noise', agentic: 'Noise reduction > 95%', win: true },
  { traditional: 'None', feature: 'Human-in-the-Loop', agentic: 'Approve/Deny via Slack', win: true },
]

export default function SolutionSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="solution" ref={ref} className="py-24 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] top-[20%] right-[-150px] bg-neon/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs tracking-[0.4em] text-neon/60 uppercase mb-4 block">
            // the_solution
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-white mb-4">
            Agentic AIOps — <span className="gradient-text">Think &amp; Act</span>
          </h2>
          <p className="text-silver/60 max-w-2xl mx-auto text-base font-light">
            Not just alerting — but <strong className="text-silver/80">self-analyzing, planning, and executing tasks</strong> like a real DevOps engineer, 24/7.
          </p>
        </motion.div>

        {/* O-A-A Flow */}
        <div className="relative mb-20">
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector lines */}
            <div className="absolute top-1/2 left-1/3 right-1/3 h-px hidden md:block" style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,170,0.5), rgba(0,255,170,0.5), transparent)',
            }} />

            {oaaSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.18 }}
                className="relative card-shimmer neon-border rounded-lg p-7 bg-navy-light flex flex-col gap-4"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-6">
                  <span
                    className="font-display font-black text-5xl leading-none"
                    style={{ color: 'rgba(0,255,170,0.1)', WebkitTextStroke: '1px rgba(0,255,170,0.3)' }}
                  >
                    {step.short}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded border border-neon/30 flex items-center justify-center text-neon bg-neon/10">
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-mono text-neon/60 text-xs tracking-widest">{step.label.toUpperCase()}</div>
                    <h3 className="font-display font-bold text-white text-sm">{step.title}</h3>
                  </div>
                </div>

                <p className="text-silver/60 text-sm leading-relaxed font-light">{step.desc}</p>

                <div className="mt-auto pt-3 border-t border-neon/10">
                  <div className="font-mono text-xs text-neon/50 tracking-wider">{step.detail}</div>
                </div>

                {/* Arrow between cards (mobile) */}
                {i < oaaSteps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-neon/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="font-display font-bold text-xl text-white text-center mb-8">
            Traditional Monitoring <span className="text-silver/30 mx-3">vs</span> <span className="text-neon">Agentic AIOps</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs text-silver/40 tracking-widest border-b border-white/5">
                    TRADITIONAL MONITORING
                  </th>
                  <th className="text-center py-3 px-4 font-mono text-xs text-silver/40 tracking-widest border-b border-white/5">
                    CRITERIA
                  </th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-neon/60 tracking-widest border-b border-neon/20">
                    AGENTIC AIOPS
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <td className="py-4 px-4 text-silver/40 text-sm line-through group-hover:text-silver/50 transition-colors">
                      {row.traditional}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-xs text-silver/50 tracking-widest bg-white/5 px-3 py-1 rounded">
                        {row.feature}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-neon text-sm font-medium">
                      ✓ {row.agentic}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Human-in-the-Loop Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="pulse-border neon-border rounded-lg p-8 bg-neon/5 relative overflow-hidden"
        >
          <div className="scan-line" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="shrink-0 w-16 h-16 rounded border border-neon/30 bg-neon/10 flex items-center justify-center text-neon glow-text text-2xl font-display font-bold">
              HIL
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-white text-xl mb-2">
                Human-in-the-Loop — <span className="text-neon">Absolute Safety</span>
              </h3>
              <p className="text-silver/60 text-sm leading-relaxed">
                AI proposes actions, but <strong className="text-silver/80">humans always retain the right to Approve or Deny</strong> directly via Slack/Microsoft Teams.
                No automated action is executed without your explicit consent.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              {['✅ Approve', '❌ Deny'].map((action) => (
                <div key={action} className="neon-border rounded px-6 py-2.5 text-sm font-mono text-silver/70 text-center">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
