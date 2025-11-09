import { Grid, Paper, Typography, Box, Card, CardContent, Avatar, Button, Chip } from '@mui/material';
import { Work, AttachMoney, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAvailableJobs, useTasks } from '../../hooks/useTasks';
import { timestampToDate } from '../../hooks/useFirestore';

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

  const stats = [
    {
      title: 'Available Jobs',
      value: availableJobs.length.toString(),
      change: 'Browse and accept',
      icon: <Work />,
      color: '#2563EB',
      onClick: () => navigate('/provider/jobs'),
    },
    {
      title: 'Active Jobs',
      value: activeJobs.length.toString(),
      change: activeJobs.length > 0 ? 'In progress' : 'No active jobs',
      icon: <Work />,
      color: '#10B981',
      onClick: () => navigate('/provider/jobs'),
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      change: `${completedJobs.length} completed`,
      icon: <AttachMoney />,
      color: '#8B5CF6',
      onClick: () => navigate('/provider/earnings'),
    },
    {
      title: 'Completed Jobs',
      value: completedJobs.length.toString(),
      change: 'All time',
      icon: <CheckCircle />,
      color: '#F59E0B',
      onClick: () => navigate('/provider/earnings'),
    },
  ];

  // Get recent jobs (last 5)
  const recentJobs = [...assignedJobs, ...completedJobs]
    .sort((a, b) => timestampToDate(b.scheduledFor).getTime() - timestampToDate(a.scheduledFor).getTime())
    .slice(0, 5);

  const formatDate = (date: any) => {
    return timestampToDate(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'assigned':
        return 'primary';
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
        Welcome back! Here's your performance overview.
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
        {/* Recent Jobs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Jobs
              </Typography>
              <Button size="small" onClick={() => navigate('/provider/jobs')}>
                View All
              </Button>
            </Box>
            {recentJobs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No jobs yet. Browse available jobs to get started!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/provider/jobs')}
                  sx={{ mt: 2 }}
                >
                  Browse Jobs
                </Button>
              </Box>
            ) : (
              <Box>
                {recentJobs.map((job) => (
                  <Box
                    key={job.id}
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
                    onClick={() => navigate('/provider/jobs')}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {job.title}
                      </Typography>
                      <Chip
                        label={job.status}
                        size="small"
                        color={getStatusColor(job.status) as any}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {job.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(job.scheduledFor)}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${job.payRate?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Navigate to key sections
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/provider/jobs')}
              >
                Browse Available Jobs
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/provider/earnings')}
              >
                View Earnings
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/messages')}
              >
                Messages
              </Button>
            </Box>

            {/* Earnings Summary */}
            {completedJobs.length > 0 && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                  Total Earnings
                </Typography>
                <Typography variant="h4" color="success.dark" fontWeight={700}>
                  ${totalEarnings.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="success.dark">
                  From {completedJobs.length} completed job{completedJobs.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;
