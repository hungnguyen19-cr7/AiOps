import React from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
}

function NetworkNode({ x, y, size = 6, delay = 0 }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2 + delay, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-full bg-neon"
        style={{ width: size, height: size, boxShadow: '0 0 12px rgba(0,255,170,0.9)' }}
      />
    </motion.div>
  )
}

export default function Hero({ onDemoClick }) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] top-[-100px] left-[-200px] bg-neon/5" />
      <div className="orb w-[400px] h-[400px] bottom-[-50px] right-[-100px] bg-blue-500/5" />

      {/* Network nodes decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <NetworkNode x={10} y={20} size={8} delay={0.2} />
        <NetworkNode x={85} y={15} size={5} delay={0.5} />
        <NetworkNode x={90} y={60} size={8} delay={0.3} />
        <NetworkNode x={75} y={80} size={4} delay={0.7} />
        <NetworkNode x={20} y={75} size={6} delay={0.4} />
        <NetworkNode x={5} y={55} size={4} delay={0.9} />
        <NetworkNode x={50} y={8} size={5} delay={0.6} />

        {/* Connection lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <motion.line
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            x1="10%" y1="20%" x2="50%" y2="8%"
            stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 4"
          />
          <motion.line
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.8 }}
            x1="85%" y1="15%" x2="90%" y2="60%"
            stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 4"
          />
          <motion.line
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1.0 }}
            x1="90%" y1="60%" x2="75%" y2="80%"
            stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 4"
          />
          <motion.line
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1.2 }}
            x1="20%" y1="75%" x2="5%" y2="55%"
            stroke="#00FFAA" strokeWidth="1" strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center w-full">
        {/* Left: Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 neon-border text-neon text-xs font-mono tracking-widest uppercase px-4 py-1.5 rounded-sm">
              <span className="w-2 h-2 bg-neon rounded-full animate-pulse" />
              AI-Powered DevOps Automation
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-bold text-4xl md:text-5xl xl:text-6xl leading-[1.1] text-white"
          >
            Agentic AIOps:
            <br />
            <span className="gradient-text">From Alert to Action</span>
            <br />
            <span className="text-silver/80 text-3xl md:text-4xl xl:text-5xl">– with AI Agents</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            className="text-silver/70 text-base md:text-lg leading-relaxed max-w-lg font-body font-light"
          >
            An AI solution capable of <strong className="text-silver font-semibold">reasoning and taking action</strong>, rescuing DevOps teams
            from <span className="text-neon">Burnout</span> and <span className="text-neon">Alert Fatigue</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
            <motion.button
              id="hero-free-trial"
              onClick={onDemoClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-neon bg-neon text-navy font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 rounded-sm transition-all duration-300"
              style={{ boxShadow: '0 0 30px rgba(0,255,170,0.5)' }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              id="hero-demo"
              onClick={onDemoClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-neon border border-neon/40 text-neon font-display font-semibold text-sm tracking-widest uppercase px-8 py-3.5 rounded-sm hover:border-neon/80 transition-all duration-300"
            >
              Watch Demo →
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex gap-8 pt-4 border-t border-neon/10">
            {[
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '<2 min', label: 'Mean Response' },
              { value: '10x', label: 'Faster Resolution' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-xl text-neon glow-text">{stat.value}</div>
                <div className="text-silver/50 text-xs font-mono tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Animated AI Dashboard visualization */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="relative flex items-center justify-center float-anim"
        >
          <div
            className="relative w-full max-w-md neon-border rounded-lg p-6 bg-navy-light"
            style={{ boxShadow: '0 0 60px rgba(0,255,170,0.1), 0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* Scan line */}
            <div className="scan-line" />

            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-neon/70" />
              </div>
              <span className="font-mono text-xs text-silver/40 tracking-widest">AIOPS.TERMINAL</span>
            </div>

            {/* Alert feed */}
            <div className="space-y-3 mb-5">
              {[
                { type: 'CRITICAL', msg: 'CPU spike 98% — pod:backend-7f4d', status: 'RESOLVING', color: 'red' },
                { type: 'WARNING', msg: 'Memory pressure detected — node:k8s-01', status: 'ANALYZED', color: 'yellow' },
                { type: 'INFO', msg: 'Auto-scaling triggered — 3 pods added', status: '✓ RESOLVED', color: '#00FFAA' },
              ].map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.2 }}
                  className="flex items-start gap-3 p-3 rounded border border-white/5 bg-white/3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <span
                    className="text-xs font-mono font-bold tracking-widest shrink-0 mt-0.5"
                    style={{ color: alert.color === 'red' ? '#FF4A4A' : alert.color === 'yellow' ? '#FFD700' : '#00FFAA' }}
                  >
                    {alert.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-silver/80 text-xs font-mono truncate">{alert.msg}</div>
                    <div
                      className="text-xs font-mono mt-1"
                      style={{ color: alert.color === '#00FFAA' ? '#00FFAA' : 'rgba(200,214,229,0.5)' }}
                    >
                      {alert.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Agent thinking */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="border border-neon/20 rounded p-3 bg-neon/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neon rounded-full animate-pulse" />
                <span className="font-display text-neon text-xs tracking-widest font-semibold">AI AGENT — ACTIVE</span>
              </div>
              <div className="font-mono text-xs text-silver/60 space-y-1">
                <div><span className="text-neon/60">→</span> Analyzing root cause...</div>
                <div><span className="text-neon/60">→</span> Executing kubectl scale deployment...</div>
                <div><span className="text-neon">→</span> <span className="text-neon">Awaiting human approval via Slack</span></div>
              </div>
            </motion.div>

            {/* Bottom stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Alerts/hr', value: '2,400' },
                { label: 'Auto-resolved', value: '94%' },
                { label: 'MTTR', value: '1.8m' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 border border-white/5 rounded">
                  <div className="font-display font-bold text-neon text-sm">{s.value}</div>
                  <div className="font-mono text-silver/40 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
