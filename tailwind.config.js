/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blueDarkBG: "#0D1527",
        blueCardBG: "#131F37",
        cyanPrimary: "#00F0FF",
        cyanNeon: "#00E5FF",
        accentOrange: "#FF8C00",
        accentRed: "#FF3B30",
        accentGreen: "#00E676",
        blueElectric: "#2979FF",
        accessibilityGray: "#A0AEC0",
        borderSlate: "#1F2E4D",
      },
    },
  },
  plugins: [],
}
