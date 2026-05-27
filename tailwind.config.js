/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#1b3a4b',
        'sand': '#f4ede0',
        'terracotta': '#c1714f',
        'gold': '#d4a849',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
