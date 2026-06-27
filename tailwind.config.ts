import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#1E293B", // Override white as Slate-800 for card backgrounds in dark mode
        paper: "#0F172A", // Dark Slate background
        ink: "#F8FAFC",   // Off-white text
        maroon: {
          DEFAULT: "#6366F1", // Indigo mapped as maroon to avoid code rewrites
          dark: "#4F46E5",
        },
        gold: "#10B981",    // Emerald green accents
        slate: "#94A3B8",   // Light slate text
        line: "#334155",    // Slate-700 for borders
      },
      fontFamily: {
        display: ["var(--font-outfit)"],
        body: ["var(--font-jakarta)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
