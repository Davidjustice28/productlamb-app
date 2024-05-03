import type { Config } from 'tailwindcss'

export default {
  darkMode: 'selector',
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'loop-scroll-left': 'loop-scroll-left 50s linear infinite',
        'loop-scroll-right': 'loop-scroll-right 50s linear infinite'
      },
      keyframes: {
        'loop-scroll-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'loop-scroll-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)'},
        }
      }    
    },
    
  },
  plugins: [],
} satisfies Config
