/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.15)",
          card: "rgba(255,255,255,0.05)",
        },
        dark: {
          deepest: "#0a0a0f",
          base: "#0f0f1a",
          surface: "#1a1a2e",
          elevated: "#252540",
        },
        accent: {
          DEFAULT: "var(--accent, #6366f1)",
          green: "#00d4aa",
          blue: "#4f8ef7",
          purple: "#a855f7",
          red: "#f87171",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
