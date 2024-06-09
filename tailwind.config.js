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
        slideFromRight: {
          '0%': { transform: "translateX(200%)" },
          '100%': { transform: 'translateX(0)' }
        },
      },
      animation: {
        'slideUp': 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        'slideDown': 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        'slideFromRight': 'slideFromRight 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}

