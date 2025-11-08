import { Box, Typography } from '@mui/material';

const ProviderJobs = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Available Jobs
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Browse and accept job opportunities in your area
      </Typography>
      {/* Job marketplace UI will be implemented here */}
    </Box>
  );
};

export default ProviderJobs;
