import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      colors: {
        background: "#f6f6f7",
        foreground: "#050816",
        muted: "#e0e0e4",
        border: "#d3d3dc",
        primary: {
          DEFAULT: "#111827",
          foreground: "#f9fafb"
        },
        accent: {
          DEFAULT: "#2563eb",
          foreground: "#eff6ff"
        }
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

