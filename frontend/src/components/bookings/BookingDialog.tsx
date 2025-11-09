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
} from '@mui/material';
import { Booking, BookingSource, BookingStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bookingData: Partial<Booking>) => Promise<void>;
  booking?: Booking | null;
  propertyId: string;
}

const bookingSources: { value: BookingSource; label: string }[] = [
  { value: 'direct', label: 'Direct Booking' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'vrbo', label: 'VRBO' },
  { value: 'booking', label: 'Booking.com' },
];

const bookingStatuses: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BookingDialog = ({ open, onClose, onSave, booking, propertyId }: BookingDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    checkInDate: '',
    checkOutDate: '',
    bookingSource: 'direct' as BookingSource,
    status: 'confirmed' as BookingStatus,
    totalPrice: 0,
    specialRequests: '',
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone || '',
        numberOfGuests: booking.numberOfGuests,
        checkInDate: booking.checkInDate.toString().split('T')[0],
        checkOutDate: booking.checkOutDate.toString().split('T')[0],
        bookingSource: booking.bookingSource,
        status: booking.status,
        totalPrice: booking.totalPrice,
        specialRequests: booking.specialRequests || '',
      });
    }
  }, [booking]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a booking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData: Partial<Booking> = {
        propertyId,
        ownerId: user.id,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone || '',
        numberOfGuests: formData.numberOfGuests,
        checkInDate: new Date(formData.checkInDate),
        checkOutDate: new Date(formData.checkOutDate),
        bookingSource: formData.bookingSource,
        status: formData.status,
        totalPrice: formData.totalPrice,
        specialRequests: formData.specialRequests || '',
      };

      await onSave(bookingData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{booking ? 'Edit Booking' : 'Add New Booking'}</DialogTitle>
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
              label="Guest Name"
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="email"
              label="Guest Email"
              value={formData.guestEmail}
              onChange={(e) => handleChange('guestEmail', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guest Phone"
              value={formData.guestPhone}
              onChange={(e) => handleChange('guestPhone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Check-in Date"
              value={formData.checkInDate}
              onChange={(e) => handleChange('checkInDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Check-out Date"
              value={formData.checkOutDate}
              onChange={(e) => handleChange('checkOutDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Guests"
              value={formData.numberOfGuests}
              onChange={(e) => handleChange('numberOfGuests', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Total Price"
              value={formData.totalPrice}
              onChange={(e) => handleChange('totalPrice', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Booking Source"
              value={formData.bookingSource}
              onChange={(e) => handleChange('bookingSource', e.target.value)}
            >
              {bookingSources.map((source) => (
                <MenuItem key={source.value} value={source.value}>
                  {source.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {bookingStatuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Special Requests"
              value={formData.specialRequests}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
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
            !formData.guestName ||
            !formData.guestEmail ||
            !formData.checkInDate ||
            !formData.checkOutDate
          }
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {booking ? 'Save Changes' : 'Add Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;
