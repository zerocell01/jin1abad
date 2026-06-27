import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#F5F2EB",   // Warm off-white for cards to reduce glare
        paper: "#EAE5DB",   // Soft dimmed warm-gray background
        ink: "#1C242B",     // Comfortable dark text (not pitch black)
        maroon: {
          DEFAULT: "#4F46E5", // Vibrant Indigo accent
          dark: "#3730A3",
        },
        gold: "#10B981",    // Emerald green accents
        slate: "#5E6C7A",   // Muted slate gray text
        line: "#DDD7CD",    // Soft warm border line
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
