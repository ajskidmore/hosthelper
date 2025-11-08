import { Box, Typography } from '@mui/material';

const Messages = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Messages
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Communicate with property owners and service providers
      </Typography>
      {/* Messaging interface will be implemented here */}
    </Box>
  );
};

export default Messages;
