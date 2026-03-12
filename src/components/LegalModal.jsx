import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LegalModal({ isOpen, onClose, title, content, lastUpdated }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0f18] border border-neon/30 rounded-lg shadow-[0_0_50px_rgba(0,255,170,0.15)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <h2 className="font-display font-bold text-xl text-neon tracking-wider uppercase">
                {title}
              </h2>
              {lastUpdated && (
                <p className="font-mono text-[10px] text-silver/40 uppercase tracking-widest mt-1">
                  Last Updated: {lastUpdated}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-silver/60 hover:text-neon transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="font-mono text-xs text-silver/70 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-1 bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
