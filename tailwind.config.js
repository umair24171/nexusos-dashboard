/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core design tokens — Dark Terminal Luxury
        "dark-bg":      "#000000",   // Pure black
        "dark-sidebar": "#000000",   // Pure black sidebar
        "dark-card":    "#0D0D0D",   // Deep charcoal cards
        "dark-border":  "#1C1C1C",   // Subtle borders
        "dark-text":    "#EFEFEF",   // Near-white text
        "accent-blue":  "#00FFD1",   // Electric cyan (the accent)
        // Extended palette
        "nx-cyan":      "#00FFD1",
        "nx-green":     "#00FF87",
        "nx-yellow":    "#FFB800",
        "nx-red":       "#FF3B3B",
        "nx-muted":     "#555555",
        "nx-dim":       "#333333",
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "'Courier New'", "monospace"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      animation: {
        "live-blink":   "live-blink 1.5s ease-in-out infinite",
        "pulse-green":  "pulse-green 2s ease-in-out infinite",
        "pulse-yellow": "pulse-yellow 2s ease-in-out infinite",
        "pulse-red":    "pulse-red 2s ease-in-out infinite",
        "fade-in-up":   "fade-in-up 0.35s ease-out",
        "slide-right":  "slide-right 0.25s ease-out",
        "cursor-blink": "cursor-blink 1s step-end infinite",
      },
      keyframes: {
        "live-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.15" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 255, 135, 0.7)" },
          "50%":       { boxShadow: "0 0 0 5px rgba(0, 255, 135, 0)" },
        },
        "pulse-yellow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 184, 0, 0.7)" },
          "50%":       { boxShadow: "0 0 0 5px rgba(255, 184, 0, 0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 59, 59, 0.7)" },
          "50%":       { boxShadow: "0 0 0 5px rgba(255, 59, 59, 0)" },
        },
        "fade-in-up": {
          "from": { opacity: "0", transform: "translateY(14px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "from": { opacity: "0", transform: "translateX(-10px)" },
          "to":   { opacity: "1", transform: "translateX(0)" },
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
      },
      boxShadow: {
        "cyan-sm":  "0 0 12px rgba(0, 255, 209, 0.12)",
        "cyan-md":  "0 0 24px rgba(0, 255, 209, 0.18)",
        "cyan-lg":  "0 0 40px rgba(0, 255, 209, 0.22)",
      },
    },
  },
  plugins: [],
};
