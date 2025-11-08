import { Box, Typography } from '@mui/material';

const OwnerProperties = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Properties
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your rental properties - Add, edit, and view property details
      </Typography>
      {/* Property management UI will be implemented here */}
    </Box>
  );
};

export default OwnerProperties;
