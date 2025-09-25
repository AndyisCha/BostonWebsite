import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

const PreviewApp: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Boston English Platform - Preview Mode
        </Typography>
        <Alert severity="info">
          Preview components have been temporarily removed for deployment.
          They will be restored in future updates.
        </Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is a simplified preview version of the application.
        </Typography>
      </Box>
    </Container>
  );
};

export default PreviewApp;