import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      colors: {
        zinc: {
          950: "#09090b",
        },
        emerald: {
          DEFAULT: "#10b981",
        },
        /* Brand design tokens */
        "tq-bg":      "#09090b",
        "tq-surface": "#111113",
        "tq-accent":  "#10b981",
        "tq-accent-2":"#059669",
        "tq-amber":   "#f59e0b",
        "tq-rose":    "#f43f5e",
        /* Legacy colours kept for backward compat */
        "primary":         "#065f46",
        "primary-fixed":   "#b3edea",
        "primary-fixed-dim":"#97d1ce",
        "earth-clay":      "#A36A4F",
        "deep-teal":       "#062E2D",
      },
      keyframes: {
        "mesh-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":       { transform: "translate(60px, -40px) scale(1.1)" },
          "66%":       { transform: "translate(-40px, 60px) scale(0.9)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "dot-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.7)" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "mesh-drift":   "mesh-drift 12s ease-in-out infinite",
        shimmer:        "shimmer 1.6s ease-in-out infinite",
        float:          "float 4s ease-in-out infinite",
        "float-slow":   "float 6s ease-in-out infinite",
        "float-delay":  "float 4s ease-in-out 1s infinite",
        "fade-up":      "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":      "fade-in 0.4s ease-out both",
        marquee:        "marquee 20s linear infinite",
        "dot-pulse":    "dot-pulse 2s ease-in-out infinite",
        "spin-slow":    "spin-slow 8s linear infinite",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring":   "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh-em":   "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,95,70,0.12), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
