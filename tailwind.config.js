/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' }
        },
        slideDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' }
        },
      },
      animation: {
        'slideUp': 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        'slideDown': 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      }
    },
  },
  plugins: [],
}

