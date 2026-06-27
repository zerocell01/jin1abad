import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",   // Pure white for card backgrounds
        paper: "#F1F5F9",   // Slightly dimmed white/light-gray background (slate-100)
        ink: "#0F172A",     // Dark slate text (slate-900)
        maroon: {
          DEFAULT: "#4F46E5", // Vibrant Indigo accent
          dark: "#3730A3",
        },
        gold: "#10B981",    // Emerald green accents
        slate: "#64748B",   // Cool gray text (slate-500)
        line: "#E2E8F0",    // Soft slate line (slate-200)
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
