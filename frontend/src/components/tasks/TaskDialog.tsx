import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Task, TaskType, TaskPriority, TaskStatus } from '../../types';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  task?: Task | null;
  propertyId: string;
}

const taskTypes: { value: TaskType; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'check_in', label: 'Check-in' },
  { value: 'check_out', label: 'Check-out' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'restocking', label: 'Restocking' },
  { value: 'other', label: 'Other' },
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'posted', label: 'Posted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TaskDialog = ({ open, onClose, onSave, task, propertyId }: TaskDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'cleaning' as TaskType,
    priority: 'medium' as TaskPriority,
    status: 'posted' as TaskStatus,
    isPublic: false,
    scheduledFor: '',
    estimatedDuration: '',
    payRate: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        priority: task.priority,
        status: task.status,
        isPublic: task.isPublic,
        scheduledFor: task.scheduledFor.toString().split('T')[0],
        estimatedDuration: task.estimatedDuration?.toString() || '',
        payRate: task.payRate?.toString() || '',
        location: task.location || '',
        notes: task.notes || '',
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        taskType: 'cleaning',
        priority: 'medium',
        status: 'posted',
        isPublic: false,
        scheduledFor: '',
        estimatedDuration: '',
        payRate: '',
        location: '',
        notes: '',
      });
    }
  }, [task, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const taskData: Partial<Task> = {
        propertyId,
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        priority: formData.priority,
        status: formData.status,
        isPublic: formData.isPublic,
        scheduledFor: new Date(formData.scheduledFor),
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : 0,
        payRate: formData.payRate ? parseFloat(formData.payRate) : 0,
        location: formData.location || '',
        notes: formData.notes || '',
      };

      await onSave(taskData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Task Type"
              value={formData.taskType}
              onChange={(e) => handleChange('taskType', e.target.value)}
            >
              {taskTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  {priority.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Scheduled For"
              value={formData.scheduledFor}
              onChange={(e) => handleChange('scheduledFor', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                />
              }
              label={formData.isPublic ? "Posted Job (visible to service providers)" : "Internal Note (private, only visible to you)"}
            />
          </Grid>

          {formData.isPublic && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Estimated Duration (minutes)"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleChange('estimatedDuration', e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Pay Rate"
                  value={formData.payRate}
                  onChange={(e) => handleChange('payRate', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                  helperText="Required for posted jobs"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location / Address"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !formData.title ||
            !formData.description ||
            !formData.scheduledFor ||
            (formData.isPublic && !formData.payRate)
          }
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
