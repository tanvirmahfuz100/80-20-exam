/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09111f',
        sidebar: '#0f1728',
        surface: '#111a2d',
        'surface-hover': '#18243b',
        'surface-alt': '#1d2d49',
        'surface-active': '#264061',
        text: '#f8fbff',
        'text-muted': '#9fb0c8',
        'text-dim': '#64748b',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(255, 255, 255, 0.18)',
        primary: '#58c74f',
        'primary-hover': '#79dc63',
        reward: '#f8c94b',
        'reward-soft': '#fdf2b7',
        accent: '#67e8f9',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
