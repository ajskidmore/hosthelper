import { Box, Typography } from '@mui/material';

const ProviderEarnings = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Earnings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Track your earnings and job history
      </Typography>
      {/* Earnings dashboard will be implemented here */}
    </Box>
  );
};

export default ProviderEarnings;
