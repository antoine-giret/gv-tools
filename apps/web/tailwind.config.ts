import containerQueriesPlugin from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'selector',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {},
  plugins: [containerQueriesPlugin],
};

export default config;
