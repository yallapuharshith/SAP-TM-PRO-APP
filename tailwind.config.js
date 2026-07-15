/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        accent: '#F97316',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#F43F5E',
        appbg: '#0F1724',
        card: '#172033',
        textmain: '#E8EEF8',
      },
      boxShadow: {
        glow: '0 10px 30px rgba(15, 118, 110, 0.24)',
        soft: '0 8px 24px rgba(15, 23, 42, 0.28)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 20% 18%, rgba(15, 118, 110, 0.34) 0px, transparent 45%), radial-gradient(at 82% 4%, rgba(249, 115, 22, 0.24) 0px, transparent 42%), radial-gradient(at 4% 86%, rgba(244, 63, 94, 0.18) 0px, transparent 46%)',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(15, 118, 110, 0.14)' },
          '50%': { boxShadow: '0 0 24px rgba(15, 118, 110, 0.34)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
