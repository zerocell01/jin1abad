import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        paper: "#F8FAFC",   // Light Slate background
        ink: "#0F172A",     // Dark Slate text
        maroon: {
          DEFAULT: "#4F46E5", // Vibrant Indigo mapped as maroon
          dark: "#3730A3",
        },
        gold: "#10B981",    // Emerald green accents
        slate: "#64748B",   // Cool gray text
        line: "#E2E8F0",    // Slate-200 for borders
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
