import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#050508", // Even darker
          secondary: "#0a0a0f",
        },
        brand: {
          primary: "#3b82f6", // Electric blue
          success: "#22c55e", // Neon green
          warning: "#f59e0b", // Amber
          danger: "#ef4444",
        },
        text: {
          primary: "#ffffff",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "neon-glow": "0 0 30px rgba(59, 130, 246, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
