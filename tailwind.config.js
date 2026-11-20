import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      screens: { xs: "400px" },
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
      animation: { "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both" },
    },
  },
  plugins: [forms],
};

export default config;
