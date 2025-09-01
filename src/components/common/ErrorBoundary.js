import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

// Error boundary component - catches JS errors in component tree
// This is pretty basic but gets the job done for now
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Only log in dev mode to avoid console spam in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Something broke:', error, errorInfo);
    }
  }

  handleReload = () => {
    // Simple reload - could be smarter about this later
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Show fallback UI when something goes wrong
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500
            }}
          >
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. Try refreshing the page.
            </Typography>
            
            <Button
              variant="contained"
              onClick={this.handleReload}
              sx={{ mr: 2 }}
            >
              Reload Page
            </Button>
            
            {/* Show error details in dev mode for debugging */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Dev Mode):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    // Normal render - just pass through the children
    return this.props.children;
  }
}

export default ErrorBoundary;
