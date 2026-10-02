import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          hover: "hsl(var(--surface-hover))",
          overlay: "hsl(var(--surface-overlay))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        download: {
          r2: "hsl(var(--download-r2))",
          direct: "hsl(var(--download-direct))",
          magnet: "hsl(var(--download-magnet))",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Strict typography scale
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["14px", { lineHeight: "20px", letterSpacing: "0em" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "-0.01em" }],
        lg: ["18px", { lineHeight: "28px", letterSpacing: "-0.015em" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.02em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.025em" }],
        "3xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.025em" }],
        "4xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.03em" }],
        "6xl": ["64px", { lineHeight: "72px", letterSpacing: "-0.03em" }],
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Smooth ease out
      },
      spacing: {
        // Enforcing 4px system, extending tailwind defaults
        18: "72px",
        22: "88px",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

// trigger rebuild
