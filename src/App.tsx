import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Boston English Platform
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Frontend deployed successfully!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Backend API: https://boston-english-server.railway.app/api/v1
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Full features will be restored after initial deployment.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;