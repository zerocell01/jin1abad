import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F1E7",
        ink: "#232323",
        maroon: {
          DEFAULT: "#7A2E2E",
          dark: "#5C2222",
        },
        gold: "#C9A227",
        slate: "#46566B",
        line: "#DCD3C0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)"],
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
