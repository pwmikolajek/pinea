/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        green: {
          50: '#f0faf0',
          100: '#dbf5db',
          200: '#b8eab8',
          300: '#8dd88d',
          400: '#5ebe5e',
          500: '#3da03d',
          600: '#2e822e',
          700: '#276627',
          800: '#235223',
          900: '#1e441e',
          950: '#0f260f',
        },
      },
    },
  },
  plugins: [],
};