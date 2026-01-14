/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High contrast palette
        'xos-bg-dark': '#000000',
        'xos-bg-light': '#ffffff',
        'xos-text-dark': '#ffffff', // Text color in dark mode
        'xos-text-light': '#000000', // Text color in light mode

        // Accents
        'xos-cyan': '#00d2ff',
        'xos-purple': '#bc13fe',
        'xos-pink': '#ff0055',
        'xos-orange': '#ff6b00',
        'xos-gold': '#ffb700',
      },
      fontFamily: {
        serif: ['Hack Nerd Font', 'monospace'],
        sans: ['Hack Nerd Font', 'monospace'],
        mono: ['Hack Nerd Font', 'monospace'],
      },
      animation: {
        'spin-slower': 'spin 60s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
