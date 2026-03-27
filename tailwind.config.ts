import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 8px 26px rgba(41, 37, 36, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
