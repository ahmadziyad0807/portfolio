// Light Professional Theme
export const lightTheme = {
  gradients: {
    primary: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    secondary: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    accent: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
    neural: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    quantum: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    cyber: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    darkMesh: 'radial-gradient(at 0% 0%, hsla(210,40%,98%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(210,40%,96%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(210,40%,94%,1) 0, transparent 50%)',
  },

  colors: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHighlight: '#F1F5F9',

    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',

    aiBlue: '#3B82F6',
    aiPurple: '#8B5CF6',
    aiCyan: '#06B6D4',
    aiGreen: '#10B981',
    aiPink: '#EC4899',
    aiOrange: '#F97316',

    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },

  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.8)',
    heavy: 'rgba(255, 255, 255, 0.9)',
    blur: 'blur(12px)',
    border: 'rgba(0, 0, 0, 0.1)',
  },

  shadows: {
    glow: '0 0 20px rgba(59, 130, 246, 0.2)',
    aiGlow: '0 0 30px rgba(59, 130, 246, 0.3)',
    neon: '0 0 10px rgba(59, 130, 246, 0.4)',
    elevation: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
    floating: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
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

export default lightTheme;