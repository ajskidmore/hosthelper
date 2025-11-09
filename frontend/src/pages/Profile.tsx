import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Chip,
  Fade,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  PersonOutline,
  Edit,
  CheckCircle,
  Add,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, addRole, switchRole } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const hasOwnerRole = user?.roles.includes('owner');
  const hasProviderRole = user?.roles.includes('provider');

  const handleAddRole = async (role: 'owner' | 'provider') => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await addRole(role);
      setSuccess(`${role === 'owner' ? 'Property Owner' : 'Service Provider'} role added! You can now access both sides of the platform.`);
    } catch (err: any) {
      setError(err.message || `Failed to add ${role} role`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (role: 'owner' | 'provider') => {
    if (user?.currentRole === role) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await switchRole(role);
      setSuccess(`Switched to ${role === 'owner' ? 'Property Owner' : 'Service Provider'} view!`);
    } catch (err: any) {
      setError(err.message || 'Failed to switch role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and profile information
      </Typography>

      {/* Error/Success Messages */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      </Collapse>
      <Collapse in={!!success}>
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Collapse>

      <Grid container spacing={3}>
        {/* Profile Information Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={user?.photoURL}
                  alt={user?.displayName}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  {user?.displayName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {user?.roles.map((role) => (
                      <Chip
                        key={role}
                        size="small"
                        icon={role === 'owner' ? <Business fontSize="small" /> : <PersonOutline fontSize="small" />}
                        label={role === 'owner' ? 'Property Owner' : 'Service Provider'}
                        color={user.currentRole === role ? 'primary' : 'default'}
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {editing ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" onClick={() => setEditing(false)}>
                    Save Changes
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{user?.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Display Name
                    </Typography>
                    <Typography variant="body1">{user?.displayName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Current Role
                    </Typography>
                    <Typography variant="body1">
                      {user?.currentRole === 'owner' ? 'Property Owner' : 'Service Provider'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Available Roles
                    </Typography>
                    <Typography variant="body1">
                      {user?.roles.length} role{user?.roles.length !== 1 ? 's' : ''}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Type Management */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Types
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage your roles and switch between them
              </Typography>

              <List>
                {/* Property Owner */}
                <Fade in timeout={300}>
                  <ListItem
                    sx={{
                      border: '2px solid',
                      borderColor: hasOwnerRole ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: hasOwnerRole ? 'primary.lighter' : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: hasOwnerRole ? 2 : 1,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Business
                        color={hasOwnerRole ? 'primary' : 'action'}
                        sx={{ fontSize: 28 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          Property Owner
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          {hasOwnerRole && user?.currentRole === 'owner' && (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                          <Typography variant="caption">
                            {hasOwnerRole
                              ? user?.currentRole === 'owner'
                                ? 'Currently active'
                                : 'Available'
                              : 'Not activated'}
                          </Typography>
                        </Box>
                      }
                    />
                    {hasOwnerRole ? (
                      <Switch
                        checked={user?.currentRole === 'owner'}
                        onChange={() => handleSwitchRole('owner')}
                        color="primary"
                        disabled={loading || user?.currentRole === 'owner'}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} /> : <Add />}
                        onClick={() => handleAddRole('owner')}
                        disabled={loading}
                      >
                        Add Role
                      </Button>
                    )}
                  </ListItem>
                </Fade>

                {/* Service Provider */}
                <Fade in timeout={300}>
                  <ListItem
                    sx={{
                      border: '2px solid',
                      borderColor: hasProviderRole ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      bgcolor: hasProviderRole ? 'primary.lighter' : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: hasProviderRole ? 2 : 1,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PersonOutline
                        color={hasProviderRole ? 'primary' : 'action'}
                        sx={{ fontSize: 28 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          Service Provider
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          {hasProviderRole && user?.currentRole === 'provider' && (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                          <Typography variant="caption">
                            {hasProviderRole
                              ? user?.currentRole === 'provider'
                                ? 'Currently active'
                                : 'Available'
                              : 'Not activated'}
                          </Typography>
                        </Box>
                      }
                    />
                    {hasProviderRole ? (
                      <Switch
                        checked={user?.currentRole === 'provider'}
                        onChange={() => handleSwitchRole('provider')}
                        color="primary"
                        disabled={loading || user?.currentRole === 'provider'}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} /> : <Add />}
                        onClick={() => handleAddRole('provider')}
                        disabled={loading}
                      >
                        Add Role
                      </Button>
                    )}
                  </ListItem>
                </Fade>
              </List>

              {user?.roles.length === 2 && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.lighter' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="success.dark">
                      You have access to both sides!
                    </Typography>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
