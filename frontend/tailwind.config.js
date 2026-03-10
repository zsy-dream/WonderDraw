/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 多巴胺配色
        background: '#FFF5E6',
        primary: '#FF6B6B',
        secondary: '#FFD93D',
        accent: '#6BCF7F',
        purple: '#A78BFA',
        blue: '#60A5FA',
      },
      borderRadius: {
        'clay-sm': '12px',
        'clay-md': '20px',
        'clay-lg': '32px',
        'clay-xl': '48px',
      },
      boxShadow: {
        'clay-raised': '8px 8px 16px rgba(209, 139, 71, 0.2), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'clay-inset': 'inset 4px 4px 8px rgba(209, 139, 71, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
        'clay-hover': '12px 12px 24px rgba(209, 139, 71, 0.25), -12px -12px 24px rgba(255, 255, 255, 0.9)',
      },
      fontFamily: {
        display: ['"Comic Sans MS"', '"Marker Felt"', 'cursive'],
      },
    },
  },
  plugins: [],
}
