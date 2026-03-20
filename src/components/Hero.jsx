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

      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center w-full z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
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
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 pt-4">
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
          <motion.div variants={fadeUp} className="flex justify-center gap-8 pt-8 border-t border-neon/10 w-full max-w-xl mt-4">
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
      </div>
    </section>
  )
}
