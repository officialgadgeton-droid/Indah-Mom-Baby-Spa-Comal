/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B2C6F', // Deep Plum / Ungu Teratai
          50: '#FBF5FD',
          100: '#F5E8FB',
          200: '#EBD1F7',
          300: '#DBAAF0',
          400: '#C276E4',
          500: '#A447D1',
          600: '#8630B5',
          700: '#6E2595',
          800: '#5B2C6F', // Main Deep Plum
          900: '#481A5B',
          950: '#2F0B3D',
        },
        accent: {
          DEFAULT: '#C59B27', // Warm Gold
          light: '#F4E8C1',
          dark: '#A67E1B',
          50: '#FDFCF7',
          100: '#FBF8EC',
          200: '#F4EBCE',
          300: '#E9D9A5',
          400: '#D9C16B',
          500: '#C59B27', // Main Gold
          600: '#A87D1B',
          700: '#825C17',
          800: '#654719',
          900: '#4E3617',
        },
        cream: {
          DEFAULT: '#FDFBF7', // Soft Cream background
          50: '#FFFEFC',
          100: '#FDFBF7',
          200: '#FAF6ED',
          300: '#F5EEDE',
          400: '#EDE2CA',
        },
        charcoal: {
          DEFAULT: '#1F2937', // Dark Charcoal
          light: '#4B5563',
          dark: '#111827',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(91, 44, 111, 0.08)',
        'card': '0 8px 30px rgba(91, 44, 111, 0.06)',
        'gold': '0 6px 20px rgba(197, 155, 39, 0.25)',
      }
    },
  },
  plugins: [],
}
