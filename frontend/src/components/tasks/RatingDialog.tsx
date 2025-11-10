import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  Alert,
} from '@mui/material';
import { Star } from '@mui/icons-material';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  title: string;
  ratingLabel: string;
  feedbackLabel: string;
}

const RatingDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  ratingLabel,
  feedbackLabel,
}: RatingDialogProps) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit(rating, feedback);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(5);
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {ratingLabel}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
              icon={<Star fontSize="inherit" />}
              emptyIcon={<Star fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
            </Typography>
          </Box>
        </Box>

        <TextField
          label={feedbackLabel}
          multiline
          rows={4}
          fullWidth
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience..."
          helperText="Optional: Provide additional feedback"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Skip
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
