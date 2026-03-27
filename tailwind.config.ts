import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 44px rgba(11, 59, 55, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
