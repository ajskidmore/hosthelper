import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  TrendingUp,
  Work,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { timestampToDate } from '../../hooks/useFirestore';

const ProviderEarnings = () => {
  const { tasks: myJobs } = useTasks();

  // Filter jobs that are assigned to provider
  const assignedJobs = myJobs.filter((job) => job.isPublic && job.assignedTo);

  // Separate by status
  const completedJobs = assignedJobs.filter((job) => job.status === 'completed');
  const activeJobs = assignedJobs.filter(
    (job) => job.status === 'assigned' || job.status === 'in_progress'
  );

  // Calculate earnings
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.payRate || 0), 0);
  const pendingEarnings = activeJobs.reduce((sum, job) => sum + (job.payRate || 0), 0);

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      subtitle: `${completedJobs.length} completed jobs`,
      icon: <AttachMoney />,
      color: '#10B981',
    },
    {
      title: 'Pending Earnings',
      value: `$${pendingEarnings.toFixed(2)}`,
      subtitle: `${activeJobs.length} active jobs`,
      icon: <TrendingUp />,
      color: '#F59E0B',
    },
    {
      title: 'Completed Jobs',
      value: completedJobs.length.toString(),
      subtitle: 'All time',
      icon: <CheckCircle />,
      color: '#8B5CF6',
    },
    {
      title: 'Active Jobs',
      value: activeJobs.length.toString(),
      subtitle: 'In progress',
      icon: <Work />,
      color: '#2563EB',
    },
  ];

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
        Earnings & Job History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your earnings and view your completed and active jobs
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
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
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Completed Jobs */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Completed Jobs
        </Typography>
        {completedJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No completed jobs yet
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Completed Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Earnings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedJobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={job.taskType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatDate(job.scheduledFor)}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        size="small"
                        color={getStatusColor(job.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        ${job.payRate?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Active Jobs */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Active Jobs
        </Typography>
        {activeJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Work sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No active jobs
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Scheduled For</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Pay Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeJobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={job.taskType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatDate(job.scheduledFor)}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        size="small"
                        color={getStatusColor(job.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        ${job.payRate?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ProviderEarnings;
