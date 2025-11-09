import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Google as GoogleIcon, Business, Work } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'owner' | 'provider'>('owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Pass the selected role to Google sign-in
      await signInWithGoogle(role);
      // Navigation will happen automatically via App.tsx route protection
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Logo/Brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              HostHelper
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account to get started
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Role Selection - Always visible at top */}
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              I am a...
            </FormLabel>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(_, value) => value && setRole(value)}
              fullWidth
              color="primary"
            >
              <ToggleButton value="owner">
                <Business sx={{ mr: 1 }} />
                Property Owner
              </ToggleButton>
              <ToggleButton value="provider">
                <Work sx={{ mr: 1 }} />
                Service Provider
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>

          {/* Google Sign In - Above the form */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              margin="normal"
              autoComplete="name"
              autoFocus
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              autoComplete="new-password"
              helperText="At least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Creating account...' : 'Create Account with Email'}
            </Button>
          </form>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
