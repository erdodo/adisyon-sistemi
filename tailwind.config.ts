import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      textColor: {
        primary: "var(--primary-color)",
      },
      backgroundColor: {
        primary: "var(--primary-color)",
      }
    },
  },
  plugins: [],
};
export default config;
