/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#c09a5c',
        'brand-secondary': '#1a1a1a',
        'brand-dark': '#121212',
        'brand-light': '#f5f5f5',
        'brand-text': '#e0e0e0',
        'brand-text-dark': '#333333',
      }
    },
  },
  plugins: [],
}