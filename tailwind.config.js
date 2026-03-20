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
        "dark-bg": "#0f172a",
        "dark-sidebar": "#111827",
        "dark-card": "#1e293b",
        "dark-border": "#334155",
        "dark-text": "#f1f5f9",
        "accent-blue": "#3b82f6",
      },
    },
  },
  plugins: [],
};
