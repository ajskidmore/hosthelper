import { Grid, Paper, Typography, Box, Card, CardContent, Avatar, Button, LinearProgress, Chip, Alert } from '@mui/material';
import { Work, AttachMoney, CheckCircle, TrendingUp, ArrowUpward, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAvailableJobs, useTasks } from '../../hooks/useTasks';
import { timestampToDate } from '../../hooks/useFirestore';
import { motion } from 'framer-motion';
import { gradients, coloredShadows } from '../../theme/theme';
import { AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import EmptyState from '../../components/common/EmptyState';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { jobs: availableJobs } = useAvailableJobs();
  const { tasks: myTasks } = useTasks();

  // Calculate real stats
  const assignedJobs = myTasks.filter(t => t.isPublic && t.assignedTo);
  const activeJobs = assignedJobs.filter(t => t.status === 'assigned' || t.status === 'in_progress');
  const completedJobs = myTasks.filter(t => t.status === 'completed');

  // Calculate earnings from completed jobs
  const totalEarnings = completedJobs.reduce((sum, task) => sum + (task.payRate || 0), 0);
  const thisMonthEarnings = completedJobs
    .filter(t => {
      const completedDate = timestampToDate(t.scheduledFor);
      const now = new Date();
      return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, task) => sum + (task.payRate || 0), 0);

  // Calculate real earnings data from completed tasks
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
  const earningsData = last6Months.map(({ month, year, monthIndex }) => {
    const monthTasks = completedJobs.filter(t => {
      const completedDate = timestampToDate(t.completedAt || t.scheduledFor);
      return completedDate.getFullYear() === year &&
             completedDate.getMonth() === monthIndex;
    });
    return {
      month,
      earnings: monthTasks.reduce((sum, t) => sum + (t.payRate || 0), 0),
    };
  });

  // Calculate real job type distribution from all assigned tasks
  const jobTypeCounts = assignedJobs.reduce((acc, task) => {
    const type = task.taskType || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const taskTypeColors: Record<string, string> = {
    'cleaning': '#2563EB',
    'maintenance': '#10B981',
    'inspection': '#F59E0B',
    'repair': '#EF4444',
    'landscaping': '#8B5CF6',
    'other': '#6B7280',
  };

  const jobTypeData = Object.entries(jobTypeCounts).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: taskTypeColors[name] || '#6B7280',
  }));

  const hasRealData = assignedJobs.length > 0;

  const completionRate = completedJobs.length > 0
    ? Math.round((completedJobs.length / (completedJobs.length + activeJobs.length)) * 100)
    : 0;

  const stats = [
    {
      title: 'Available Jobs',
      value: availableJobs.length.toString(),
      change: 'Browse now',
      icon: <Work />,
      gradient: gradients.ocean,
      trend: 'up',
      onClick: () => navigate('/provider/jobs'),
    },
    {
      title: 'Active Jobs',
      value: activeJobs.length.toString(),
      change: 'In progress',
      icon: <Work />,
      gradient: gradients.success,
      trend: activeJobs.length > 0 ? 'up' : 'neutral',
      onClick: () => navigate('/provider/jobs'),
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(0)}`,
      change: `${completedJobs.length} completed`,
      icon: <AttachMoney />,
      gradient: gradients.purple,
      trend: 'up',
      onClick: () => navigate('/provider/earnings'),
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: 'All time',
      icon: <CheckCircle />,
      gradient: gradients.warning,
      trend: 'up',
      onClick: () => navigate('/provider/earnings'),
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
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <Box>
      {/* Welcome Banner with Gradient */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          background: gradients.ocean,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Welcome Back, Provider!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              You're doing great! Here's your performance overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <Star sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  4.9
                </Typography>
                <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9 }}>
                  Rating
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {completedJobs.length} Jobs Completed
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/provider/jobs')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            Browse Available Jobs
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
        {stats.map((stat) => (
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
                        color: 'success.main',
                        bgcolor: 'success.lighter',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      <ArrowUpward sx={{ fontSize: 16 }} />
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
        {/* Earnings Chart */}
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
              Earnings Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasRealData ? 3 : 1 }}>
              Your monthly earnings trend
            </Typography>
            {!hasRealData && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                Complete jobs to see your earnings data here
              </Alert>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
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
                  dataKey="earnings"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Job Types Pie Chart */}
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
              Jobs by Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: hasRealData ? 3 : 1 }}>
              Your specialization breakdown
            </Typography>
            {!hasRealData && (
              <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                Accept jobs to see your task type distribution
              </Alert>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {jobTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
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
              Performance Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Track your service quality
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Completion Rate</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">{completionRate}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    background: gradients.success,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Response Time</Typography>
                <Typography variant="body2" fontWeight={600} color="info.main">95%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={95}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    background: gradients.info,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Client Satisfaction</Typography>
                <Typography variant="body2" fontWeight={600} color="warning.main">98%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={98}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    background: gradients.warning,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats & Actions */}
        <Grid item xs={12} md={6}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              This Month's Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your performance highlights
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">Earnings This Month</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ${thisMonthEarnings.toFixed(0)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">Active Jobs</Typography>
                <Chip label={activeJobs.length} color="primary" size="small" />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">Available Opportunities</Typography>
                <Chip label={availableJobs.length} color="secondary" size="small" />
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/provider/jobs')}
              sx={{
                background: gradients.ocean,
                boxShadow: coloredShadows.primary,
                '&:hover': {
                  background: gradients.ocean,
                  transform: 'translateY(-2px)',
                  boxShadow: coloredShadows.hover,
                },
                transition: 'all 0.3s',
              }}
            >
              View All Jobs
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;
