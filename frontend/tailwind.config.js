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
        // GitHub Color System
        primary: {
          50: '#f6f8fa',
          100: '#eaeef2', 
          200: '#d0d7de',
          300: '#afb8c1',
          400: '#8c959f',
          500: '#6e7781', // GitHub gray
          600: '#57606a',
          700: '#424a53',
          800: '#32383f',
          900: '#24292f',
          950: '#1c2128',
        },
        secondary: {
          50: '#dbeafe',
          100: '#bfdbfe',
          200: '#93c5fd',
          300: '#60a5fa',
          400: '#3b82f6',
          500: '#2563eb', // GitHub blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a',
          950: '#172554',
        },
        // GitHub Accent Colors
        accent: {
          green: '#2da44e', // GitHub green
          red: '#da3633', // GitHub red  
          orange: '#fb8500', // GitHub orange
          purple: '#8250df', // GitHub purple
          yellow: '#bf8700', // GitHub yellow
        },
        // GitHub specific colors
        github: {
          canvas: '#ffffff',
          'canvas-subtle': '#f6f8fa',
          'canvas-inset': '#f6f8fa',
          border: '#d0d7de',
          'border-muted': '#d8dee4',
          neutral: '#656d76',
          'neutral-muted': '#8c959f',
          'neutral-subtle': '#afb8c1',
        },
        // Dark Theme Colors
        dark: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
          400: '#71717a',
          500: '#a1a1aa',
          600: '#d4d4d8',
          700: '#e4e4e7',
          800: '#f4f4f5',
          900: '#fafafa',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Modern Neutral Colors
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        primary: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
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
        // Modern Animations
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'gradient-shift': 'gradientShift 3s ease infinite',
        // Cyber-Organic Animations
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
        'cyber-glitch': 'cyberGlitch 0.3s ease-in-out',
        'organic-wave': 'organicWave 4s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'neural-network': 'neuralNetwork 8s ease-in-out infinite',
        'data-stream': 'dataStream 3s linear infinite',
        'hologram': 'hologram 2s ease-in-out infinite',
        'morph': 'morph 6s ease-in-out infinite',
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
        // Modern Keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Cyber-Organic Keyframes
        neonPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
            borderColor: 'rgba(20, 184, 166, 0.5)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(20, 184, 166, 0.8), 0 0 80px rgba(217, 70, 239, 0.4)',
            borderColor: 'rgba(217, 70, 239, 0.8)'
          },
        },
        cyberGlitch: {
          '0%, 100%': { transform: 'translateX(0)', filter: 'hue-rotate(0deg)' },
          '10%': { transform: 'translateX(-2px)', filter: 'hue-rotate(90deg)' },
          '20%': { transform: 'translateX(2px)', filter: 'hue-rotate(180deg)' },
          '30%': { transform: 'translateX(-1px)', filter: 'hue-rotate(270deg)' },
          '40%': { transform: 'translateX(1px)', filter: 'hue-rotate(360deg)' },
          '50%': { transform: 'translateX(0)', filter: 'hue-rotate(0deg)' },
        },
        organicWave: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1) rotate(0deg)',
            borderRadius: '50% 30% 70% 40%'
          },
          '25%': { 
            transform: 'translateY(-10px) scale(1.05) rotate(90deg)',
            borderRadius: '40% 60% 50% 80%'
          },
          '50%': { 
            transform: 'translateY(-5px) scale(0.95) rotate(180deg)',
            borderRadius: '60% 40% 30% 70%'
          },
          '75%': { 
            transform: 'translateY(-15px) scale(1.02) rotate(270deg)',
            borderRadius: '30% 70% 60% 50%'
          },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        neuralNetwork: {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '0.3',
            filter: 'brightness(1) contrast(1)'
          },
          '25%': { 
            transform: 'scale(1.1) rotate(90deg)',
            opacity: '0.7',
            filter: 'brightness(1.2) contrast(1.1)'
          },
          '50%': { 
            transform: 'scale(0.9) rotate(180deg)',
            opacity: '1',
            filter: 'brightness(1.5) contrast(1.2)'
          },
          '75%': { 
            transform: 'scale(1.05) rotate(270deg)',
            opacity: '0.5',
            filter: 'brightness(1.1) contrast(1.05)'
          },
        },
        dataStream: {
          '0%': { 
            transform: 'translateX(-100%) scaleX(0)',
            opacity: '0'
          },
          '50%': { 
            transform: 'translateX(0) scaleX(1)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%) scaleX(0)',
            opacity: '0'
          },
        },
        hologram: {
          '0%, 100%': { 
            opacity: '0.8',
            transform: 'translateZ(0) perspective(1000px) rotateX(0deg)',
            filter: 'brightness(1) saturate(1)'
          },
          '50%': { 
            opacity: '1',
            transform: 'translateZ(10px) perspective(1000px) rotateX(5deg)',
            filter: 'brightness(1.3) saturate(1.5)'
          },
        },
        morph: {
          '0%, 100%': { 
            borderRadius: '50% 30% 70% 40%',
            transform: 'rotate(0deg) scale(1)',
          },
          '16.66%': { 
            borderRadius: '40% 60% 50% 80%',
            transform: 'rotate(60deg) scale(1.05)',
          },
          '33.33%': { 
            borderRadius: '60% 40% 30% 70%',
            transform: 'rotate(120deg) scale(0.95)',
          },
          '50%': { 
            borderRadius: '30% 70% 60% 50%',
            transform: 'rotate(180deg) scale(1.1)',
          },
          '66.66%': { 
            borderRadius: '70% 50% 40% 60%',
            transform: 'rotate(240deg) scale(0.9)',
          },
          '83.33%': { 
            borderRadius: '50% 80% 30% 40%',
            transform: 'rotate(300deg) scale(1.02)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        // Glassmorphism Shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Colored Shadows
        'primary': '0 10px 25px -5px rgba(99, 102, 241, 0.25)',
        'secondary': '0 10px 25px -5px rgba(217, 70, 239, 0.25)',
        'glow-primary': '0 0 40px rgba(99, 102, 241, 0.3)',
        'glow-secondary': '0 0 40px rgba(139, 92, 246, 0.3)',
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