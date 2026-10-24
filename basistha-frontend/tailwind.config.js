/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vedic: {
          saffron: "#ea580c",
          gold: "#f59e0b",
          marigold: "#d97706",
          burgundy: "#831843",
          navy: "#0f172a",
          card: "#ffffff",
          parchment: "#fefce8"
        }
      }
    },
  },
  plugins: [],
}
