/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        cream: {
          50: '#faf8f5',
          100: '#f4f0ea',
          200: '#e8e1d5',
        },
        ink: {
          900: '#191714',
          800: '#2a2620',
          700: '#413c34',
          500: '#6e675c',
          400: '#8d867a',
        },
        gold: {
          300: '#d9bd8f',
          400: '#c9a56b',
          500: '#b08d57',
          600: '#96733f',
        },
        success: '#2e7d4f',
        warning: '#c07f2d',
        danger: '#b3402e',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s ease-out both',
        slideIn: 'slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
