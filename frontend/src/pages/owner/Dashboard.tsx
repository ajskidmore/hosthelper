import { Grid, Paper, Typography, Box, Card, CardContent, Avatar, Chip } from '@mui/material';
import {
  Home,
  CalendarMonth,
  Task as TaskIcon,
  TrendingUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - will be replaced with actual data from GraphQL
const stats = [
  {
    title: 'Active Properties',
    value: '3',
    change: '+1 this month',
    icon: <Home />,
    color: '#2563EB',
  },
  {
    title: 'Upcoming Bookings',
    value: '6',
    change: 'Next 30 days',
    icon: <CalendarMonth />,
    color: '#10B981',
  },
  {
    title: 'Pending Tasks',
    value: '4',
    change: '2 urgent',
    icon: <TaskIcon />,
    color: '#F59E0B',
  },
  {
    title: 'Monthly Revenue',
    value: '$8,450',
    change: '+12% from last month',
    icon: <TrendingUp />,
    color: '#8B5CF6',
  },
];

const recentBookings = [
  {
    id: 1,
    property: 'Downtown Luxury Apartment',
    guest: 'Robert Smith',
    checkIn: '2025-11-15',
    checkOut: '2025-11-18',
    status: 'confirmed',
  },
  {
    id: 2,
    property: 'Cozy Beach House',
    guest: 'Emily Davis',
    checkIn: '2025-11-20',
    checkOut: '2025-11-25',
    status: 'confirmed',
  },
  {
    id: 3,
    property: 'Downtown Luxury Apartment',
    guest: 'Michael Brown',
    checkIn: '2025-11-28',
    checkOut: '2025-12-01',
    status: 'pending',
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: 'Pre-arrival Cleaning',
    property: 'Downtown Luxury Apartment',
    dueDate: '2025-11-14',
    priority: 'high',
    assignedTo: 'Mike Wilson',
  },
  {
    id: 2,
    title: 'Guest Check-in Assistance',
    property: 'Cozy Beach House',
    dueDate: '2025-11-20',
    priority: 'medium',
    assignedTo: 'David Chen',
  },
  {
    id: 3,
    title: 'Monthly Inspection',
    property: 'Mountain View Cabin',
    dueDate: '2025-11-22',
    priority: 'low',
    assignedTo: 'Unassigned',
  },
];

const occupancyData = [
  { month: 'Jun', rate: 65 },
  { month: 'Jul', rate: 78 },
  { month: 'Aug', rate: 82 },
  { month: 'Sep', rate: 71 },
  { month: 'Oct', rate: 69 },
  { month: 'Nov', rate: 75 },
];

const OwnerDashboard = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your properties.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
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
        {/* Occupancy Rate Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Occupancy Rate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Last 6 months average across all properties
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions / Platform Sync */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Platform Sync
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Last synced: 5 minutes ago
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Airbnb</Typography>
                <Chip label="Synced" size="small" color="success" icon={<CheckCircle />} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Vrbo</Typography>
                <Chip label="Synced" size="small" color="success" icon={<CheckCircle />} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Booking.com</Typography>
                <Chip label="Pending" size="small" color="warning" icon={<Schedule />} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Bookings
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentBookings.map((booking) => (
                <Box
                  key={booking.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {booking.property}
                    </Typography>
                    <Chip label={booking.status} size="small" color={getStatusColor(booking.status)} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Guest: {booking.guest}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.checkIn} → {booking.checkOut}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Upcoming Tasks
            </Typography>
            <Box sx={{ mt: 2 }}>
              {upcomingTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {task.title}
                    </Typography>
                    <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {task.property}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Due: {task.dueDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.assignedTo}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;
