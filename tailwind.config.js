/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Tactile Surface Stack
        "background": "#0a0e14",
        "surface": "#0a0e14",
        "surface-dim": "#0a0e14",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#0f141a",
        "surface-container": "#151a21",
        "surface-container-high": "#1b2028",
        "surface-container-highest": "#20262f",
        "surface-bright": "#262c36",
        "surface-variant": "#20262f",
        "surface-tint": "#86adff",

        // Primary — Luminous Blue
        "primary": {
          DEFAULT: "#86adff",
          foreground: "#002c66",
          dim: "#699cff",
          container: "#6e9fff",
          fixed: "#6e9fff",
          "fixed-dim": "#5491ff",
        },

        // Secondary — Signal Cyan
        "secondary": {
          DEFAULT: "#00e3fd",
          foreground: "#004d57",
          dim: "#00d4ec",
          fixed: "#26e6ff",
          "fixed-dim": "#00d7f0",
          container: "#006875",
        },

        // Tertiary — Soft Periwinkle
        "tertiary": {
          DEFAULT: "#cdddff",
          dim: "#aec2e9",
          fixed: "#bbcff7",
          "fixed-dim": "#aec2e9",
          container: "#bbcff7",
        },

        // Text
        "on-surface": "#f1f3fc",
        "on-surface-variant": "#a8abb3",
        "on-background": "#f1f3fc",
        "on-primary": "#002c66",
        "on-primary-container": "#002150",
        "on-secondary": "#004d57",
        "on-secondary-container": "#e8fbff",
        "on-tertiary": "#3b4f70",
        "on-tertiary-container": "#324667",
        "on-error": "#490006",
        "on-error-container": "#ffa8a3",

        // Error
        "error": {
          DEFAULT: "#ff716c",
          dim: "#d7383b",
          container: "#9f0519",
        },

        // Outline
        "outline": "#72757d",
        "outline-variant": "#44484f",

        // Inverse
        "inverse-surface": "#f8f9ff",
        "inverse-on-surface": "#51555c",
        "inverse-primary": "#005bc4",

        // shadcn compatibility
        border: "var(--outline-variant)",
        input: "var(--surface-container-high)",
        ring: "var(--primary-dim)",
        foreground: "var(--on-surface)",
        muted: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        popover: {
          DEFAULT: "var(--surface-container)",
          foreground: "var(--on-surface)",
        },
        card: {
          DEFAULT: "var(--surface-container-low)",
          foreground: "var(--on-surface)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--on-error)",
        },
      },
      fontFamily: {
        "headline": ["Manrope", "system-ui", "sans-serif"],
        "body": ["Inter", "system-ui", "sans-serif"],
        "label": ["Inter", "system-ui", "sans-serif"],
        "mono": ["JetBrains Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        md: "calc(1rem - 2px)",
        sm: "calc(1rem - 4px)",
        xl: "3rem",
        full: "9999px",
      },
      boxShadow: {
        "neo-extrusion": "4px 4px 12px rgba(0, 0, 0, 0.5), -2px -2px 8px rgba(255, 255, 255, 0.05)",
        "neo-intrusion": "inset 4px 4px 12px rgba(0, 0, 0, 0.5), inset -2px -2px 8px rgba(255, 255, 255, 0.05)",
        "neo-strong": "8px 8px 24px rgba(0, 0, 0, 0.6), -4px -4px 12px rgba(255, 255, 255, 0.03)",
        "glow-blue": "0 0 15px rgba(134, 173, 255, 0.4)",
        "glow-cyan": "0 0 12px rgba(0, 227, 253, 0.5)",
        "ambient": "0px 20px 40px rgba(134, 173, 255, 0.1)",
        "sidebar": "8px 0 24px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #86adff, #6e9fff)",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-in",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 227, 253, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 227, 253, 0.6)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
