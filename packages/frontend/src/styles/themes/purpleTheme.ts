// Modern Purple Gradient Theme
export const purpleTheme = {
  gradients: {
    primary: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
    secondary: 'linear-gradient(135deg, #312E81 0%, #3730A3 100%)',
    accent: 'linear-gradient(135deg, #3730A3 0%, #4338CA 100%)',
    neural: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    quantum: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
    cyber: 'linear-gradient(135deg, #C084FC 0%, #DDD6FE 100%)',
    darkMesh: 'radial-gradient(at 0% 0%, hsla(250,70%,15%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(250,70%,20%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(250,70%,10%,1) 0, transparent 50%)',
  },

  colors: {
    background: '#0F0A1E',
    surface: '#1E1B4B',
    surfaceHighlight: '#312E81',

    text: '#F8FAFC',
    textSecondary: '#C7D2FE',
    textMuted: '#A5B4FC',

    aiBlue: '#6366F1',
    aiPurple: '#8B5CF6',
    aiCyan: '#06B6D4',
    aiGreen: '#10B981',
    aiPink: '#EC4899',
    aiOrange: '#F97316',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#6366F1',
  },

  glass: {
    light: 'rgba(139, 92, 246, 0.1)',
    medium: 'rgba(139, 92, 246, 0.15)',
    heavy: 'rgba(139, 92, 246, 0.2)',
    blur: 'blur(16px)',
    border: 'rgba(139, 92, 246, 0.3)',
  },

  shadows: {
    glow: '0 0 25px rgba(139, 92, 246, 0.4)',
    aiGlow: '0 0 35px rgba(139, 92, 246, 0.5)',
    neon: '0 0 15px rgba(139, 92, 246, 0.6)',
    elevation: '0 10px 35px -10px rgba(15, 10, 30, 0.6)',
    floating: '0 20px 50px -10px rgba(15, 10, 30, 0.7)',
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

export default purpleTheme;