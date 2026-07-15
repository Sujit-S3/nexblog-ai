/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin';
import tailwindScrollbar from 'tailwind-scrollbar';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7C3AED',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0F172A',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#020617',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(79, 70, 229, 0.2)',
        'glow':    '0 0 25px -5px rgba(79, 70, 229, 0.35)',
        'glow-lg': '0 0 45px -8px rgba(79, 70, 229, 0.45)',
        'card':    '0 10px 30px -5px rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 20px 45px -10px rgba(79, 70, 229, 0.15), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'glass':   '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'liquid':  'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 20px 50px rgba(8, 112, 184, 0.07)',
        'liquid-dark': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 20px 50px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
        liquid: '16px',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'fade-up':    'fadeUp 0.6s ease-out',
        'slide-in':   'slideIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [flowbite, tailwindScrollbar],
};
