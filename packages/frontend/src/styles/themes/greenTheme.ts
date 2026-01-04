// Modern Green Tech Theme
export const greenTheme = {
  gradients: {
    primary: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    secondary: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
    accent: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    neural: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    quantum: 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
    cyber: 'linear-gradient(135deg, #6EE7B7 0%, #A7F3D0 100%)',
    darkMesh: 'radial-gradient(at 0% 0%, hsla(160,90%,15%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(160,90%,20%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(160,90%,10%,1) 0, transparent 50%)',
  },

  colors: {
    background: '#022C22',
    surface: '#064E3B',
    surfaceHighlight: '#065F46',

    text: '#ECFDF5',
    textSecondary: '#A7F3D0',
    textMuted: '#6EE7B7',

    aiBlue: '#06B6D4',
    aiPurple: '#8B5CF6',
    aiCyan: '#22D3EE',
    aiGreen: '#10B981',
    aiPink: '#EC4899',
    aiOrange: '#F97316',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },

  glass: {
    light: 'rgba(16, 185, 129, 0.1)',
    medium: 'rgba(16, 185, 129, 0.15)',
    heavy: 'rgba(16, 185, 129, 0.2)',
    blur: 'blur(16px)',
    border: 'rgba(16, 185, 129, 0.3)',
  },

  shadows: {
    glow: '0 0 25px rgba(16, 185, 129, 0.4)',
    aiGlow: '0 0 35px rgba(16, 185, 129, 0.5)',
    neon: '0 0 15px rgba(16, 185, 129, 0.6)',
    elevation: '0 10px 35px -10px rgba(2, 44, 34, 0.6)',
    floating: '0 20px 50px -10px rgba(2, 44, 34, 0.7)',
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

export default greenTheme;