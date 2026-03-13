import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import LegalModal from './LegalModal'
import { legalContent } from '../data/legalData'

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null) // null | 'privacy' | 'terms' | 'rights'

  const closeModal = () => setActiveModal(null)

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-neon/10 bg-[#060910]">
      {/* Background Decor */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-6">
              <img 
                src="/image/trust/ntq_solution_jsc_logo.jpeg" 
                alt="NTQ Solution" 
                className="h-12 w-auto object-contain bg-white p-1.5 rounded shadow-lg" 
              />
              <p className="text-silver/50 text-sm leading-relaxed max-w-sm">
                NTQ Technology - Driving innovation and digital transformation through cutting-edge technology solutions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.8)]" />
              <span className="font-display font-bold text-xs text-white tracking-[0.2em] uppercase">Building the Future</span>
            </div>
          </div>

          {/* DIVISIONS */}
          <div className="md:col-span-2">
            <h4 className="font-display font-bold text-white text-xs tracking-[0.3em] uppercase mb-8">Divisions</h4>
            <ul className="space-y-4">
              {['ITP', 'SSD', 'AI', 'Cloud', 'Security', 'R&D'].map((item) => (
                <li key={item} className="flex items-center gap-3 group cursor-pointer">
                  <span className="w-1 h-1 bg-white/20 group-hover:bg-neon transition-colors" />
                  <span className="font-mono text-[11px] text-silver/40 group-hover:text-silver transition-colors uppercase tracking-wider last:cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="md:col-span-2">
            <h4 className="font-display font-bold text-white text-xs tracking-[0.3em] uppercase mb-8">Quick Links</h4>
            <ul className="space-y-4">
              {['NxUniverse', 'R&D', 'Our Team', 'Partners'].map((item) => (
                <li key={item}>
                  <a href="#" className="font-mono text-[11px] text-silver/40 hover:text-silver transition-colors uppercase tracking-wider block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT US */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-white text-xs tracking-[0.3em] uppercase mb-8">Contact Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <svg className="w-5 h-5 text-neon/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-silver/50 text-sm leading-relaxed">
                  10F, Tower B, Song Da Building (HH4), Pham Hung Street, My Dinh 1 Ward, Nam Tu Liem District, Hanoi
                </span>
              </li>
              <li className="flex items-center gap-4">
                <svg className="w-5 h-5 text-neon/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-silver/50 text-sm">(+84) 24 3200 8754</span>
              </li>
              <li className="flex items-center gap-4">
                <svg className="w-5 h-5 text-neon/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-silver/50 text-sm">contact@ntq-solution.com.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-8">
          <div className="text-silver/20 font-mono text-[11px] tracking-widest uppercase">
            © 2026 NTQ Solution. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="font-mono text-[11px] text-silver/40 hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal('terms')}
              className="font-mono text-[11px] text-silver/40 hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setActiveModal('rights')}
              className="font-mono text-[11px] text-silver/40 hover:text-white transition-colors"
            >
              Your Privacy Rights
            </button>
            <Link 
              to="/trust" 
              className="font-mono text-[11px] text-silver/40 hover:text-neon transition-colors flex items-center gap-2 group"
            >
              <span className="w-1 h-1 rounded-full bg-neon group-hover:animate-pulse" />
              Trust Center
            </Link>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal 
        isOpen={!!activeModal} 
        onClose={closeModal}
        title={activeModal ? legalContent[activeModal].title : ''}
        content={activeModal ? legalContent[activeModal].content : ''}
        lastUpdated={activeModal ? legalContent[activeModal].lastUpdated : ''}
      />
    </footer>
  )
}
