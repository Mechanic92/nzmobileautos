import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: "var(--primary)",
        primaryText: "var(--primaryText)",
        focus: "var(--focus)",
        success: "var(--success)",
        danger: "var(--danger)",
        brand: {
          yellow: "#f6c90e",
          black: "#0a0a0a",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
