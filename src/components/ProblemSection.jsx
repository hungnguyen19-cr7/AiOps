import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const painPoints = [
  {
    id: 'burnout',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.62a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.46z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: 'DevOps Burnout',
    subtitle: 'On-call 24/7 – Instant pressure',
    description: 'Engineers handle hundreds of alerts overnight, leading to exhaustion, high attrition rates, and severe operational impact.',
    stat: '73%',
    statLabel: 'DevOps burnout rate',
    accentColor: '#FF4A4A',
  },
  {
    id: 'alert-fatigue',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Alert Fatigue',
    subtitle: 'Thousands of noisy alerts',
    description: 'Systems generate excessive meaningless alerts, causing engineering teams to lose the ability to distinguish real incidents from noise.',
    stat: '99%',
    statLabel: 'Alerts are false positives',
    accentColor: '#FFD700',
  },
  {
    id: 'slow-response',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Slow Response',
    subtitle: 'Manual processes waste time',
    description: 'Manual runbooks and multi-layer approval escalation extend MTTR, directly impacting SLAs and business costs.',
    stat: '287 min',
    statLabel: 'Avg MTTR without AI',
    accentColor: '#FF8C42',
  },
  {
    id: 'human-dep',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Human Dependency',
    subtitle: 'No intelligent automation',
    description: 'Every decision requires manual human intervention. Systems cannot self-learn, self-optimize, or handle context-aware remediation.',
    stat: '0%',
    statLabel: 'Intelligent automation',
    accentColor: '#B44FFF',
  },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="problem" ref={ref} className="py-24 relative overflow-hidden">
      {/* Section background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-light/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs tracking-[0.4em] text-neon/60 uppercase mb-4 block">
            // the_problem
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-white mb-4">
            The Pain Points of <span className="gradient-text">DevOps Teams</span>
          </h2>
          <p className="text-silver/60 max-w-xl mx-auto text-base font-light leading-relaxed">
            Every day, tens of thousands of alerts flood in. It's not a lack of data —
            it's a lack of <strong className="text-silver/80">intelligence to act on it</strong>.
          </p>
        </motion.div>

        {/* Pain Point Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-shimmer neon-border rounded-lg p-6 bg-navy-light flex flex-col gap-4 cursor-default"
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${point.accentColor}15`,
                  border: `1px solid ${point.accentColor}30`,
                  color: point.accentColor,
                  boxShadow: `0 0 20px ${point.accentColor}15`,
                }}
              >
                {point.icon}
              </div>

              {/* Stat */}
              <div>
                <div
                  className="font-display font-black text-3xl"
                  style={{ color: point.accentColor }}
                >
                  {point.stat}
                </div>
                <div className="font-mono text-xs text-silver/40 tracking-wider">{point.statLabel}</div>
              </div>

              {/* Title & desc */}
              <div>
                <h3 className="font-display font-bold text-white text-sm tracking-wide mb-1">{point.title}</h3>
                <p className="text-silver/40 text-xs font-mono tracking-wider mb-2">{point.subtitle}</p>
                <p className="text-silver/60 text-sm leading-relaxed font-light">{point.description}</p>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-px w-full mt-auto"
                style={{ background: `linear-gradient(90deg, ${point.accentColor}60, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
