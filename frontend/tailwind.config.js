const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#16161a", soft: "#3b3b42" },
        cream: "#f7f5f1",
        sand: "#efebe4",
        line: "#e6e1d9",
        muted: "#6e6c69",
        accent: { DEFAULT: "#f2702e", dark: "#d4581a", soft: "#fdeee4" },
        // legacy tokens (kept for compatibility)
        primary: "#f0f2f5",
        secondary: "#ff813f",
        tertiary: "#222222",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      screens: {
        xs: "400px",
        "3xl": "1680px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(22,22,26,.04), 0 8px 24px -8px rgba(22,22,26,.10)",
        lift: "0 2px 4px rgba(22,22,26,.04), 0 20px 40px -12px rgba(22,22,26,.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
