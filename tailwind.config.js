/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark Luxury Monochrome
        'ink':        '#080808',
        'ink-mid':    '#0F0F0F',
        'ink-light':  '#161616',
        'ink-raised': '#1E1E1E',
        'ink-border': '#262626',
        'ink-muted':  '#333333',
        // Monochrome accents
        'silver':     '#C8C8C8',
        'silver-dim': '#888888',
        'platinum':   '#E8E8E8',
        'white-pure': '#F5F5F5',
        // Legacy (for admin)
        'cyber-lime': '#CCFF00',
        'void':       '#080808',
        'void-light': '#0F0F0F',
        'void-mid':   '#161616',
        'void-border':'#262626',
      },
      fontFamily: {
        'display': ['"Cormorant Garamond"', 'serif'],
        'display-wide': ['"Anton"', 'sans-serif'],
        'mono':    ['"IBM Plex Mono"', 'monospace'],
        'body':    ['"Outfit"', 'sans-serif'],
        'italic':  ['"Cormorant Garamond"', 'serif'],
      },
      letterSpacing: {
        'luxury': '0.25em',
        'ultra':  '0.4em',
      },
    },
  },
  plugins: [],
}
