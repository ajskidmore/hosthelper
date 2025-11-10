import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';
import { animations } from '../../theme/theme';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'dashboard' | 'table';
  count?: number;
}

const LoadingSkeleton = ({ variant = 'card', count = 3 }: LoadingSkeletonProps) => {
  if (variant === 'card') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                ...animations.pulse,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              ...animations.pulse,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  ...animations.pulse,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <CardContent>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={32} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                ...animations.pulse,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...animations.pulse,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (variant === 'table') {
    return (
      <Card
        sx={{
          ...animations.pulse,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <Box sx={{ p: 2 }}>
          {Array.from({ length: count }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                py: 2,
                borderBottom: index < count - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="text" width="20%" height={24} />
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="text" width="15%" height={24} />
              <Skeleton variant="text" width="15%" height={24} />
              <Skeleton variant="text" width="20%" height={24} />
            </Box>
          ))}
        </Box>
      </Card>
    );
  }

  // Default: text variant
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width="100%"
          height={24}
          sx={{
            mb: 1,
            ...animations.pulse,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </Box>
  );
};

export default LoadingSkeleton;
