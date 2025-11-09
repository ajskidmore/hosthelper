import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem as MenuItemComp,
  Grid,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  TaskAlt as TaskIcon,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';
import { useProperties } from '../../hooks/useProperties';
import TaskDialog from '../../components/tasks/TaskDialog';
import { Task, TaskStatus } from '../../types';
import { timestampToDate } from '../../hooks/useFirestore';

const OwnerTasks = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const { properties } = useProperties();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTask, setMenuTask] = useState<Task | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleOpenDialog = (task?: Task) => {
    setSelectedTask(task || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
        setSuccess('Task updated successfully!');
      } else {
        await addTask(taskData as any);
        setSuccess('Task created successfully!');
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setMenuTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTask(null);
  };

  const handleEdit = () => {
    if (menuTask) {
      handleOpenDialog(menuTask);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (menuTask && confirm(`Are you sure you want to delete "${menuTask.title}"?`)) {
      try {
        await deleteTask(menuTask.id);
        setSuccess('Task deleted successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'posted':
        return 'default';
      case 'assigned':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
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

  const formatDate = (date: any) => {
    return timestampToDate(date).toLocaleDateString();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedProperty !== 'all' && task.propertyId !== selectedProperty) {
      return false;
    }
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    if (filterType === 'public' && !task.isPublic) {
      return false;
    }
    if (filterType === 'private' && task.isPublic) {
      return false;
    }
    return true;
  });

  // Get default property for new tasks
  const defaultPropertyId = properties.length > 0 ? properties[0].id : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Tasks & Jobs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage tasks for your properties and post jobs for service providers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
          disabled={properties.length === 0}
        >
          Create Task
        </Button>
      </Box>

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

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Property</InputLabel>
            <Select
              value={selectedProperty}
              label="Property"
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <MenuItem value="all">All Properties</MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'private')}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="public">Public Jobs</MenuItem>
              <MenuItem value="private">Internal Notes</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="posted">Posted</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {properties.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No properties yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need to add a property before creating tasks
            </Typography>
          </CardContent>
        </Card>
      ) : loading && tasks.length === 0 ? (
        <Typography>Loading tasks...</Typography>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first task or job for your properties
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {properties.find((p) => p.id === task.propertyId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip label={task.taskType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                    />
                  </TableCell>
                  <TableCell>{formatDate(task.scheduledFor)}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.isPublic ? 'Public Job' : 'Private Note'}
                      size="small"
                      variant="outlined"
                      color={task.isPublic ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, task)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Task Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItemComp onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItemComp>
        <MenuItemComp onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItemComp>
      </Menu>

      {/* Task Dialog */}
      {defaultPropertyId && (
        <TaskDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveTask}
          task={selectedTask}
          propertyId={selectedTask?.propertyId || defaultPropertyId}
        />
      )}
    </Box>
  );
};

export default OwnerTasks;
