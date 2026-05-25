/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '375px',
        '3xl': '1920px',
        '4k': '2560px',
        tv: '3840px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.25rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xs': ['0.5rem', { lineHeight: '0.75rem' }],
      },
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        'surface-active': 'rgb(var(--color-surface-active) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'text-dim': 'rgb(var(--color-text-dim) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-hover': 'rgb(var(--color-border-hover) / <alpha-value>)',
        white: 'rgb(var(--color-inverse) / <alpha-value>)',
        primary: '#f54123',
        'primary-hover': '#ff780a',
        'primary-dark': '#c42e14',
        reward: '#ffdc28',
        'reward-soft': '#fff3b3',
        accent: '#ff780a',
        flame: '#f54123',
        'flame-mid': '#ff780a',
        'flame-light': '#ffdc28',
        crimson: '#871919',
        charcoal: '#371e23',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Hind Siliguri', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
