/**
 * Tailwind CSS 配置：AI 侦探风游戏化设计令牌（色彩 / 阴影 / 动画）
 */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        /* 暖可可夜色调：与研小鸿（白色羽毛 + 橙色围巾）表情包相容的深底（纯暖红棕，无绿感） */
        night: {
          DEFAULT: '#2a1710',
          deep: '#1a0d08',
          soft: '#40291a',
          card: '#4e3120',
        },
        /* 品牌主色 = 研小鸿围巾橙 */
        brand: {
          DEFAULT: '#ff8a1c',
          light: '#ffb35c',
          dark: '#e8620c',
        },
        neon: {
          cyan: '#22d3ee',
          pink: '#f472b6',
          amber: '#fbbf24',
          green: '#34d399',
        },
      },
      fontFamily: {
        display: [
          'ui-rounded',
          'Arial Rounded MT Bold',
          'PingFang SC',
          'Microsoft YaHei',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 44px -10px rgba(255, 138, 28, 0.6)',
        'glow-amber': '0 0 36px -6px rgba(255, 170, 60, 0.8)',
        'glow-cyan': '0 0 40px -12px rgba(34, 211, 238, 0.65)',
        'glow-pink': '0 0 40px -10px rgba(255, 92, 138, 0.55)',
        card: '0 20px 44px -20px rgba(23, 14, 9, 0.85)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.55)' },
          '70%': { opacity: '1', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-2px)' },
          '20%, 80%': { transform: 'translateX(4px)' },
          '30%, 50%, 70%': { transform: 'translateX(-7px)' },
          '40%, 60%': { transform: 'translateX(7px)' },
        },
        'rise-float': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
          '18%': { opacity: '1', transform: 'translateY(0) scale(1.05)' },
          '100%': { opacity: '0', transform: 'translateY(-84px) scale(1)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(2) rotate(-18deg)' },
          '60%': { opacity: '1', transform: 'scale(0.92) rotate(-7deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
        },
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 150, 60, 0)' },
          '50%': { boxShadow: '0 0 0 7px rgba(255, 150, 60, 0.3)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-8vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(108vh) rotate(680deg)', opacity: '0.6' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-6px) scale(1.04)' },
          '60%': { transform: 'translateY(0) scale(0.98)' },
        },
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)' },
          '50%': { transform: 'scale(1.18) rotate(4deg)' },
        },
      },
      animation: {
        floaty: 'floaty 3.2s ease-in-out infinite',
        'floaty-slow': 'floaty 5.5s ease-in-out infinite',
        'pop-in': 'pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up': 'fade-up 0.55s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        shake: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'rise-float': 'rise-float 1.5s ease-out both',
        stamp: 'stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pulse-ring': 'pulse-ring 1.6s ease-in-out infinite',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
        'spin-slow': 'spin-slow 16s linear infinite',
        wobble: 'wobble 2.6s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3.2s linear both',
        'bounce-soft': 'bounce-soft 1.2s ease-in-out infinite',
        flame: 'flame 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
