import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D62828",
          light: "#E85D5D",
          dark: "#A61E1E",
        },
        secondary: {
          DEFAULT: "#F77F00",
          light: "#FF9F3F",
        },
        background: {
          DEFAULT: "#FFF8F3",
          dark: "#1A1512",
        },
        accent: {
          DEFAULT: "#FFD166",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#241E1A",
        },
        textmain: {
          DEFAULT: "#222222",
          dark: "#F5F0EA",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl2: "18px",
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(214, 40, 40, 0.10)",
        card: "0 4px 20px rgba(0,0,0,0.06)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        slideUp: "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
export default config;
