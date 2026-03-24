/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          primary: '#B8860B',
          light: '#C8A04A',
        },
        graphite: '#3A3A3A',
        bordeaux: {
          DEFAULT: '#8B1A1A',
          deep: '#6B0F0F',
        },
        cream: '#F5F0E8',
        beige: '#E8D9B5',
        'dark-warm': '#1A0A00',
        'dark-warm-2': '#3A1A00',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        subtitle: ['"Cormorant Garamond"', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #B8860B 0%, #C8A04A 50%, #B8860B 100%)',
        'gradient-wine': 'linear-gradient(180deg, #8B1A1A 0%, #6B0F0F 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A0A00 0%, #3A1A00 100%)',
      },
      boxShadow: {
        gold: '0 4px 16px rgba(184, 134, 11, 0.3)',
        'gold-hover': '0 8px 24px rgba(184, 134, 11, 0.2)',
        card: '0 2px 8px rgba(0,0,0,0.12)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
