import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Simple loading spinner component - used throughout the app
// TODO: Maybe add some animation variations later
const LoadingSpinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
