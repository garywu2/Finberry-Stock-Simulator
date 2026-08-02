import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Legacy MUI theme, extracted from App.jsx. Kept for the not-yet-migrated pages;
// new UI uses Tailwind + shadcn (see docs/redesign). The former
// `MuiButton.styleOverrides.root.color = 'secondary'` was an invalid CSS color
// (a no-op) and has been removed.
export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#6511F5' },
      secondary: { main: '#12ce60' },
      info: { main: '#F8F9FA', contrastText: '#212529' },
    },
    typography: {
      fontFamily: 'Fredoka, Varela Round, Ubuntu, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 'bold',
          },
        },
      },
    },
  })
);

export default theme;
