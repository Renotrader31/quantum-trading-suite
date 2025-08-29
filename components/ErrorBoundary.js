import React from 'react';
import { Box, Alert, Button, Typography, Paper } from '@mui/material';

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
    // Log the error for debugging
    console.error('🚨 Error Boundary caught error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 4, m: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong with the Options Strategy Engine
            </Typography>
            <Typography variant="body2" paragraph>
              The component encountered an unexpected error. This might be due to:
            </Typography>
            <ul>
              <li>Options engine initialization issue</li>
              <li>Navigation conflict during rendering</li>
              <li>Client-side hydration mismatch</li>
            </ul>
          </Alert>
          
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Debug Information:
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  maxHeight: 300
                }}
              >
                {this.state.error && this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </Box>
            </Box>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;