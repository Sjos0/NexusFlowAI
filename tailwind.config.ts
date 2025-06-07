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
        background: '#0f172a', // Slate-900
        surface: '#1e293b',    // Slate-800
        primary: '#e2e8f0',   // Slate-200 (User's primary text color)
        secondary: '#94a3b8', // Slate-400 (User's secondary text color)
        accent: {
          start: '#2dd4bf',   // Teal-400
          end: '#06b6d4',     // Cyan-500
        }
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'], // Changed from 'sans' and var(--font-inter)
        headline: ['Poppins', 'sans-serif'], // Changed from 'display' and var(--font-poppins)
      },
    },
  },
  plugins: [], // User specified empty plugins array, removing tailwindcss-animate
};
export default config;
