/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkbg: '#09090b',
        surface: 'rgba(20, 20, 23, 0.6)',
        glassborder: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
        zendots: ['Zen Dots', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
