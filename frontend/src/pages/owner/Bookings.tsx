import { Box, Typography } from '@mui/material';

const OwnerBookings = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View and manage all your property bookings with calendar views
      </Typography>
      {/* Booking calendar and management UI will be implemented here */}
    </Box>
  );
};

export default OwnerBookings;
