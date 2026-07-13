/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2430',
          light: '#232830',
        },
        paper: {
          DEFAULT: '#F6F5F1',
          dark: '#1B1F26',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#232830',
        },
        teal: {
          DEFAULT: '#0E7C66',
          light: '#2FBFA0',
          dark: '#0A5E4D',
        },
        brass: {
          DEFAULT: '#C9922B',
          light: '#E0AC4B',
          dark: '#A6771E',
        },
        success: {
          DEFAULT: '#2F9E6E',
        },
        danger: {
          DEFAULT: '#B8463A',
          light: '#E2685A',
        },
        muted: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
};
