/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        primary: "#ff6740",
        secondary: "#2d2d2d",
        accent: "#f4f4f4",
      },
    },
  },
  plugins: [],
}
