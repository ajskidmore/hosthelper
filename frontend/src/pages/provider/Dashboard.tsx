import { Grid, Paper, Typography, Box, Card, CardContent, Avatar } from '@mui/material';
import { Work, AttachMoney, Star, TrendingUp } from '@mui/icons-material';

const stats = [
  {
    title: 'Available Jobs',
    value: '12',
    change: 'In your area',
    icon: <Work />,
    color: '#2563EB',
  },
  {
    title: 'Active Tasks',
    value: '3',
    change: 'In progress',
    icon: <Work />,
    color: '#10B981',
  },
  {
    title: 'This Month Earnings',
    value: '$2,840',
    change: '+18% from last month',
    icon: <AttachMoney />,
    color: '#8B5CF6',
  },
  {
    title: 'Rating',
    value: '4.8',
    change: '127 completed jobs',
    icon: <Star />,
    color: '#F59E0B',
  },
];

const ProviderDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's your performance overview.
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
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent jobs and earnings will appear here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard;
