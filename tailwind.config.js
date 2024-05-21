/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      serif: ['Cormorant Garamond']
    },
    extend: {
      padding: {
        '5.5': '1.375rem',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

