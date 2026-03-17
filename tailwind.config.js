/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./modules/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      /**
       * Theme override (no component changes):
       * - Make `slate-*` feel warm + paper-like
       * - Make `indigo-*` the primary accent (orange)
       * - Make `violet-*` the secondary accent (amber)
       *
       * This keeps all existing classNames intact while matching the
       * orange SaaS theme from the reference screenshots.
       */
      colors: {
        slate: {
          50: "#fbf8f3",
          100: "#f6f0e8",
          200: "#eadfd2",
          300: "#dbcbb8",
          400: "#c3ab95",
          500: "#a48770",
          600: "#7f6554",
          700: "#5f4b3f",
          800: "#3f322b",
          900: "#231c18",
          950: "#14110f",
        },
        indigo: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        violet: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
    },
  },
  plugins: [],
};
