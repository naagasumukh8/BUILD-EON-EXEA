import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Landing page exact color tokens
        paper: '#fdf1e1',
        ink: '#111411',
        'bg-dark': '#0b1110',
        'cc-bg': '#080e14',
        'cc-surface': '#0f1a26',
        'cc-surface-2': '#162030',
        'cc-border': 'rgba(30, 80, 120, 0.35)',
        'cc-border-bright': 'rgba(42, 154, 255, 0.5)',
        
        // Accents
        accent: '#1e6faa',
        'accent-bright': '#2a9aff',
        'accent-glow': '#0d4a7a',
        
        // Verdict colors
        go: '#10b981',
        negotiate: '#f59e0b',
        reject: '#ef4444',

        // Provenance colors
        'prov-confirmed': '#10b981',
        'prov-reference': '#3b82f6',
        'prov-estimated': '#f59e0b',
        'prov-simulated': '#9ca3af',
        'prov-candidate': '#f43f5e',
        'prov-calculated': '#a855f7',
      },
      fontFamily: {
        display: ['"Ogg Medium"', 'Georgia', 'serif'],
        body: ['Inter', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
        pill: '999px',
      },
      boxShadow: {
        glass: '0 20px 50px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.1) inset',
        'glass-hover': '0 24px 60px rgba(0, 0, 0, 0.65), 0 1px 0 rgba(255, 255, 255, 0.2) inset',
        paper: '0 16px 36px rgba(0, 0, 0, 0.25)',
        glow: '0 0 30px rgba(42, 154, 255, 0.25)',
        'glow-go': '0 0 24px rgba(16, 185, 129, 0.3)',
        'glow-reject': '0 0 24px rgba(239, 68, 68, 0.3)',
      },
      backgroundImage: {
        'cinematic-gradient': 'radial-gradient(ellipse at 50% 0%, #0d1e30 0%, #080e14 60%, #04080c 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'paper-gradient': 'linear-gradient(180deg, #fdf1e1 0%, #f7e6d0 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

export default config
