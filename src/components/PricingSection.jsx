import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$500',
    period: '/month',
    tagline: 'Perfect for small teams',
    popular: false,
    features: [
      'Up to 5 Kubernetes clusters',
      'Alert correlation & dedup',
      'AI root cause analysis',
      'Slack integration',
      '10,000 alerts/month',
      'Email support (48h)',
      'Basic dashboard',
    ],
    missing: ['Auto-remediation', 'SSO', 'SLA 99.99%'],
    cta: 'Start Free Trial',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '$1,500',
    period: '/month',
    tagline: 'For growing enterprises',
    popular: true,
    features: [
      'Unlimited clusters',
      'Auto-remediation with HITL',
      'AI root cause + predictive',
      'Slack, Teams, PagerDuty',
      '100,000 alerts/month',
      'Priority support (4h)',
      'Advanced analytics',
      'SSO (AWS/GCP/Azure)',
      'Custom AI runbooks',
    ],
    missing: ['White-label'],
    cta: 'Try Advanced',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For large enterprises',
    popular: false,
    features: [
      'All Advanced features',
      'White-label & on-premise',
      'Custom AI model training',
      'Dedicated support (1h)',
      'Unlimited alerts',
      'SLA 99.99% guarantee',
      'Security audit & DPA',
      'Multi-region deployment',
      'Custom integrations',
    ],
    missing: [],
    cta: 'Contact Sales',
  },
]

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-silver/20 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function PricingSection({ onGetStarted }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="pricing" ref={ref} className="py-24 relative overflow-hidden">
      <div className="orb w-[600px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 bg-neon/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs tracking-[0.4em] text-neon/60 uppercase mb-4 block">
            // pricing_plans
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl xl:text-5xl text-white mb-4">
            Features &amp; <span className="gradient-text">Pricing Plans</span>
          </h2>
          <p className="text-silver/60 max-w-lg mx-auto text-base font-light">
            Transparent. No hidden fees. Scale as your business grows.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative card-shimmer rounded-lg flex flex-col ${
                plan.popular
                  ? 'pricing-popular border border-neon/40 scale-105 z-10'
                  : 'neon-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-neon text-navy font-display font-bold text-xs tracking-widest uppercase px-5 py-1.5 rounded-sm shadow-neon">
                    ✦ MOST POPULAR
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col gap-5 flex-1">
                {/* Plan name & tagline */}
                <div>
                  <div className="font-mono text-xs text-silver/40 tracking-widest uppercase mb-1">{plan.tagline}</div>
                  <h3 className={`font-display font-bold text-2xl ${plan.popular ? 'text-neon' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1.5 border-b border-white/5 pb-5">
                  <span className={`font-display font-black text-4xl ${plan.popular ? 'glow-text text-neon' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-silver/40 text-sm font-mono pb-1">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className="text-silver/70 text-sm">{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <XIcon />
                      <span className="text-silver/30 text-sm line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  id={`pricing-cta-${plan.id}`}
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3.5 rounded-sm font-display font-bold text-sm tracking-widest uppercase transition-all duration-300 ${
                    plan.popular
                      ? 'bg-neon text-navy hover:bg-neon/90 shadow-neon'
                      : 'btn-neon border border-neon/30 text-neon hover:border-neon/60'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center text-silver/30 text-xs font-mono mt-8 tracking-wider"
        >
          * All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
