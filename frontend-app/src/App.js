import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import createModeTheme from './theme';
import { ColorModeProvider, useColorMode } from './contexts/ColorModeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { ContextProvider } from './contexts/ContextProvider';
import Router from './routes';
function AppContent() {
  const { mode } = useColorMode();
  const theme = createModeTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
}

function App() {
  return (
    <ContextProvider>
      <ColorModeProvider>
        <AppContent />
      </ColorModeProvider>
    </ContextProvider>
  );
}

export default App;
