import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client';
import { theme } from './theme/theme';
import { apolloClient } from './graphql/client';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerProperties from './pages/owner/Properties';
import OwnerBookings from './pages/owner/Bookings';
import OwnerTasks from './pages/owner/Tasks';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderJobs from './pages/provider/Jobs';
import ProviderEarnings from './pages/provider/Earnings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

// Layout
import MainLayout from './components/layout/MainLayout';

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'provider';
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow access if user has the role in their roles array (even if not currently active)
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect to appropriate dashboard based on current role */}
        <Route
          index
          element={
            user?.currentRole === 'owner' ? (
              <Navigate to="/owner/dashboard" replace />
            ) : (
              <Navigate to="/provider/dashboard" replace />
            )
          }
        />

        {/* Owner Routes */}
        <Route
          path="owner/dashboard"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/properties"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/bookings"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/tasks"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerTasks />
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route
          path="provider/dashboard"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="provider/jobs"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="provider/earnings"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderEarnings />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
