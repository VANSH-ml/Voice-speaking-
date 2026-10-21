/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05070f',
          900: '#080c1a',
          800: '#0d1528',
          700: '#121e3a',
          600: '#1a2a50',
          500: '#233266',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        electric: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':
          'radial-gradient(ellipse at top, #1a2a50 0%, #05070f 60%)',
        'gradient-card':
          'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(34,211,238,0.04) 100%)',
      },
      boxShadow: {
        glass: '0 4px 32px rgba(139,92,246,0.12), 0 1px 0 rgba(255,255,255,0.05) inset',
        glow: '0 0 20px rgba(139,92,246,0.35)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
