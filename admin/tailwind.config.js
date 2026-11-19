/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#16161a", soft: "#3b3b42" },
        cream: "#f7f5f1",
        sand: "#efebe4",
        line: "#e6e1d9",
        muted: "#6e6c69",
        accent: { DEFAULT: "#f2702e", dark: "#d4581a", soft: "#fdeee4" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(22,22,26,.04), 0 8px 24px -8px rgba(22,22,26,.10)",
      },
    },
  },
  plugins: [],
};
