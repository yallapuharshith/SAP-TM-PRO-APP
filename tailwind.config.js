/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#06B6D4',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        appbg: '#0F172A',
        card: '#1E293B',
        textmain: '#F8FAFC',
      },
      boxShadow: {
        glow: '0 10px 30px rgba(37, 99, 235, 0.2)',
        soft: '0 8px 24px rgba(15, 23, 42, 0.28)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 20% 20%, rgba(37, 99, 235, 0.35) 0px, transparent 45%), radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.22) 0px, transparent 40%), radial-gradient(at 0% 80%, rgba(34, 197, 94, 0.15) 0px, transparent 45%)',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(37, 99, 235, 0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(37, 99, 235, 0.35)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
