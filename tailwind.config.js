/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#EC4899',
        bg: '#0F172A',
        surface: '#1E293B',
        textSecondary: '#94A3B8'
      }
    }
  },
  plugins: []
}

