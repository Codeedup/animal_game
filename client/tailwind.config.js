/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00BFFF",    // Electric blue
        secondary: "#FF6F61",  // Vibrant coral
        accent: "#CCFF00",     // Lime green
        bgStart: "#8A2BE2",    // Purple gradient start
        bgEnd: "#4B0082",      // Purple gradient end
        highlight: "#FFEA00",  // Yellow highlight
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} 