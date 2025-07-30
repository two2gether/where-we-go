/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fed7aa',
          200: '#fed7aa',
          300: '#fb923c',
          400: '#f97316',
          500: '#ea580c',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        primary: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '1rem',      // 16px
        'lg': '1.125rem',    // 18px
        'xl': '1.25rem',     // 20px
        '2xl': '1.5rem',     // 24px
        '3xl': '1.875rem',   // 30px
        '4xl': '2.25rem',    // 36px
        '5xl': '3rem',       // 48px
      },
      spacing: {
        '0': '0px',
        '1': '0.25rem',    // 4px
        '2': '0.5rem',     // 8px
        '3': '0.75rem',    // 12px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '8': '2rem',       // 32px
        '10': '2.5rem',    // 40px
        '12': '3rem',      // 48px
        '16': '4rem',      // 64px
        '20': '5rem',      // 80px
        '24': '6rem',      // 96px
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          'from': { opacity: '1', transform: 'translateY(0)' },
          'to': { opacity: '0', transform: 'translateY(-10px)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(100%)' },
        },
        bounceIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3) translateY(-30px)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05) translateY(-10px)'
          },
          '70%': { 
            transform: 'scale(0.9) translateY(0)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      gridTemplateColumns: {
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // 커스텀 유틸리티 추가
    function({ addUtilities, addComponents, theme }) {
      // 버튼 컴포넌트
      addComponents({
        '.btn-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: '500',
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          border: 'none',
          textDecoration: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.primary.300')}`,
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.600'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.white'),
          color: theme('colors.primary.600'),
          border: `1px solid ${theme('colors.primary.200')}`,
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.50'),
          },
        },
        '.btn-outline': {
          backgroundColor: 'transparent',
          color: theme('colors.primary.600'),
          border: `1px solid ${theme('colors.primary.300')}`,
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.50'),
          },
        },
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.700'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.100'),
          },
        },
        '.btn-danger': {
          backgroundColor: theme('colors.error.500'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.error.600'),
          },
        },
        '.btn-sm': {
          padding: '0.375rem 0.75rem',
          fontSize: theme('fontSize.sm'),
        },
        '.btn-md': {
          padding: '0.5rem 1rem',
          fontSize: theme('fontSize.base'),
        },
        '.btn-lg': {
          padding: '0.75rem 1.5rem',
          fontSize: theme('fontSize.lg'),
        },
      });

      // 입력 필드 컴포넌트
      addComponents({
        '.input-field': {
          width: '100%',
          padding: '0.75rem 1rem',
          border: `1px solid ${theme('colors.gray.300')}`,
          borderRadius: '0.5rem',
          fontSize: theme('fontSize.base'),
          transition: 'all 0.2s ease-in-out',
          backgroundColor: theme('colors.white'),
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 1px ${theme('colors.primary.500')}`,
          },
          '&::placeholder': {
            color: theme('colors.gray.400'),
          },
          '&:invalid': {
            borderColor: theme('colors.error.500'),
            '&:focus': {
              borderColor: theme('colors.error.500'),
              boxShadow: `0 0 0 1px ${theme('colors.error.500')}`,
            },
          },
        },
      });

      // 유틸리티 클래스
      addUtilities({
        '.text-balance': {
          textWrap: 'balance',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.gradient-mask-b-0': {
          '-webkit-mask-image': 'linear-gradient(to bottom, black, transparent)',
          'mask-image': 'linear-gradient(to bottom, black, transparent)',
        },
        '.backdrop-blur-xs': {
          '-webkit-backdrop-filter': 'blur(2px)',
          'backdrop-filter': 'blur(2px)',
        },
      });
    },
  ],
};