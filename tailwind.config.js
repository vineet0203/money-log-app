/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6BCB77",
          dark: "#51A85D",
          light: "#8FE099",
        },
        accent: "#C4E2F5",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        text: "#0F172A",
        textMuted: "#64748B"
      }
    },
  },
  plugins: [],
}
