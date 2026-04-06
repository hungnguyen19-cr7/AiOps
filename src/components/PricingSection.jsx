import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '$30K',
    period: 'Year 1',
    popular: false,
    nameColor: 'text-[#00D4FF]',
    priceColor: 'text-[#00FFAA]',
    borderColor: 'border-[#00FFAA]',
    features: [
      'Onboarding: $6K (one-time)',
      'Subscription: $2K/month',
      '50 servers / nodes',
      '3 monitoring integrations',
      '20+ pre-built runbooks',
      'Support 9x5',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: '$72K',
    period: 'Year 1',
    popular: true,
    nameColor: 'text-[#00D4FF]',
    priceColor: 'text-[#00D4FF]',
    borderColor: 'border-[#00D4FF]',
    features: [
      'Onboarding: $12K (one-time)',
      'Subscription: $5K/month',
      '200 servers / nodes',
      '10 monitoring integrations',
      '50+ runbooks · 3 AI skills',
      'Support 12x5',
    ],
    cta: 'Try Professional',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: '$150K+',
    period: 'Year 1',
    popular: false,
    nameColor: 'text-[#00D4FF]',
    priceColor: 'text-[#FFD700]',
    borderColor: 'border-[#FFD700]',
    features: [
      'Onboarding: $30K+ (custom)',
      'Subscription: $10K+/month',
      'Unlimited servers',
      'Dedicated instance',
      'Support 24x7 · Named CSM',
    ],
    cta: 'Contact Sales',
  },
]

function ArrowIcon() {
  return (
    <span className="text-neon text-base leading-none mt-[2px] font-mono mr-1">&rarr;</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative flex flex-col ${plan.popular ? 'scale-105 z-10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-neon text-navy font-bold text-[10px] tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,255,170,0.5)] whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div 
                className={`card-shimmer rounded-xl flex flex-col flex-1 h-full ${
                  plan.popular
                    ? 'pricing-popular border border-neon/40 shadow-[0_0_30px_rgba(0,255,170,0.15)] bg-navy-light/90'
                    : 'neon-border bg-navy-light/40 border-white/5'
                }`}
              >
                <div className="p-8 flex flex-col gap-6 flex-1">
                {/* Plan name & tagline */}
                <div>
                  {plan.tagline && (
                    <div className="font-mono text-xs text-neon/60 tracking-widest uppercase mb-2">{plan.tagline}</div>
                  )}
                  <h3 className={`font-display font-black text-2xl tracking-wide uppercase ${plan.popular ? 'text-neon' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1 border-b border-neon/10 pb-6">
                  <span className={`font-display font-black text-[3.5rem] leading-none pt-2 pb-1 drop-shadow-[0_0_15px_currentColor] ${plan.priceColor || 'text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-silver/50 text-sm font-mono mt-2">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1 pt-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <ArrowIcon />
                      <span className="text-silver/80 text-[15px] leading-relaxed font-body">{f}</span>
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
