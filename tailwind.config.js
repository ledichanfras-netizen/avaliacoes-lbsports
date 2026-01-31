/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./api/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2D7A74',
        'brand-secondary': '#63BFAA',
        'brand-light': '#A8D7C9',
        'brand-dark': '#1A4340',
        'accent-red': '#E53E3E',
        'accent-green': '#38A169',
      },
    },
  },
  plugins: [],
}
