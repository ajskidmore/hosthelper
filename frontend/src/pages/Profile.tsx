import { Box, Typography } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your account settings and profile information
      </Typography>
      {/* Profile management UI will be implemented here */}
    </Box>
  );
};

export default Profile;
