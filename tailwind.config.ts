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
        // Mostar Reference exact color palette
        paper: '#fdf1e1',        // Ivory / Cream paper tint
        ink: '#111411',          // Dark ink text
        'bg-dark': '#0b1110',    // Deep atmospheric background
        'cc-bg': '#080e14',      // Deep midnight ocean background
        'cc-surface': '#0f1a26',
        'cc-surface-2': '#162030',
        'cc-border': 'rgba(253, 241, 225, 0.18)',
        'cc-border-bright': 'rgba(253, 241, 225, 0.45)',

        // Accent tones
        accent: '#1e6faa',
        'accent-bright': '#2a9aff',
        'accent-glow': '#0d4a7a',

        // Verdict colors - subtle restrained tints
        go: '#10b981',
        negotiate: '#f59e0b',
        reject: '#ef4444',

        // Provenance badge colors
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
        glass: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(253, 241, 225, 0.1)',
        paper: '0 18px 52px rgba(2, 47, 64, 0.18)',
        glow: '0 0 30px rgba(42, 154, 255, 0.25)',
        'glow-go': '0 0 30px rgba(16, 185, 129, 0.25)',
        'glow-reject': '0 0 30px rgba(239, 68, 68, 0.25)',
      },
      backgroundImage: {
        'cinematic-gradient': 'radial-gradient(ellipse at 50% 0%, #0d1e30 0%, #080e14 60%, #04080c 100%)',
        'paper-card': 'linear-gradient(180deg, #fdf1e1 0%, #f7e6d0 100%)',
        'glass-panel': 'linear-gradient(135deg, rgba(15, 26, 38, 0.75) 0%, rgba(10, 18, 28, 0.85) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
