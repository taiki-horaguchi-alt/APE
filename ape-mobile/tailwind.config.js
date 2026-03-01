/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#28A745',
          600: '#22963F',
          700: '#1E8439',
          800: '#1B5E20',
          900: '#0D3D12',
        },
        danger: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#DC3545',
          600: '#C82333',
          700: '#A71D2A',
        },
        warning: {
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FFC107',
          600: '#E0A800',
          700: '#C69500',
        },
        info: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          500: '#17A2B8',
          600: '#138496',
          700: '#0C6674',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#121416',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
