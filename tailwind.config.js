/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Clinical luxury palette — blue / white / black
        paradise: {
          white: '#F7F9FC',   // Cool titanium white
          ink: '#070A12',     // Near-black clinical ink
          slate: '#586079',   // Muted UI text
          blue: '#2F6BFF',    // Primary brand blue (CTAs, accents)
          sky: '#6FB7FF',     // Light-blue highlight
          navy: '#0A1B3D',    // Deep blue (dark sections / VIP)
          line: '#E3E8F2',    // Sleek clinical border
          // Legacy aliases — any class not yet migrated still renders on-palette
          mint: '#2F6BFF',
          gold: '#0A1B3D',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'Syne', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
}
