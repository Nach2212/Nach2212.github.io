/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./ar/index.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        cyber: {
          dark: '#030712',
          darker: '#02050c',
          blue: '#3b82f6',
          purple: '#c084fc',
          pink: '#ec4899',
          slate: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
