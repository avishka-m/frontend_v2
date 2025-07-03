/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Primary color
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Secondary color
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        success: {
          500: '#22C55E',
        },
        warning: {
          500: '#EAB308',
        },
        danger: {
          500: '#EF4444',
        },
        info: {
          500: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      boxShadow: {
        card: '0 0 15px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

