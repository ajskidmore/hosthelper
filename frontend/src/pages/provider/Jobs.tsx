import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn,
  Schedule,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';
import { useAvailableJobs, useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { Task } from '../../types';
import { timestampToDate } from '../../hooks/useFirestore';

const ProviderJobs = () => {
  const { jobs, loading } = useAvailableJobs();
  const { tasks: myJobs } = useTasks(); // Jobs assigned to provider
  const { updateTask } = useTasks();
  const { user } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleViewDetails = (job: Task) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedJob(null);
  };

  const handleAcceptJob = async (job: Task) => {
    if (!user) return;

    try {
      await updateTask(job.id, {
        assignedTo: user.id,
        status: 'assigned',
      });
      setSuccess('Job accepted! You can now see it in your assigned jobs.');
      handleCloseDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to accept job');
    }
  };

  const formatDate = (date: any) => {
    return timestampToDate(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTaskTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Filter out jobs already assigned to this provider
  const availableJobs = jobs.filter((job) => job.assignedTo !== user?.id);
  const assignedJobs = myJobs.filter((job) => job.isPublic && job.assignedTo === user?.id);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Available Jobs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Browse and accept job opportunities from property owners
      </Typography>

      {/* Success/Error Messages */}
      {success && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Fade>
      )}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Assigned Jobs Section */}
      {assignedJobs.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            My Assigned Jobs ({assignedJobs.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {assignedJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={getTaskTypeLabel(job.taskType)}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={job.status}
                        size="small"
                        color="success"
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {job.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${job.payRate?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(job.scheduledFor)}
                      </Typography>
                    </Box>

                    {job.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button size="small" onClick={() => handleViewDetails(job)}>
                      View Details
                    </Button>
                    <Box>
                      {job.status === 'assigned' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            try {
                              await updateTask(job.id, { status: 'in_progress' });
                              setSuccess('Job status updated to In Progress');
                            } catch (err: any) {
                              setError(err.message || 'Failed to update status');
                            }
                          }}
                        >
                          Start Job
                        </Button>
                      )}
                      {job.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            try {
                              await updateTask(job.id, { status: 'completed' });
                              setSuccess('Job marked as completed!');
                            } catch (err: any) {
                              setError(err.message || 'Failed to update status');
                            }
                          }}
                        >
                          Complete Job
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Jobs Section */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Browse Available Jobs ({availableJobs.length})
      </Typography>

      {loading && availableJobs.length === 0 ? (
        <Typography>Loading jobs...</Typography>
      ) : availableJobs.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No jobs available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new job opportunities
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {availableJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={getTaskTypeLabel(job.taskType)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={job.priority}
                      size="small"
                      color={getPriorityColor(job.priority) as any}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {job.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {job.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      ${job.payRate?.toFixed(2) || '0.00'}
                    </Typography>
                    {job.estimatedDuration && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({job.estimatedDuration} min)
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(job.scheduledFor)}
                    </Typography>
                  </Box>

                  {job.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails(job)}>
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleAcceptJob(job)}
                  >
                    Accept Job
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Job Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedJob.title}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip label={getTaskTypeLabel(selectedJob.taskType)} size="small" sx={{ mr: 1 }} />
                <Chip label={selectedJob.priority} size="small" color={getPriorityColor(selectedJob.priority) as any} />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedJob.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pay Rate
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  ${selectedJob.payRate?.toFixed(2) || '0.00'}
                </Typography>
              </Box>

              {selectedJob.estimatedDuration && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedJob.estimatedDuration} minutes
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Scheduled For
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedJob.scheduledFor)}
                </Typography>
              </Box>

              {selectedJob.location && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {selectedJob.location}
                  </Typography>
                </Box>
              )}

              {selectedJob.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedJob.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {selectedJob && !selectedJob.assignedTo && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => selectedJob && handleAcceptJob(selectedJob)}
            >
              Accept Job
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderJobs;
