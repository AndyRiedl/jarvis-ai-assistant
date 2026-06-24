/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          cyan: '#00d4ff',
          'cyan-dark': '#0099cc',
          'cyan-glow': '#00d4ff33',
          navy: '#0a1428',
          'navy-light': '#0f1e3d',
          'navy-mid': '#132040',
          'navy-card': '#0d1a35',
          'navy-border': '#1a2d50',
          'text-primary': '#e0f4ff',
          'text-secondary': '#7ab8d4',
          'text-muted': '#3a6b8a',
          accent: '#ff6b35',
          success: '#00ff88',
          warning: '#ffaa00',
          danger: '#ff3366',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['Rajdhani', 'Orbitron', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'cyan-glow-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(0, 212, 255, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 212, 255, 0.1)',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'rotate-slow': 'spin 8s linear infinite',
        'rotate-reverse': 'spin-reverse 6s linear infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.4)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

