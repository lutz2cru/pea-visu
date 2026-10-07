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
        brand: {
          50: '#eef8ff',
          100: '#d8efff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003f7f',
          900: '#062040'
        }
      }
    },
  },
  plugins: [],
}
