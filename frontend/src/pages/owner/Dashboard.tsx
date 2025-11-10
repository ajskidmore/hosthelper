import { Grid, Paper, Typography, Box, Card, CardContent, Avatar, Button } from '@mui/material';
import {
  Home,
  CalendarMonth,
  Task as TaskIcon,
  TrendingUp,
  Add,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../hooks/useProperties';
import { useBookings } from '../../hooks/useBookings';
import { useTasks } from '../../hooks/useTasks';
import { timestampToDate } from '../../hooks/useFirestore';
import { motion } from 'framer-motion';
import { gradients, coloredShadows } from '../../theme/theme';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

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

  // Calculate monthly revenue
  const monthlyRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Calculate real chart data from actual bookings
  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }
    return months;
  };

  const last6Months = getLast6Months();
  const revenueData = last6Months.map(({ month, year, monthIndex }) => {
    const monthBookings = bookings.filter(b => {
      const checkIn = timestampToDate(b.checkInDate);
      return checkIn.getFullYear() === year &&
             checkIn.getMonth() === monthIndex &&
             b.status === 'confirmed';
    });
    return {
      month,
      revenue: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      bookings: monthBookings.length,
    };
  });

  // Calculate real occupancy data from bookings
  const occupancyData = properties.slice(0, 5).map(p => {
    const propertyBookings = bookings.filter(b =>
      b.propertyId === p.id &&
      b.status === 'confirmed'
    );

    // Calculate days booked in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = propertyBookings.filter(b => {
      const checkIn = timestampToDate(b.checkInDate);
      return checkIn >= thirtyDaysAgo;
    });

    const totalDaysBooked = recentBookings.reduce((sum, b) => {
      const checkIn = timestampToDate(b.checkInDate);
      const checkOut = timestampToDate(b.checkOutDate);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    const occupancy = Math.min(Math.round((totalDaysBooked / 30) * 100), 100);

    return {
      name: p.name.substring(0, 15),
      occupancy: occupancy || 0,
    };
  });

  // Calculate booking source distribution from real data
  const sourceCount = bookings.reduce((acc, b) => {
    const source = b.source || 'Direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceColors: Record<string, string> = {
    'Airbnb': '#FF5A5F',
    'Booking.com': '#003580',
    'VRBO': '#0D2C58',
    'Direct': '#10B981',
  };

  const bookingSourceData = Object.entries(sourceCount).map(([name, value]) => ({
    name,
    value,
    color: sourceColors[name] || '#6B7280',
  }));

  const hasRealData = bookings.length > 0;

  const stats = [
    {
      title: 'Active Properties',
      value: activeProperties.toString(),
      change: properties.length > 0 ? `${properties.length} total` : 'Add your first',
      icon: <Home />,
      gradient: gradients.primary,
      trend: 'up',
      onClick: () => navigate('/owner/properties'),
    },
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings.toString(),
      change: 'Next 30 days',
      icon: <CalendarMonth />,
      gradient: gradients.success,
      trend: 'up',
      onClick: () => navigate('/owner/bookings'),
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.toString(),
      change: urgentTasks > 0 ? `${urgentTasks} urgent` : 'All on track',
      icon: <TaskIcon />,
      gradient: gradients.warning,
      trend: urgentTasks > 0 ? 'down' : 'neutral',
      onClick: () => navigate('/owner/tasks'),
    },
    {
      title: 'Total Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: `${bookings.length} bookings`,
      icon: <TrendingUp />,
      gradient: gradients.purple,
      trend: 'up',
      onClick: () => navigate('/owner/bookings'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (properties.length === 0) {
    return (
      <Box>
        <EmptyState
          icon={<Home />}
          title="Welcome to HostHelper"
          description="Get started by adding your first property. Once you have properties, you'll see insights, bookings, and performance metrics here."
          actionLabel="Add Your First Property"
          onAction={() => navigate('/owner/properties')}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section with Gradient */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          background: gradients.hero,
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: coloredShadows.xl,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Here's what's happening with your properties today
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/owner/properties')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            Add Property
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CalendarMonth />}
            onClick={() => navigate('/owner/bookings')}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            View Calendar
          </Button>
        </Box>
      </Box>

      {/* Stats Cards with Animation */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              component={motion.div}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={stat.onClick}
              sx={{
                background: 'white',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: coloredShadows.hover,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: stat.gradient,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      background: stat.gradient,
                      boxShadow: coloredShadows.primary,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  {stat.trend !== 'neutral' && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: stat.trend === 'up' ? 'success.main' : 'error.main',
                        bgcolor: stat.trend === 'up' ? 'success.lighter' : 'error.lighter',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {stat.trend === 'up' ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
                    </Box>
                  )}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
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
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            sx={{
              p: 3,
              background: 'white',
              boxShadow: coloredShadows.primary,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Revenue Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasRealData ? 3 : 1 }}>
              Monthly revenue and booking trends
            </Typography>
            {!hasRealData && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                Add bookings to see real revenue data here
              </Alert>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#667eea"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Booking Sources Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            sx={{
              p: 3,
              background: 'white',
              boxShadow: coloredShadows.secondary,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Booking Sources
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasRealData ? 3 : 1 }}>
              Distribution by platform
            </Typography>
            {!hasRealData && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                Add bookings with source information to see distribution
              </Alert>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Property Occupancy Bar Chart */}
        <Grid item xs={12}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            sx={{
              p: 3,
              background: 'white',
              boxShadow: coloredShadows.purple,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Property Occupancy Rates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasRealData ? 3 : 1 }}>
              Average occupancy by property (last 30 days)
            </Typography>
            {!hasRealData && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                Add bookings to see occupancy rates
              </Alert>
            )}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="occupancy" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage your properties efficiently
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/owner/properties')}
                sx={{
                  background: gradients.primary,
                  boxShadow: coloredShadows.primary,
                  '&:hover': {
                    background: gradients.primary,
                    transform: 'translateY(-2px)',
                    boxShadow: coloredShadows.hover,
                  },
                  transition: 'all 0.3s',
                }}
              >
                Add Property
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarMonth />}
                onClick={() => navigate('/owner/bookings')}
                sx={{
                  background: gradients.success,
                  boxShadow: coloredShadows.secondary,
                  '&:hover': {
                    background: gradients.success,
                    transform: 'translateY(-2px)',
                    boxShadow: coloredShadows.hover,
                  },
                  transition: 'all 0.3s',
                }}
              >
                Create Booking
              </Button>
              <Button
                variant="contained"
                startIcon={<TaskIcon />}
                onClick={() => navigate('/owner/tasks')}
                sx={{
                  background: gradients.warning,
                  boxShadow: coloredShadows.orange,
                  '&:hover': {
                    background: gradients.warning,
                    transform: 'translateY(-2px)',
                    boxShadow: coloredShadows.hover,
                  },
                  transition: 'all 0.3s',
                }}
              >
                Create Task
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;
