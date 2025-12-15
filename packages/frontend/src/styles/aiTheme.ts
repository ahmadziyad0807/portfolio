// Modern Dynamic AI Theme System
export const aiTheme = {
  // Dynamic gradient backgrounds
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', // Blue to Purple
    secondary: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)', // Pink to Rose
    accent: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', // Cyan to Blue
    neural: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)', // Emerald to Cyan
    quantum: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)', // Purple to Fuchsia
    cyber: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', // Amber to Orange
    darkMesh: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
  },

  // AI-inspired color palette
  colors: {
    // Base colors - Deeper, richer dark mode
    background: '#0F172A', // Slate 900
    surface: '#1E293B',    // Slate 800
    surfaceHighlight: '#334155', // Slate 700

    // Text colors
    text: '#F8FAFC',       // Slate 50 (Brighter white)
    textSecondary: '#E2E8F0', // Slate 200 (Much brighter grey)
    textMuted: '#94A3B8',  // Slate 400 (Readable dimmed)

    // AI accent colors - Brighter, neon-like
    aiBlue: '#3B82F6',
    aiPurple: '#8B5CF6',
    aiCyan: '#06B6D4',
    aiGreen: '#10B981',
    aiPink: '#EC4899',
    aiOrange: '#F97316',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Glass morphism effects - Refined for better readability
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    heavy: 'rgba(15, 23, 42, 0.6)',
    blur: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.08)',
  },

  // Dynamic shadows
  shadows: {
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    aiGlow: '0 0 30px rgba(139, 92, 246, 0.6)',
    neon: '0 0 10px rgba(6, 182, 212, 0.7), 0 0 20px rgba(6, 182, 212, 0.4)',
    elevation: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
    floating: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
  },

  // Animation configurations
  animations: {
    duration: {
      fast: '0.2s',
      normal: '0.4s',
      slow: '0.7s',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  // Border radius
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Outfit", "Inter", sans-serif',
      mono: '"Fira Code", monospace',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export default aiTheme;
