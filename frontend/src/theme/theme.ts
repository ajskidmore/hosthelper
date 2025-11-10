import { createTheme } from '@mui/material/styles';

// HostHelper Brand Colors
const brandColors = {
  primary: {
    main: '#2563EB', // Vibrant blue - trust and professionalism
    light: '#60A5FA',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981', // Green - success and reliability
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  accent: {
    orange: '#F59E0B', // Warm orange for highlights
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
  },
  neutral: {
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
  status: {
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#10B981',
  },
};

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
  secondary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sunset: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  ocean: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
  purple: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
};

// Glassmorphism
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

// Enhanced Shadows with color tints
export const coloredShadows = {
  primary: '0 8px 24px rgba(37, 99, 235, 0.15)',
  secondary: '0 8px 24px rgba(16, 185, 129, 0.15)',
  purple: '0 8px 24px rgba(139, 92, 246, 0.15)',
  orange: '0 8px 24px rgba(245, 158, 11, 0.15)',
  hover: '0 12px 32px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 48px rgba(0, 0, 0, 0.12)',
};

// Animations
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  slideUp: {
    '@keyframes slideUp': {
      from: {
        opacity: 0,
        transform: 'translateY(20px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },
  slideDown: {
    '@keyframes slideDown': {
      from: {
        opacity: 0,
        transform: 'translateY(-20px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },
  scaleIn: {
    '@keyframes scaleIn': {
      from: {
        opacity: 0,
        transform: 'scale(0.9)',
      },
      to: {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
  },
  pulse: {
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.5,
      },
    },
  },
  shimmer: {
    '@keyframes shimmer': {
      '0%': {
        backgroundPosition: '-1000px 0',
      },
      '100%': {
        backgroundPosition: '1000px 0',
      },
    },
  },
};

export const theme = createTheme({
  palette: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    error: {
      main: brandColors.status.error,
    },
    warning: {
      main: brandColors.status.warning,
    },
    info: {
      main: brandColors.status.info,
    },
    success: {
      main: brandColors.status.success,
    },
    background: {
      default: brandColors.neutral[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[600],
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(18).fill('none'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: brandColors.primary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
