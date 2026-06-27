import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FDFBF7",
        ink: "#1A1A1A",
        maroon: {
          DEFAULT: "#1E3A2F", // Forest Green mapped as maroon to avoid code rewrites
          dark: "#12241D",
        },
        gold: "#C5A880",
        slate: "#5A6E7F",
        line: "#E6DFD3",
      },
      fontFamily: {
        display: ["var(--font-playfair)"],
        body: ["var(--font-inter)"],
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
