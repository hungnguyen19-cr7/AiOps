/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: '#00FFAA',
        navy: '#080E1E',
        'navy-light': '#0D1729',
        'navy-mid': '#111C35',
        silver: '#C8D6E5',
        'neon-dim': 'rgba(0,255,170,0.15)',
        'neon-glow': 'rgba(0,255,170,0.4)',
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,255,170,0.5), 0 0 60px rgba(0,255,170,0.2)',
        'neon-sm': '0 0 10px rgba(0,255,170,0.4)',
        'neon-lg': '0 0 40px rgba(0,255,170,0.6), 0 0 80px rgba(0,255,170,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,170,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,170,0.8), 0 0 80px rgba(0,255,170,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,255,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.03) 1px, transparent 1px)',
        'radial-neon': 'radial-gradient(ellipse at center, rgba(0,255,170,0.1) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
    },
  },
  plugins: [],
}
