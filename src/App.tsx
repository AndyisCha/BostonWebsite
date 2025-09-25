import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import { RegistrationForm } from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import { LevelTest } from './components/LevelTest';
import { EbookLibrary } from './components/EbookLibrary';
import UserManagement from './components/UserManagement';
import { LoadingSpinner } from './components/LoadingSpinner';

// Type definitions
export type CEFRLevel =
  | 'A1-1' | 'A1-2' | 'A1-3'
  | 'A2-1' | 'A2-2' | 'A2-3'
  | 'B1-1' | 'B1-2' | 'B1-3'
  | 'B2-1' | 'B2-2' | 'B2-3'
  | 'C1-1' | 'C1-2' | 'C1-3'
  | 'C2-1' | 'C2-2' | 'C2-3';

export type Language = 'ko' | 'en' | 'ja' | 'es' | 'fr';
export type Country = 'KR' | 'US' | 'JP' | 'ES' | 'FR';
export type Category = '문법' | '독해' | '어휘' | '말하기' | '듣기' | '시험대비' | '초급' | '중급' | '고급';

export interface Ebook {
  id: string;
  title: string;
  author: string;
  level: CEFRLevel;
  language: Language;
  country: Country;
  pages: number;
  categories: Category[];
  coverUrl?: string;
  isLocked: boolean;
  isNew: boolean;
  isHot: boolean;
  publishedAt: string;
}

export type SortOption = 'latest' | 'title-asc' | 'level-low' | 'level-high';
export type ViewMode = 'card' | 'list';
export type CoverSize = 'S' | 'M' | 'L';

export interface FilterState {
  search: string;
  levels: CEFRLevel[];
  languages: Language[];
  countries: Country[];
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
            <RegistrationForm onBack={() => window.history.back()} />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="level-test" element={
            <ProtectedRoute roles={['STUDENT']}>
              <LevelTest userId={user?.id || ''} onComplete={() => console.log('Level test completed')} />
            </ProtectedRoute>
          } />

          <Route path="ebooks" element={
            <ProtectedRoute roles={['STUDENT', 'TEACHER', 'PARENT']}>
              <EbookLibrary userId={user?.id || ''} />
            </ProtectedRoute>
          } />

          <Route path="users" element={
            <ProtectedRoute roles={['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN', 'TEACHER']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;