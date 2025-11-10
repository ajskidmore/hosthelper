import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Home,
  CalendarMonth,
  Task,
  Work,
  AttachMoney,
  Message,
  Notifications,
  AccountCircle,
  Logout,
  SwapHoriz,
  Business,
  PersonOutline,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const MainLayout = () => {
  const { user, signOut, switchRole, addRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSwitchRole = async (newRole: 'owner' | 'provider') => {
    if (!user) return;

    try {
      // If user doesn't have the role yet, add it
      if (!user.roles.includes(newRole)) {
        await addRole(newRole);
      }

      // Switch to the new role
      await switchRole(newRole);

      // Navigate to the appropriate dashboard
      navigate(newRole === 'owner' ? '/owner/dashboard' : '/provider/dashboard');
      handleProfileMenuClose();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  // Navigation items based on user role
  const ownerNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/owner/dashboard' },
    { text: 'Properties', icon: <Home />, path: '/owner/properties' },
    { text: 'Bookings', icon: <CalendarMonth />, path: '/owner/bookings' },
    { text: 'Tasks', icon: <Task />, path: '/owner/tasks' },
    { text: 'Messages', icon: <Message />, path: '/messages' },
  ];

  const providerNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/provider/dashboard' },
    { text: 'Available Jobs', icon: <Work />, path: '/provider/jobs' },
    { text: 'Earnings', icon: <AttachMoney />, path: '/provider/earnings' },
    { text: 'Messages', icon: <Message />, path: '/messages' },
  ];

  const navItems = user?.currentRole === 'owner' ? ownerNavItems : providerNavItems;

  const drawer = (
    <Box>
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          HostHelper
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.currentRole === 'owner' ? 'Property Owner' : 'Service Provider'}
        </Typography>
      </Box>

      <Divider />

      {/* Navigation */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navItems.find((item) => item.path === location.pathname)?.text || 'HostHelper'}
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar src={user?.photoURL} alt={user?.displayName}>
              {user?.displayName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleProfileMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />

        {/* Role Switcher */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Switch Role
          </Typography>
        </Box>
        <MenuItem
          onClick={() => handleSwitchRole('owner')}
          selected={user?.currentRole === 'owner'}
          disabled={user?.currentRole === 'owner'}
        >
          <ListItemIcon>
            <Business fontSize="small" />
          </ListItemIcon>
          Property Owner
          {user?.currentRole === 'owner' && (
            <Typography variant="caption" sx={{ ml: 'auto', color: 'primary.main' }}>
              Current
            </Typography>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleSwitchRole('provider')}
          selected={user?.currentRole === 'provider'}
          disabled={user?.currentRole === 'provider'}
        >
          <ListItemIcon>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
          Service Provider
          {user?.currentRole === 'provider' && (
            <Typography variant="caption" sx={{ ml: 'auto', color: 'primary.main' }}>
              Current
            </Typography>
          )}
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
