import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProblemSection from '../components/ProblemSection'
import SolutionSection from '../components/SolutionSection'
import PricingSection from '../components/PricingSection'
import Footer from '../components/Footer'
import LoginModal from '../components/LoginModal'

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <>
      <Header onLoginClick={() => setLoginOpen(true)} />
      
      <main className="relative z-10">
        <Hero onDemoClick={() => setLoginOpen(true)} />
        <ProblemSection />
        <SolutionSection />
        <PricingSection onGetStarted={() => setLoginOpen(true)} />
      </main>

      <Footer />

      <AnimatePresence>
        {loginOpen && (
          <LoginModal onClose={() => setLoginOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
