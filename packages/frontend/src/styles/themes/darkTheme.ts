// Dark Professional Theme
export const darkTheme = {
  gradients: {
    primary: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
    secondary: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
    accent: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
    neural: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    quantum: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
    cyber: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
    darkMesh: 'radial-gradient(at 0% 0%, hsla(220,30%,5%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(220,30%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(220,30%,3%,1) 0, transparent 50%)',
  },

  colors: {
    background: '#111827',
    surface: '#1F2937',
    surfaceHighlight: '#374151',

    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    aiBlue: '#60A5FA',
    aiPurple: '#A78BFA',
    aiCyan: '#22D3EE',
    aiGreen: '#34D399',
    aiPink: '#F472B6',
    aiOrange: '#FB923C',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    blur: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.1)',
  },

  shadows: {
    glow: '0 0 20px rgba(96, 165, 250, 0.3)',
    aiGlow: '0 0 30px rgba(96, 165, 250, 0.4)',
    neon: '0 0 10px rgba(96, 165, 250, 0.5)',
    elevation: '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
    floating: '0 20px 40px -10px rgba(0, 0, 0, 0.9)',
  },

  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.35s',
      slow: '0.6s',
    },
    easing: {
      smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, sans-serif',
      mono: '"Fira Code", monospace',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export default darkTheme;