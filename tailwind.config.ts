import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#071A3D",
        kkhc: "#2458B8",
        mist: "#F3F0E8",
        "club-paper": "#F7F5EF"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Arial Narrow", "sans-serif"]
      },
      boxShadow: {
        premium: "0 20px 60px rgba(7, 26, 61, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
