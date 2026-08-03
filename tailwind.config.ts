import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F4F7FA",
        surface: "#FFFFFF",
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#0D9488",
          700: "#0F766E",
        },
        accent: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          500: "#F97316",
          600: "#EA580C",
        },
        dark: {
          900: "#0B132B",
          800: "#0F172A",
          700: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)",
        glow: "0 0 20px rgba(6, 182, 212, 0.25)",
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
};
export default config;
