/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'system-ui', 'sans-serif'],
        serif: ["'Playfair Display'", 'serif'],
      },
      colors: {
        clay: {
          50:  '#FAECE7',
          100: '#F5C4B3',
          400: '#C8473A',
          600: '#A33328',
          900: '#7A1F14',
        },
        brand: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          900: '#085041',
        },
      },
    },
  },
  plugins: [],
}
