import { Grid, Paper, Typography, Box, Card, CardContent, Avatar, Chip, Button } from '@mui/material';
import {
  Home,
  CalendarMonth,
  Task as TaskIcon,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../hooks/useProperties';
import { useBookings } from '../../hooks/useBookings';
import { useTasks } from '../../hooks/useTasks';
import { timestampToDate } from '../../hooks/useFirestore';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { bookings } = useBookings();
  const { tasks } = useTasks();

  // Calculate stats from real data
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const upcomingBookings = bookings.filter(b =>
    b.status === 'confirmed' &&
    timestampToDate(b.checkInDate) > new Date()
  ).length;
  const pendingTasks = tasks.filter(t => t.status === 'posted' || t.status === 'assigned').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

  // Calculate monthly revenue (sum of all bookings)
  const monthlyRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = [
    {
      title: 'Active Properties',
      value: activeProperties.toString(),
      change: properties.length > 0 ? `${properties.length} total` : 'Add your first property',
      icon: <Home />,
      color: '#2563EB',
      onClick: () => navigate('/owner/properties'),
    },
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings.toString(),
      change: 'Next 30 days',
      icon: <CalendarMonth />,
      color: '#10B981',
      onClick: () => navigate('/owner/bookings'),
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.toString(),
      change: urgentTasks > 0 ? `${urgentTasks} urgent` : 'All on track',
      icon: <TaskIcon />,
      color: '#F59E0B',
      onClick: () => navigate('/owner/tasks'),
    },
    {
      title: 'Total Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: `${bookings.length} bookings`,
      icon: <TrendingUp />,
      color: '#8B5CF6',
      onClick: () => navigate('/owner/bookings'),
    },
  ];

  // Get recent bookings (max 3)
  const recentBookings = bookings
    .filter(b => timestampToDate(b.checkInDate) > new Date())
    .sort((a, b) => timestampToDate(a.checkInDate).getTime() - timestampToDate(b.checkInDate).getTime())
    .slice(0, 3);

  // Get upcoming tasks (max 3)
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => timestampToDate(a.scheduledFor).getTime() - timestampToDate(b.scheduledFor).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked_in':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date: any) => {
    return timestampToDate(date).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your properties.
      </Typography>

      {/* Stats Cards - All Clickable */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                  borderColor: 'primary.main',
                },
              }}
              onClick={stat.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>{stat.icon}</Avatar>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started with your properties
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/owner/properties')}
              >
                Add Property
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                onClick={() => navigate('/owner/bookings')}
              >
                Create Booking
              </Button>
              <Button
                variant="outlined"
                startIcon={<TaskIcon />}
                onClick={() => navigate('/owner/tasks')}
              >
                Create Task
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Bookings
              </Typography>
              <Button size="small" onClick={() => navigate('/owner/bookings')}>
                View All
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              {recentBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming bookings yet
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<Add />}
                    onClick={() => navigate('/owner/bookings')}
                    sx={{ mt: 2 }}
                  >
                    Add Booking
                  </Button>
                </Box>
              ) : (
                recentBookings.map((booking) => (
                  <Box
                    key={booking.id}
                    onClick={() => navigate('/owner/bookings')}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {properties.find(p => p.id === booking.propertyId)?.name || 'Property'}
                      </Typography>
                      <Chip label={booking.status} size="small" color={getStatusColor(booking.status) as any} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Guest: {booking.guestName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Upcoming Tasks
              </Typography>
              <Button size="small" onClick={() => navigate('/owner/tasks')}>
                View All
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              {upcomingTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No pending tasks
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<Add />}
                    onClick={() => navigate('/owner/tasks')}
                    sx={{ mt: 2 }}
                  >
                    Create Task
                  </Button>
                </Box>
              ) : (
                upcomingTasks.map((task) => (
                  <Box
                    key={task.id}
                    onClick={() => navigate('/owner/tasks')}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {task.title}
                      </Typography>
                      <Chip label={task.priority} size="small" color={getPriorityColor(task.priority) as any} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {properties.find(p => p.id === task.propertyId)?.name || 'Property'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Due: {formatDate(task.scheduledFor)}
                      </Typography>
                      <Chip
                        label={task.isPublic ? 'Public Job' : 'Private Note'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;
