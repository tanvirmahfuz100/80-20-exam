/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        sidebar: '#080808',
        surface: '#0c0c0d',
        'surface-hover': '#161618',
        'surface-alt': '#1a1a1c',
        'surface-active': '#2a2a2d',
        text: '#ffffff',
        'text-muted': '#8a8f98',
        'text-dim': '#4b4e52',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(255, 255, 255, 0.15)',
        primary: '#5e6ad2',
        'primary-hover': '#7c89eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
