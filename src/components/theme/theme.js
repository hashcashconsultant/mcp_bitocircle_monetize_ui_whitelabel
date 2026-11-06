import { createTheme } from '@mui/material/styles';
import WHITELABEL from '@/config/whitelabel';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    // Brand colors come from src/config/whitelabel.js
    primary: WHITELABEL.colors.primary,
    secondary: WHITELABEL.colors.secondary,
    background: WHITELABEL.colors.background,
    text: WHITELABEL.colors.text,
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: WHITELABEL.fonts.body,
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Custom Scrollbar Styles
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0a0a0a',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #2563eb 0%, #1e40af 100%)',
            borderRadius: '10px',
            border: '1px solid #0a0a0a',
            transition: 'all 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
            border: '1px solid #1a1a1a',
          },
          '&::-webkit-scrollbar-thumb:active': {
            background: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%)',
          },
          // Firefox Scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: '#2563eb #0a0a0a',
          // Apply to all scrollable elements
          '*::-webkit-scrollbar': {
            width: '5px',
            height: '5px',
          },
          '*::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.7) 0%, rgba(30, 64, 175, 0.7) 100%)',
            borderRadius: '10px',
            border: '1px solid transparent',
            backgroundClip: 'padding-box',
            transition: 'all 0.3s ease',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
            backgroundClip: 'padding-box',
          },
          '*::-webkit-scrollbar-thumb:active': {
            background: 'linear-gradient(180deg, #2563eb 0%, #1e40af 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f0f0f',
          borderRight: '1px solid #2a2a2a',
        },
      },
    },
  },
});