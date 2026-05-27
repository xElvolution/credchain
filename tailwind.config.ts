import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#111118',
        card: '#16161F',
        border: '#ffffff12',
        'border-bright': '#ffffff24',
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#6366F1',
          muted: '#4F46E520',
        },
        secondary: {
          DEFAULT: '#00FF87',
          muted: '#00FF8720',
        },
        muted: '#6B7280',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        type: {
          work: '#3B82F6',
          project: '#4F46E5',
          skill: '#00FF87',
          education: '#F97316',
          hackathon: '#FBBF24',
          certification: '#A855F7',
          contribution: '#14B8A6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      maxWidth: {
        container: '1200px',
      },
      spacing: {
        section: '96px',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(79, 70, 229, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 20% 30%, rgba(79, 70, 229, 0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(0, 255, 135, 0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
