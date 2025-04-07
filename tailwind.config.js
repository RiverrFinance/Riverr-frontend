/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        shine: {
          '100%': { transform: 'translateX(100%)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
        slideDown: 'slideDown 0.3s ease-out forwards',
        slideUp: 'slideUp 0.3s ease-in forwards',
      },
    },
  },
  plugins: [],
}

