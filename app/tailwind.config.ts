import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  daisyui: {
    themes: ['dracula', 'forest', 'dark', 'halloween'],
  },
  plugins: [daisyui],
} satisfies Config;
