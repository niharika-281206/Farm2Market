/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#22C55E",
        background: "#F7FAF5",
        text: "#172117",
        muted: "#64748B",
        accent: "#EAB308",
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Telugu', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
