import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F0",
        card: "#FFFFFF",
        muted: "#EBE7DC",
        input: "#FDFBF7",
        "green-primary": "#2D5A1B",
        "green-dark": "#1C2B0A",
        "green-active": "#1E3E12",
        "green-muted": "#7A8C6E",
        "green-faint": "#9AAA8A",
        "orange-accent": "#C4622D",
        "border-base": "#E0DDD4",
        "border-light": "#EBE7DC",
        "border-faint": "#F0EDE4",
        divider: "#F5F2EA",
        "text-primary": "#2A3620",
        "text-heading": "#1C2B0A",
      },
      fontFamily: {
        serif: ['"Lora"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
