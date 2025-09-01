import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';

import store from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import { setTheme } from './store/slices/uiSlice';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import {
  LoginPage,
  SignupPage,
  DashboardPage,
  TeamsPage,
  ProjectsPage,
  KanbanPage,
  ChatPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage
} from './pages';

// Theme configuration - I spent way too long tweaking these colors
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Nice blue that works well
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Good contrast with primary
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Hate when buttons are all caps
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded corners look more modern
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Lighter blue for dark mode
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1', // Softer pink for dark mode
      light: '#fce4ec',
      dark: '#c2185b',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
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
  },
});

// Main app content component - handles auth and routing
function AppContent() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Check auth status on app load
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Update theme when it changes
  useEffect(() => {
    dispatch(setTheme(theme));
  }, [dispatch, theme]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes - no auth required */}
          <Route path="/login" element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/signup" element={
            !isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" replace />
          } />

          {/* Redirect root to dashboard */}
          <Route path="/" element={
            <Navigate to="/dashboard" replace />
          } />

          {/* Protected routes - require authentication */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/kanban/:projectId" element={<KanbanPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Main App component wrapped with error boundary
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
