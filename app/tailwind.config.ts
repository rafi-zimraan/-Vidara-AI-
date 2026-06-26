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
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c2d6ff',
          300: '#a3c2ff',
          400: '#6690ff',
          500: '#3366ff',
          600: '#0044ff',
          700: '#0033cc',
          800: '#002299',
          900: '#001166',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
