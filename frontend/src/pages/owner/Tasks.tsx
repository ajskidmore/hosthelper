import { Box, Typography } from '@mui/material';

const OwnerTasks = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tasks
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Create and manage tasks for your properties - cleaning, maintenance, check-ins
      </Typography>
      {/* Task management UI will be implemented here */}
    </Box>
  );
};

export default OwnerTasks;
