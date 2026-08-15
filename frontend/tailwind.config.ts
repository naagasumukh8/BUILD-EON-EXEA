/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Exact tokens from the existing landing page (styles.css) ──
      colors: {
        // Backgrounds
        'bg-deep':    '#060b10',
        'bg-base':    '#080e14',
        'bg-panel':   '#0d1822',
        'bg-surface': '#0f1d2b',
        'bg-card':    '#111f2e',
        'bg-hover':   '#152434',
        // Borders
        'border-dim':    'rgba(30,90,140,0.25)',
        'border-mid':    'rgba(30,90,140,0.45)',
        'border-bright': 'rgba(40,120,180,0.7)',
        // Text
        'text-primary':   '#e2eaf4',
        'text-secondary': '#8aacca',
        'text-muted':     '#4a6e8a',
        // Accent blues (from landing page)
        'accent':         '#1e6faa',
        'accent-bright':  '#2a9aff',
        'accent-glow':    '#0d4a7a',
        // Verdict colours
        'go':        '#10b981',
        'negotiate': '#f59e0b',
        'reject':    '#ef4444',
        // Provenance badge colours
        'prov-confirmed':  '#10b981',
        'prov-reference':  '#3b82f6',
        'prov-estimated':  '#f59e0b',
        'prov-simulated':  '#6b7280',
        'prov-candidate':  '#ef4444',
        'prov-calculated': '#8b5cf6',
      },
      fontFamily: {
        // Display: same Ogg font as landing page
        display: ['"Ogg Medium"', 'Georgia', 'serif'],
        // Body: Inter to match landing page body text
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'gradient-maritime': 'linear-gradient(135deg, #060b10 0%, #0a1628 40%, #061020 100%)',
        'gradient-card': 'linear-gradient(145deg, #0f1d2b 0%, #091420 100%)',
        'gradient-accent': 'linear-gradient(135deg, #1e6faa 0%, #0d4a7a 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(30,90,140,0.25)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(40,120,180,0.45)',
        'glow-blue': '0 0 24px rgba(42,154,255,0.2)',
        'glow-go': '0 0 20px rgba(16,185,129,0.25)',
        'glow-reject': '0 0 20px rgba(239,68,68,0.25)',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 8px rgba(42,154,255,0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(42,154,255,0.4)' },
        },
      },
    },
  },
  plugins: [],
}
