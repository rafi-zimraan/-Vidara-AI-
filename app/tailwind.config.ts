import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './error.{js,ts,vue}',
  ],
  theme: {
    extend: {
      colors: {
        vidara: {
          bg: '#08080F',
          surface: '#0E0E1A',
          border: 'rgba(255,255,255,0.08)',
          purple: '#8B5CF6',
          cyan: '#22D3EE',
          text: '#ECECF5',
          muted: 'rgba(236,236,245,0.5)',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-vidara': 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
      },
    },
  },
  plugins: [],
} satisfies Config
