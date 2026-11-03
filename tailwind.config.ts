import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        navy: { 700: "#1E293B", 800: "#172033", 900: "#0F172A" },
        accent: { 400: "#22D3EE", 500: "#06B6D4" },
      },
      fontFamily: { sans: ["var(--font-poppins)", "Inter", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -8px rgba(15,23,42,.10)",
        glow: "0 20px 60px -15px rgba(37,99,235,.45)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseRing: { "0%": { transform: "scale(.9)", opacity: ".7" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
        blink: { "0%,90%,100%": { transform: "scaleY(1)" }, "95%": { transform: "scaleY(.1)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp .7s ease-out both",
        pulseRing: "pulseRing 2s ease-out infinite",
        blink: "blink 5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
