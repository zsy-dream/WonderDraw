// 童话·奇境 主题配置
// Claymorphism 风格 + 多巴胺配色

export const colors = {
  // 主色调 - 多巴胺配色
  background: '#FFF5E6',    // 温暖的米色背景
  primary: '#FF6B6B',       // 活力红色（主色调）
  secondary: '#FFD93D',     // 明亮黄色（辅助色）
  accent: '#6BCF7F',        // 清新绿色
  purple: '#A78BFA',        // 梦幻紫色
  blue: '#60A5FA',          // 天空蓝
  
  // 中性色
  white: '#FFFFFF',
  black: '#2D3748',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 状态色
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Claymorphism 阴影效果
export const shadows = {
  // 凸起效果（按钮、卡片）
  raised: `
    8px 8px 16px rgba(209, 139, 71, 0.2),
    -8px -8px 16px rgba(255, 255, 255, 0.8)
  `,
  
  // 凹陷效果（输入框）
  inset: `
    inset 4px 4px 8px rgba(209, 139, 71, 0.15),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7)
  `,
  
  // 悬浮效果
  hover: `
    12px 12px 24px rgba(209, 139, 71, 0.25),
    -12px -12px 24px rgba(255, 255, 255, 0.9)
  `,
  
  // 轻微阴影
  soft: `
    4px 4px 8px rgba(209, 139, 71, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.6)
  `,
};

// 圆角配置
export const borderRadius = {
  sm: '12px',
  md: '20px',
  lg: '32px',
  xl: '48px',
  full: '9999px',
};

// 动画配置
export const animations = {
  // 弹性动画
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
  
  // 平滑过渡
  smooth: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  
  // 弹跳效果
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
};

// 字体配置
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '"Comic Sans MS", "Marker Felt", cursive',
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// 间距配置
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  '2xl': '4rem',  // 64px
};

// 导出完整主题对象
const theme = {
  colors,
  shadows,
  borderRadius,
  animations,
  typography,
  spacing,
};

export default theme;
