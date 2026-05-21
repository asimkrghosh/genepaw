/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        genepaw: {
          primary: '#1B6B4A',
          'primary-light': '#2D9D6F',
          'primary-dark': '#0F4A32',
          accent: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};