import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import createModeTheme from './theme';
import { ColorModeProvider, useColorMode } from './contexts/ColorModeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { ContextProvider } from './contexts/ContextProvider';
import Router from './routes';
import { useHealthCheck } from './hooks/useHealthCheck';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';


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
  const isServerHealthy = useHealthCheck();
  if (!isServerHealthy) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#e3edf8"
      }}>
        
        <Box sx={{
          position: "relative",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          minWidth: "300px",
          maxWidth: "600px"
        }}>
            
          <Typography variant="h5" sx={{ textAlign: "center", zIndex: 1, position: "relative" }}>
            Sorry for the trouble, our servers are currently not responding. We will be back soon.
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <ContextProvider>
      <ColorModeProvider>
        <AppContent />
      </ColorModeProvider>
    </ContextProvider>
  );
}

export default App;
